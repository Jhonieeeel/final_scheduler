<?php 

namespace App\Actions\Balance;

use App\Data\LeaveData;
use App\Models\Leave;

class MonthlyAccrual {
    public function __invoke(LeaveData $data): void {
        $this->vacationLeaveAccrual($data);
        $this->sickLeaveAccrual($data);
    }

    public function vacationLeaveAccrual(LeaveData $data) {
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
    
    public function sickLeaveAccrual(LeaveData $data) {
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
    
}