<?php

namespace App\Actions\Undertime;

use App\Data\LeaveData;
use App\Models\Leave;
use Spatie\LaravelData\Data;

class FileUndertime extends Data
{
    public function __invoke(LeaveData $data): void
    {
        Leave::create([
            'user_id'   => $data->user_id,
            'leave_type' => $data->leave_type,
            'event_type' => $data->event_type,
            'balance'   => $data->balance,
            'event_tag' => $data->event_tag,
            'starts_at' => $data->starts_at,
            'ends_at'   => $data->ends_at
        ]);
    }
}
