<?php

namespace App\Models;

use App\Data\LeaveData;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class Leave extends Model
{
    protected $fillable = [
        'user_id',
        'leave_type',
        'event_type',
        'event_tag',
        'balance',
        'starts_at',
        'ends_at',
        'status',
        'remarks'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'status' => 'boolean',
        'balance' => 'decimal:3'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function checkBalance(
        Carbon $date,
        User $user,
        string $leaveType
    ): float {
        return self::query()
            ->fromUser($user)
            ->upToDate($date)
            ->where('leave_type', $leaveType)
            ->sum('balance');
    }

    public static function calendarData()
    {
        return self::query()
            ->with("user:id,name")
            ->where('event_type', 'deduction')
            ->whereIn('event_tag', ['leave', 'vacation leave'])
            ->select([
                'id',
                'user_id',
                'leave_type',
                'starts_at',
                'ends_at',
            ])
            ->get()
            ->map(function ($leave) {
                return [
                    'id'            => (string) $leave->id,
                    'user_id'       => $leave->user_id,
                    'title'         => $leave->user->name,
                    'start'         => Carbon::parse($leave->starts_at)->format('Y-m-d'),
                    'end'           => Carbon::parse($leave->ends_at)->format('Y-m-d'),
                    'user'          => $leave->user,
                    'calendarTitle' => $leave->leave_type,
                    'calendarId'    => $leave->leave_type,
                ];
            });
    }

    public static function transactionPerMonth(?User $user, Carbon $date)
    {
        return self::query()->fromUser($user)
            ->whereNotIn('leave_type', ['monthly filing'])
            ->whereMonth('starts_at', $date->month)
            ->whereYear('starts_at', $date->year)
            ->get();
    }

    public static function hasNextMonthAccrual(User $user, Carbon $date): bool
    {
        $start = $date->copy()->startOfMonth();
        $end = $date->copy()->endOfMonth();

        $hasMonthlyFiling = self::query()
            ->whereBelongsTo($user)
            ->where('leave_type', 'monthly filing')
            ->where('status', true)
            ->whereBetween('starts_at', [$start, $end])
            ->exists();

        $hasAccrual = self::query()
            ->whereBelongsTo($user)
            ->whereIn('leave_type', [
                'vacation leave',
                'sick leave',
                'force leave',
            ])
            ->where('event_type', 'accrual')
            ->whereBetween('starts_at', [$start->copy()->addMonthNoOverflow(), $end->copy()->addMonthNoOverflow()])
            ->exists();

        return $hasMonthlyFiling && ! $hasAccrual;
    }

    public function scopeFromUser(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeUpToDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('starts_at', '<=', $date->copy()->endOfMonth());
    }

    public static function allTransactions(Carbon $date, User $user): array
    {
        $start = Carbon::create(2023, 1, 1);

        $current = self::query()
            ->fromUser($user)
            ->whereBetween('starts_at', [
                $start,
                $date->copy()->endOfMonth(),
            ])
            ->get();

        $previous = self::query()
            ->fromUser($user)
            ->whereDate('starts_at', '<', $date->copy()->startOfMonth())
            ->get();

        $balances = self::replayBalances($current, $previous, $date);

        return self::calculateBalances($balances, $user, $date)
            ->values()
            ->toArray();
    }

    protected static function replayBalances(
        Collection $current,
        Collection $previous,
        Carbon $date
    ): Collection {
        $leaveTypes = [
            'vacation leave',
            'sick leave',
            'force leave',
        ];

        $currentYear = $current->filter(
            fn($item) => Carbon::parse($item->starts_at)->year === $date->year
        );

        return collect($leaveTypes)
            ->map(function ($type) use ($current, $previous, $currentYear) {

                $flAsVacationLeave = 0;
                if ($type === 'vacation leave') {
                    $flAsVacationLeave = $current->where('leave_type', 'force leave')->where('event_tag', $type)->sum('balance');
                }

                return [
                    'leave_type' => $type,

                    'previous' => $previous
                        ->where('leave_type', $type)
                        ->sum('balance'),

                    'current' => $current
                        ->where('leave_type', $type)
                        ->sum('balance') + $flAsVacationLeave,

                    'used' => abs(
                        $currentYear
                            ->where('leave_type', $type)
                            ->where('event_type', 'deduction')
                            ->whereIn('event_tag', ['leave', 'vacation leave'])
                            ->sum('balance')
                    ),
                ];
            })
            ->values();
    }

    protected static function calculateBalances(
        Collection $balances,
        User $user,
        Carbon $date
    ): Collection {

        // Total VL deduction from unused Force Leave in previous years
        $totalForceLeaveDeduction = 0;

        for ($year = 2023; $year < $date->year; $year++) {

            $used = abs(
                self::query()
                    ->fromUser($user)
                    ->whereYear('starts_at', $year)
                    ->where('leave_type', 'force leave')
                    ->where('event_type', 'deduction')
                    ->whereIn('event_tag', ['leave', 'vacation leave'])
                    ->sum('balance')
            );

            $unused = max(0, 5 - $used);

            $totalForceLeaveDeduction += $unused;
        }

        return $balances->map(function ($balance) use ($date, $totalForceLeaveDeduction, $user) {

            if ($balance['leave_type'] === 'vacation leave') {
                $balance['previous'] -= $totalForceLeaveDeduction;
                $balance['current'] -= $totalForceLeaveDeduction;
            }

            $balance['monthly_accrual'] = 0;
            $balance['estimated'] = $balance['current'];

            switch ($balance['leave_type']) {

                case 'vacation leave':

                    $balance['monthly_accrual'] = 1.25;

                    $balance['estimated'] = $balance['current'] + 1.25;

                    if ($date->month === 12) {

                        $forceLeaveUsed = abs(
                            self::query()
                                ->fromUser($user)
                                ->whereYear('starts_at', $date->year)
                                ->where('leave_type', 'force leave')
                                ->where('event_type', 'deduction')
                                ->whereIn('event_tag', ['leave', 'vacation leave'])
                                ->sum('balance')
                        );

                        $unused = max(0, 5 - $forceLeaveUsed);

                        $balance['estimated'] -= $unused;
                    }

                    break;

                case 'sick leave':

                    $balance['monthly_accrual'] = 1.25;
                    $balance['estimated'] += 1.25;

                    break;

                case 'force leave':

                    $forceLeaveUsed = abs(
                        self::query()
                            ->fromUser($user)
                            ->whereYear('starts_at', $date->year)
                            ->where('leave_type', 'force leave')
                            ->where('event_type', 'deduction')
                            ->sum('balance')
                    );

                    $balance['previous'] = max(0, 5 - $forceLeaveUsed);
                    $balance['current'] = max(0, 5 - $forceLeaveUsed);
                    $balance['monthly_accrual'] = 0;

                    $balance['estimated'] = $date->month === 12
                        ? 5
                        : $balance['current'];

                    break;
            }

            return $balance;
        });
    }
}
