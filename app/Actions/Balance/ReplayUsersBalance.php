<?php

namespace App\Actions\Balance;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;


class ReplaceBalances
{
    protected $leaveTypes = ['vacation leave', 'sick leave', 'force leave'];

    public static function allTransactions(Carbon $date, User $user): array
    {
        $start = Carbon::create(2023, 1, 1);

        $current = Leave::query()
            ->fromUser($user)
            ->whereBetween('starts_at', [
                $start,
                $date->copy()->endOfMonth(),
            ])
            ->get();

        $previous = Leave::query()
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
                Leave::query()
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
                            Leave::query()
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
                        Leave::query()
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
