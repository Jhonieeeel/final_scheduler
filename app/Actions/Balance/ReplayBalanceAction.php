<?php

namespace App\Actions\Balance;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ReplayBalanceAction
{

    protected array $leaveTypes = ['vacation leave', 'sick leave', 'force leave'];
    protected int $fixedFL = 5;


    protected function filedLeaves(Collection $leavesCollection)
    {
        return $leavesCollection->map(function ($leave) {

            $startsAt = Carbon::parse($leave->starts_at);

            $abbreviation = collect(explode(' ', $leave->leave_type))
                ->map(fn($word) => Str::upper(Str::substr($word, 0, 1)))
                ->implode('');

            return [
                'label' => $startsAt->format('M j') . ' - ' . $abbreviation,
                'leave_type' => $leave->leave_type,
                'starts_at' => $startsAt->toDateString(),
            ];
        })->values()->toArray();
    }

    protected function deductionEvents(Collection $currentUndertime): array
    {

        $undertimeCount = $currentUndertime->where('event_tag', 'undertime')->count();
        $tardinessCount = $currentUndertime->where('event_tag', 'tardiness')->count();

        $events =  $currentUndertime->map(function ($event) {

            $startsAt = Carbon::parse($event->starts_at);
            $endsAt   = Carbon::parse($event->ends_at);

            $diffMinutes = $startsAt->diffInMinutes($endsAt);

            $hours   = intdiv($diffMinutes, 60);
            $minutes = $diffMinutes % 60;

            $durationParts = [];
            if ($hours > 0) {
                $durationParts[] = $hours . ' ' . ($hours === 1 ? 'hr' : 'hrs');
            }
            if ($minutes > 0 || $hours === 0) {
                $durationParts[] = $minutes . ' ' . ($minutes === 1 ? 'min' : 'mins');
            }
            $durationText = implode(' ', $durationParts);

            $tag = Str::upper(Str::substr($event->event_tag, 0, 1));

            return [
                'label' => $startsAt->format('M j') . ', ' . $durationText . ' ' . $tag,
                'minutes' => $minutes,
                'hours' => $hours,
                'day' => $startsAt->day,
                'deductionAmount' => $event->balance,
            ];
        })->values()->toArray();

        return [
            'events' => $events,
            'undertimeCount' => $undertimeCount,
            'tardinessCount' => $tardinessCount
        ];
    }

    // one user
    public function replayUserBalance(Carbon $date, User $user)
    {
        $currentEvents = Leave::query()
            ->fromUser($user)
            ->upToDate($date)
            ->orderBy('starts_at')
            ->get()
            ->groupBy('leave_type');

        $prevEvents = Leave::query()
            ->fromUser($user)
            ->upToDate($date->copy()->subMonth())
            ->orderBy('starts_at')
            ->get()
            ->groupBy('leave_type');

        $forceLeaveEvents = $currentEvents->get('force leave', collect());

        $balances = $this->replayBalances($currentEvents, $prevEvents, $date);

        return $this->forceLeaveRule(
            $forceLeaveEvents,
            $balances,
            $date
        );
    }

    // more uesrs
    public function replayUsersBalance(Carbon $date, Collection $users)
    {
        $userIds = $users->pluck('id');

        $allCurrentEvents = Leave::query()
            ->whereIn('user_id', $userIds)
            ->upToDate($date)
            ->orderBy('starts_at')
            ->get()
            ->groupBy('user_id');

        $allPrevEvents = Leave::query()
            ->whereIn('user_id', $userIds)
            ->upToDate($date->copy()->subMonth())
            ->orderBy('starts_at')
            ->get()
            ->groupBy('user_id');

        return $users->map(function (User $user) use ($allCurrentEvents, $allPrevEvents, $date) {
            $currentEvents = $allCurrentEvents->get($user->id, collect())->groupBy('leave_type');
            $prevEvents    = $allPrevEvents->get($user->id, collect())->groupBy('leave_type');

            $balances = $this->replayBalances($currentEvents, $prevEvents, $date);

            $currentUndertime = $allCurrentEvents->get($user->id, collect())
                ->whereIn('event_tag', ['tardiness', 'undertime']);

            $currentFiledLeaves = $allCurrentEvents->get($user->id, collect())
                ->where('event_tag', 'leave');

            $newBalances = $this->forceLeaveRule(
                $currentEvents->get('force leave', collect()),
                $balances,
                $date
            );

            $deductionData = $this->deductionEvents($currentUndertime);
            $leavesCollection = $this->filedLeaves($currentFiledLeaves);

            return [
                'name'            => $user->name,
                'balances'        => $newBalances,
                'events'          => $deductionData['events'],
                'undertimeCount'  => $deductionData['undertimeCount'],
                'tardinessCount'  => $deductionData['tardinessCount'],
                'leaves'          => $leavesCollection
            ];
        })->values()->toArray();
    }

    protected function replayBalances(Collection $currentEvents, Collection $previousEvents, Carbon $date)
    {


        return collect($this->leaveTypes)->map(function ($type) use ($currentEvents, $previousEvents, $date) {

            $current  = $currentEvents->get($type, collect());
            $previous = $previousEvents->get($type, collect());

            $taggedAsVLCurrent  = $currentEvents->get('force leave', collect())
                ->where('event_tag', 'vacation leave');

            $taggedAsVLPrevious = $previousEvents->get('force leave', collect())
                ->where('event_tag', 'vacation leave');

            $currentBalance = match ($type) {
                'vacation leave' => $current->sum('balance') + $taggedAsVLCurrent->sum('balance'),
                'force leave'    => $current
                    ->filter(fn($e) => Carbon::parse($e->starts_at)->year === $date->year)
                    ->sum('balance'),
                default          => $current->sum('balance'),
            };

            $underTime = $currentEvents->where('event_type', 'deduction')->whereIn('event_tag', ['tardiness', 'undertime']);

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
    }

    protected function forceLeaveRule(Collection $forceLeaveEvents, array $replayBalances, Carbon $date)
    {
        $currentYear = $date->year;

        $flAccrualYears = $forceLeaveEvents
            ->where('event_type', 'accrual')
            ->map(fn($e) => Carbon::parse($e->starts_at)->year)
            ->unique()
            ->filter(fn($year) => $year < $currentYear
                || ($year === $currentYear && $date->month === 12))
            ->values();

        $result = $replayBalances;

        foreach ($flAccrualYears as $year) {

            $flUsedThatYear = $forceLeaveEvents
                ->where('event_type', 'deduction')
                ->filter(fn($e) => Carbon::parse($e->starts_at)->year === $year)
                ->sum('balance');

            $flUnused = max(0, $this->fixedFL - abs($flUsedThatYear));

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
}
