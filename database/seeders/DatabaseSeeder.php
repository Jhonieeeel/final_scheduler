<?php

namespace Database\Seeders;

use App\Models\Leave;
use App\Models\User;
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
            'starts_at' => '2022-12-01',
            'ends_at' => '2022-12-31'
        ]);
    }
}
