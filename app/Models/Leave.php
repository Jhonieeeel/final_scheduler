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

    public function scopeFromUser(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeUpToDate(Builder $query, Carbon $date): Builder
    {
        return $query->where('starts_at', '<=', $date->copy()->endOfMonth());
    }
}
