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
        'ends_at'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime'
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
            ->whereMonth('starts_at', $date->month)
            ->whereYear('starts_at', $date->year)
            ->get();
    }

    public static function hasNextMonthAccrual(User $user, Carbon $date): bool
    {
        return self::query()
            ->fromUser($user)
            ->where('event_type', 'accrual')
            ->whereBetween('starts_at', [
                $date->copy()->addMonth()->startOfMonth(),
                $date->copy()->addMonth()->endOfMonth(),
            ])
            ->exists();
    }

    public static function forceLeaveRule(Collection $forceLeaveEvents, array $balances, Carbon $date): array
    {
        $fixedFL     = 5;
        $currentYear = $date->year;

        $flAccrualYears = $forceLeaveEvents
            ->where('event_type', 'accrual')
            ->map(fn($e) => Carbon::parse($e->starts_at)->year)
            ->unique()
            ->filter(fn($year) => $year < $currentYear
                || ($year === $currentYear && $date->month === 12))
            ->values();

        $result = $balances;

        foreach ($flAccrualYears as $year) {

            $flUsedThatYear = $forceLeaveEvents
                ->where('event_type', 'deduction')
                ->filter(fn($e) => Carbon::parse($e->starts_at)->year === $year)
                ->sum('balance');

            $flUnused = max(0, $fixedFL - abs($flUsedThatYear));

            $result = array_map(function ($balance) use ($flUnused) {
                if ($balance['leave_type'] === 'vacation leave') {
                    $balance['currentBalance']  -= $flUnused;
                    $balance['previousBalance'] -= $flUnused;
                    $balance['estimatedBalance'] = $balance['currentBalance'] + 1.25;
                }
                return $balance;
            }, $result);
        }

        return $result;
    }

    public static function replayBalances(Carbon $date, User $user): array
    {
        $leaveTypes = ['vacation leave', 'sick leave', 'force leave'];

        $currentEvents = self::query()
            ->fromUser($user)
            ->upToDate($date)
            ->orderBy('starts_at')
            ->get()
            ->groupBy('leave_type');

        $prevEvents = self::query()
            ->fromUser($user)
            ->upToDate($date->copy()->subMonth())
            ->orderBy('starts_at')
            ->get()
            ->groupBy('leave_type');

        $balances = collect($leaveTypes)->map(function ($type) use ($currentEvents, $prevEvents, $date) {

            $current  = $currentEvents->get($type, collect());
            $previous = $prevEvents->get($type, collect());

            $taggedAsVLCurrent  = $currentEvents->get('force leave', collect())
                ->where('event_tag', 'vacation leave');

            $taggedAsVLPrevious = $prevEvents->get('force leave', collect())
                ->where('event_tag', 'vacation leave');

            $currentBalance = match ($type) {
                'vacation leave' => $current->sum('balance') + $taggedAsVLCurrent->sum('balance'),
                'force leave'    => $current
                    ->filter(fn($e) => Carbon::parse($e->starts_at)->year === $date->year)
                    ->sum('balance'),
                default          => $current->sum('balance'),
            };

            $previousBalance = match ($type) {
                'vacation leave' => $previous->sum('balance') + $taggedAsVLPrevious->sum('balance') + 1.25,
                'sick leave'     => $previous->sum('balance') + 1.25,
                'force leave'    => $previous
                    ->filter(fn($e) => Carbon::parse($e->starts_at)->year === $date->year)
                    ->sum('balance'),
                default          => $previous->sum('balance'),
            };

            return [
                'leave_type'      => $type,
                'previousBalance' => $previousBalance,
                'currentBalance'  => $currentBalance,
                'usedBalance'     => $type === 'force leave'
                    ? abs($current->where('event_type', 'deduction')
                        ->filter(fn($e) => Carbon::parse($e->starts_at)->month === $date->month
                            && Carbon::parse($e->starts_at)->year  === $date->year)
                        ->sum('balance'))
                    : abs($current->where('event_tag', 'leave')
                        ->where('balance', '<', 0)
                        ->filter(fn($e) => Carbon::parse($e->starts_at)->month === $date->month
                            && Carbon::parse($e->starts_at)->year  === $date->year)
                        ->sum('balance')),
                'estimatedBalance' => in_array($type, ['vacation leave', 'sick leave'])
                    ? $currentBalance + 1.25
                    : null,
            ];
        })->toArray();

        $newBalances = self::forceLeaveRule(
            $currentEvents->get('force leave', collect()),
            $balances,
            $date
        );


        return $newBalances;
    }

    public function scopeFromUser(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeUpToDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('starts_at', '<=', $date->copy()->endOfMonth());
    }
}
