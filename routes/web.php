<?php

use App\Http\Controllers\BalanceController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\UndertimeController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Leave
    Route::get("leave", [LeaveController::class, 'index'])->name('leave.index');

    // Balance
    Route::get("balamce", [BalanceController::class, "index"])->name('balance.index');

    // Undertime
    Route::get("undertime", [UndertimeController::class, 'index'])->name('undertime.index');
});

require __DIR__.'/settings.php';
