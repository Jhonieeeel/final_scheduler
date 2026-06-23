<?php

namespace App\Models;

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

    public function scopeFromUser(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeUpToDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('starts_at', '<=', $date->copy()->endOfMonth());
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
                ->where('event_type', 'deduct')
                ->filter(fn($e) => Carbon::parse($e->starts_at)->year === $year)
                ->sum('balance');

            $flUnused = max(0, $fixedFL + $flUsedThatYear);

            foreach ($balances as &$balance) {
                if ($balance['leave_type'] === 'vacation leave') {
                    $balance['currentBalance']   -= $flUnused;
                    $balance['estimatedBalance'] -= $flUnused;
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

            $currentBalance = $current->sum('balance');

            return [
                'leave_type'      => $type,
                'currentBalance'  => $currentBalance,
                'usedBalance'     => abs($current->where('balance', '<', 0)->sum('balance')),
                'estimatedBalance' => in_array($type, ['vacation leave', 'sick leave'])
                    ? $currentBalance + 1.25
                    : null,
            ];
        })->toArray();

        $balances = self::forceLeaveRule(
            $currentEvents->get('force leave', collect()),
            $balances,
            $date
        );

        return $balances;
    }
}
