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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BalanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $date = Carbon::create((int) $year, (int) $month);

        $users = Leave::query()
            ->with('user:id,name')
            ->select(['leave_type', 'id', 'status', 'starts_at', 'ends_at', 'user_id'])
            ->where('leave_type', 'monthly filing')
            ->whereBetween('starts_at', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Balance/BalanceIndex', [
            'users' => $users,
            'filters' => ['month' => $month, 'year' => $year]
        ]);
    }

    // public function index(Request $request)
    // {
    //     $month = $request->input('month', now()->month);
    //     $year = $request->input('year', now()->year);

    //     $startDate = Carbon::createFromDate((int) $year, (int) $month, 1)->startOfMonth();
    //     $endDate = $startDate->copy()->endOfMonth();

    //     $users = User::query()
    //         ->with('leave')
    //         ->whereHas('leave', function ($query) use ($startDate, $endDate) {
    //             $query->where('status', false)
    //                 ->whereBetween('starts_at', [$startDate, $endDate]);
    //         })
    //         ->paginate(5)
    //         ->withQueryString();

    //     if ($request->wantsJson()) {
    //         return response()->json($users);
    //     }

    //     return Inertia::render("Balance/BalanceIndex", [
    //         'users' => $users,
    //         'filters' => [
    //             'month' => (string) $month,
    //             'year' => (string) $year,
    //         ]
    //     ]);
    // }

    public function usersFiling()
    {
        $month = request()->input('month', now()->month);
        $year  = request()->input('year', now()->year);

        $date = Carbon::create((int) $year, (int) $month, 1)->startOfMonth();

        $users = User::query()
            ->with('leave')
            ->whereHas('leave', function ($query) use ($date) {
                $query->where('status', false)
                    ->whereBetween('starts_at', [$date, $date->copy()->endOfMonth()]);
            })
            ->paginate(5);

        $data = [
            'users' => $users,
            'filters' => [
                'month' => (string) $month,
                'year' => (string) $year
            ]
        ];

        return response()->json($data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

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

        $filepath = request()->query('filepath');

        return Inertia::render("Balance/UserBalance", ['user' => $user, 'date' => Carbon::create($year, $month), 'filepath' => $filepath]);
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
        $year = request()->input('year', now()->year);
        $date = Carbon::create((int) $year, (int) $month, 1)->startOfMonth();

        $users = User::select(['id', 'name'])->get();
        $replayUsersBalance = $action->replayUsersBalance($date, $users);

        $filename = $exportAction->writeExcel($replayUsersBalance);

        // Exporting...http://localhost:8000/storage/reports/January_2023.xlsx
        // info("Exporting..." . $filename);

        return back()->with('downloadUrl', $filename);

        // dd(route('balance.download', ['filename' => $filename]));


        // return to_route('balance.download', ['filename' => $filename]);
    }

    public function downloadFile(Request $request)
    {

        // reports/filenane.xlsx
        $filename = $request->query('filename');

        // http://localhost:8000/storage/reports/January_2023.xlsx
        // open on a new tab
        return response()->download($filename);
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
    public function update(Request $request, Leave $leave)
    {

        $leave->update([
            'status' => $request->status,
            'remarks' => $request->remarks
        ]);

        return to_route('balance.index')->with('message', 'Leave monthly filing updated!');
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
