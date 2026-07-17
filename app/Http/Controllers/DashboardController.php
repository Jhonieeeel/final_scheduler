<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $month = request()->input('month', now()->month);
        $year = request()->input('year', now()->year);

        $allLeaveTypes = Leave::whereIn('leave_type', [
            'vacation leave',
            'sick leave',
            'force leave',
            'cto',
            'offset'
        ])
            ->where('event_tag', 'leave')
            ->where('event_type', 'deduction')
            ->count();

        return Inertia::render('Dashboard/dashboard', [
            'total_leaves' => $allLeaveTypes,
            'filters' => ['month' => $month, 'year' => $year]
        ]);
    }
}
