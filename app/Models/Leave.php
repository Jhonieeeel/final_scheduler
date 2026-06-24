<?php

namespace App\Models;

use App\Data\LeaveData;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

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

    public static function forceLeaveRule(Collection $forceLeaveEvents, array $balances, Carbon $date): array
    {
        $fixedFL     = 5;
        $currentYear = $date->year;

        $flAccrualYears = $forceLeaveEvents
            ->where('event_type', 'accrual')
            ->map(fn($e) => Carbon::parse($e->starts_at)->year)
            ->unique()
            ->filter(fn($year) => $year < $currentYear)
            ->values();

        foreach ($flAccrualYears as $year) {

            $flUsedThatYear = $forceLeaveEvents
                ->where('event_type', 'deduction')
                ->filter(fn($e) => Carbon::parse($e->starts_at)->year === $year)
                ->sum('balance');

            $flUnused = max(0, $fixedFL - abs($flUsedThatYear));


            foreach ($balances as &$balance) {
                info($balance);
                info($balance['currentBalance'] -= $flUnused);
                if ($balance['leave_type'] === 'vacation leave') {
                    $balance['currentBalance'] -= $flUnused;
                    $balance['estimatedBalance'] = $balance['currentBalance'] + 1.25;

                    info("LeaveType: {$balance['leave_type']} Estim: {$balance['estimatedBalance']}");
                }
            }
        }

        return $balances;
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

        $balances = collect($leaveTypes)->map(function ($type) use ($currentEvents, $prevEvents) {

            $current  = $currentEvents->get($type, collect());
            $previous = $prevEvents->get($type, collect());

            $taggedAsVLCurrent  = $currentEvents->get('force leave', collect())
                ->where('event_tag', 'vacation leave');

            $taggedAsVLPrevious = $prevEvents->get('force leave', collect())
                ->where('event_tag', 'vacation leave');

            $currentBalance  = $type === 'vacation leave'
                ? $current->sum('balance') + $taggedAsVLCurrent->sum('balance')
                : $current->sum('balance');

            $previousBalance = $previous->sum('balance');

            if ($type === 'vacation leave') {
                $previousBalance += $taggedAsVLPrevious->sum('balance') + 1.25;
            }

            if ($type === 'sick leave') {
                $previousBalance += 1.25;
            }

            return [
                'leave_type'       => $type,
                'previousBalance'  => $previousBalance,
                'currentBalance'   => $currentBalance,
                'usedBalance'      => abs($current->where('event_tag', null)->where('balance', '<', 0)->sum('balance')),
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
