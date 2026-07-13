<?php

namespace Database\Factories;

use App\Models\Leave;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Leave>
 */
class BalanceFactory extends Factory
{

    public static function balances(): array
    {
        return [
            ['vacation_leave' => 5.584, 'sick_leave' => 10.792, 'force_leave' => 5.000],
            ['vacation_leave' => 6.188, 'sick_leave' => 11.583, 'force_leave' => 5.000],
            ['vacation_leave' => 14.313, 'sick_leave' => 22.833, 'force_leave' => 5.000],
            ['vacation_leave' => 61.890, 'sick_leave' => 154.583, 'force_leave' => 5.000],
            ['vacation_leave' => 6.368, 'sick_leave' => 11.583, 'force_leave' => 5.000],
            ['vacation_leave' => 19.875, 'sick_leave' => 308.250, 'force_leave' => 5.000],
            ['vacation_leave' => 6.530, 'sick_leave' => 11.708, 'force_leave' => 5.000],
            ['vacation_leave' => 85.496, 'sick_leave' => 126.500, 'force_leave' => 5.000],
            ['vacation_leave' => 58.895, 'sick_leave' => 70.833, 'force_leave' => 5.000],
            ['vacation_leave' => 95.102, 'sick_leave' => 114.167, 'force_leave' => 5.000],
            ['vacation_leave' => 76.800, 'sick_leave' => 112.750, 'force_leave' => 5.000],
            ['vacation_leave' => 55.575, 'sick_leave' => 69.462, 'force_leave' => 5.000],
            ['vacation_leave' => 79.479, 'sick_leave' => 100.000, 'force_leave' => 5.000],
            ['vacation_leave' => 41.644, 'sick_leave' => 53.667, 'force_leave' => 5.000],
            ['vacation_leave' => 139.122, 'sick_leave' => 270.292, 'force_leave' => 5.000],
            ['vacation_leave' => 81.921, 'sick_leave' => 122.500, 'force_leave' => 5.000],
            ['vacation_leave' => 132.852, 'sick_leave' => 259.000, 'force_leave' => 5.000],
            ['vacation_leave' => 72.169, 'sick_leave' => 127.500, 'force_leave' => 5.000],
            ['vacation_leave' => 65.113, 'sick_leave' => 127.500, 'force_leave' => 5.000],
            ['vacation_leave' => 6.516, 'sick_leave' => 11.583, 'force_leave' => 5.000],
        ];
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            //
        ];
    }
}
