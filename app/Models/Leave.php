<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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


    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function scopeFromDate(Builder $query, Carbon $date) {
        return $query->whereBetween('starts_at', [
            '2022-12-01',
            $date ?? now()
        ]);
    }  


    public static function replay(Carbon $date): array {
        $vacationLeave = self::where('user_id', 1)
            ->where('leave_type', 'vacation leave')
            ->fromDate($date)
            ->sum('balance');

        dd($vacationLeave);
    }
}
