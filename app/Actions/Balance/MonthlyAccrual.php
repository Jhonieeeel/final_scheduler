<?php

namespace App\Actions\Balance;

use App\Data\LeaveData;
use App\Models\Leave;
use Carbon\Carbon;

class MonthlyAccrual
{
    public function __invoke(LeaveData $data): void
    {
        $this->vacationLeaveAccrual($data);
        $this->sickLeaveAccrual($data);
        $this->monthlyAccrualStatus($data);

        $date = Carbon::parse($data->ends_at)->month === 1;
        if ($date) {
            $this->forceLeaveAccrual($data);
        }
    }

    public function monthlyAccrualStatus(LeaveData $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'balance' => 0,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at,
            'status' => false
        ]);
    }

    public function vacationLeaveAccrual(LeaveData $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'vacation leave',
            'event_type' => $data->event_type,
            'event_tag' => null,
            'balance' => 1.25,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at
        ]);
    }

    public function sickLeaveAccrual(LeaveData $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'sick leave',
            'event_type' => $data->event_type,
            'event_tag' => null,
            'balance' => 1.25,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at
        ]);
    }

    public function forceLeaveAccrual(LeaveData $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'force leave',
            'event_type' => $data->event_type,
            'event_tag' => null,
            'balance' => 5,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at
        ]);
    }
}
