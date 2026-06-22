<?php

namespace App\Http\Controllers;

use App\Actions\Balance\MonthlyAccrual;
use App\Data\LeaveData;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BalanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $month = request()->input('month', now()->month);
        $year = request()->input('year', now()->year);
        $date = Carbon::create($year, $month);
        $balances = Leave::replay($date);
        return Inertia::render("Balance/BalanceIndex", ['balances' => $balances]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(LeaveData $data, MonthlyAccrual $monthlyAccrual)
    {
        $monthlyAccrual($data);
        return to_route("balance.index")->with('message', 'Balance Accrued Successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
