<?php

namespace App\Actions\Leave;

use App\Data\LeaveData;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class FileLeave
{
    public function __invoke(LeaveData $data): void
    {
        $user = User::findOrFail($data->user_id);

        $availableBalance = Leave::checkBalance(
            Carbon::parse($data->starts_at),
            $user,
            $data->leave_type
        );

        if ($availableBalance < $data->balance) {
            throw ValidationException::withMessages([
                'leave_type' => 'Insufficient leave balance.',
            ]);
        }

        Leave::create($data->toArray());
    }
}
