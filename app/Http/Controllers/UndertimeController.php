<?php

namespace App\Http\Controllers;

use App\Actions\Undertime\FileUndertime;
use App\Data\LeaveData;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UndertimeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("Undertime/UndertimeIndex", [
            'users' => User::select(['id', 'name'])->get()
        ]);
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
    public function store(LeaveData $data, FileUndertime $fileUndertime)
    {
        $fileUndertime($data);

        return to_route('undertime.index')->with('message', 'Undertime filed Successfully');
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
