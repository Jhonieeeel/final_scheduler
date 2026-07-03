<?php

namespace Database\Seeders;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
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

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        Leave::create([
            'user_id' => 1,
            'leave_type' => 'vacation leave',
            'event_type' => 'accrual',
            'event_tag' => null,
            'balance' => 5.584,
            'starts_at' => '2023-01-01',
            'ends_at' => '2023-01-31'
        ]);
        Leave::create([
            'user_id' => 1,
            'leave_type' => 'sick leave',
            'event_type' => 'accrual',
            'event_tag' => null,
            'balance' => 10.792,
            'starts_at' => '2023-01-01',
            'ends_at' => '2023-01-31'
        ]);
        Leave::create([
            'user_id' => 1,
            'leave_type' => 'force leave',
            'event_type' => 'accrual',
            'event_tag' => null,
            'balance' => 5,
            'starts_at' => '2023-01-01',
            'ends_at' => '2023-12-31'
        ]);

        // $accrualPerMonth = 1.25;

        // $types = ['vacation leave', 'sick leave'];

        // $date = Carbon::create(2023, 1, 1);

        // for ($month = 2; $month <= 12; $month++) {

        //     $date = $date->copy()->addMonthNoOverflow();

        //     Leave::create([
        //         'user_id'    => 1,
        //         'leave_type' => 'force leave',
        //         'event_type' => 'accrual',
        //         'event_tag'  => null,
        //         'balance'    => 1.25,
        //         'starts_at'  => $date->copy()->startOfMonth(),
        //         'ends_at'    => $date->copy()->endOfMonth(),
        //     ]);

        //     Leave::create([
        //         'user_id'    => 1,
        //         'leave_type' => 'sick leave',
        //         'event_type' => 'accrual',
        //         'event_tag'  => null,
        //         'balance'    => 1.25,
        //         'starts_at'  => $date->copy()->startOfMonth(),
        //         'ends_at'    => $date->copy()->endOfMonth(),
        //     ]);
        // }
    }
}
