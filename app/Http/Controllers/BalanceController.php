<?php

namespace App\Http\Controllers;

use App\Actions\Balance\MonthlyAccrual;
use App\Actions\Balance\ReplayBalanceAction;
use App\Actions\Excel\ExportFile;
use App\Data\LeaveData;
use App\Models\Leave;
use App\Models\User;
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
        $users = User::select(['id', 'name'])->get();
        return Inertia::render("Balance/BalanceIndex", ['users' => $users]);
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
    public function show(User $user)
    {
        $month = request()->input('month', now()->month);
        $year  = request()->input('year', now()->year);

        return Inertia::render("Balance/UserBalance", ['user' => $user, 'date' => Carbon::create($year, $month)]);
    }

    public function data(User $user, ReplayBalanceAction $action)
    {
        $month = request()->input('month', now()->month);
        $year  = request()->input('year', now()->year);
        $date  = Carbon::create((int) $year, (int) $month, 1)->startOfMonth();

        $replayBalances = $action->replayUserBalance($date, $user);
        $hasNextAccrual = Leave::hasNextMonthAccrual($user, $date);
        $transactions   = Leave::transactionPerMonth($user, $date);

        return response()->json([
            'balances' => $replayBalances,
            'date'     => $date->format('Y-m-d'),
            'hasNext'  => $hasNextAccrual,
            'transactions' => $transactions
        ]);
    }

    public function exportFile(ReplayBalanceAction $action, ExportFile $exportAction)
    {
        $month = request()->input('month', now()->month);
        $year  = request()->input('year', now()->year);

        $date  = Carbon::create((int) $year, (int) $month, 1)->startOfMonth();


        $users = User::select(['id', 'name'])->get();

        $replayUsersBalance = $action->replayUsersBalance($date, $users);

        $exportAction->writeExcel($replayUsersBalance);

        return response()->json($replayUsersBalance);
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
    public function destroy(Leave $leave)
    {

        $user = $leave->user;

        $leave->delete();

        return to_route('balance.show', $user)->with('message', 'Leave deleted successfully');
    }
}
