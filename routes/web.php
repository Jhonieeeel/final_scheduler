<?php

use App\Http\Controllers\BalanceController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\UndertimeController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Leave
    Route::get("leave", [LeaveController::class, 'index'])->name('leave.index');
    Route::post("leave", [LeaveController::class, 'store'])->name('leave.store');


    // Balance
    Route::get("balance", [BalanceController::class, "index"])->name('balance.index');
    Route::get("balance/create", [BalanceController::class, 'store'])->name('balance.store');
    Route::get('/balances/user/{user}', [BalanceController::class, 'show'])->name('balance.show');
    Route::get('/balances/user/{user}/data', [BalanceController::class, 'data'])->name('balance.data');
    Route::delete('/balances/delete', [BalanceController::class, 'destroy'])->name('balance.destroy');

    // Undertimen
    Route::get("undertime", [UndertimeController::class, 'index'])->name('undertime.index');
    Route::post("undertime", [UndertimeController::class, 'store'])->name('undertime.store');

    // Calendar
    Route::get("calendar", [CalendarController::class, 'index'])->name('calendar.index');
    Route::delete("calendar/{leave}", [CalendarController::class, 'destroy'])->name('calendar.destroy');
    // Calendar Data
    Route::get("/calendar/events/data", [LeaveController::class, 'data'])->name('calendar.data');

    // excel exporting
    Route::get("/balances/export", [BalanceController::class, 'exportFile'])->name('balance.export');
});

require __DIR__ . '/settings.php';
