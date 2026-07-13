<?php

namespace Database\Seeders;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Database\Factories\BalanceFactory;
use Database\Factories\UserFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        foreach (UserFactory::ocdEmployees() as $index => $employee) {
            // info("$index: {$employee['name']}");

            $user = User::factory()->create($employee);

            $balances = BalanceFactory::balances()[$index];

            foreach ($balances as $leaveType => $balance) {
                Leave::create([
                    'user_id' => $user->id,
                    'leave_type' => $leaveType,
                    'event_type' => 'accrual',
                    'event_tag' => 'accrual',
                    'balance' => $balance,
                    'starts_at' => '2023-01-01',
                    'ends_at' => '2023-01-31',
                ]);
            }

            Leave::create([
                'user_id' => $user->id,
                'leave_type' => 'monthly filing',
                'event_type' => 'filing',
                'event_tag' => 'filing',
                'balance' => 0,
                'status' => false,
                'starts_at' => '2023-01-01',
                'ends_at' => '2023-01-31'
            ]);
        }


        // Leave::create([
        //     'user_id' => 1,
        //     'leave_type' => 'vacation leave',
        //     'event_type' => 'accrual',
        //     'event_tag' => null,
        //     'balance' => 5.584,
        //     'starts_at' => '2023-01-01',
        //     'ends_at' => '2023-01-31'
        // ]);
        // Leave::create([
        //     'user_id' => 1,
        //     'leave_type' => 'sick leave',
        //     'event_type' => 'accrual',
        //     'event_tag' => null,
        //     'balance' => 10.792,
        //     'starts_at' => '2023-01-01',
        //     'ends_at' => '2023-01-31',
        // ]);
        // Leave::create([
        //     'user_id' => 1,
        //     'leave_type' => 'force leave',
        //     'event_type' => 'accrual',
        //     'event_tag' => null,
        //     'balance' => 5,
        //     'starts_at' => '2023-01-01',
        //     'ends_at' => '2023-12-31',
        // ]);
        // Leave::create([
        //     'user_id' => 1,
        //     'leave_type' => 'monthly leave',
        //     'event_type' => 'monthly_filing',
        //     'event_tag'  => 'filing',
        //     'balance' => 0,
        //     'starts_at' => '2023-01-01',
        //     'ends_at'   => '2023-01-31',
        //     'status'    => false,
        //     'remarks' => ''
        // ]);
    }
}
