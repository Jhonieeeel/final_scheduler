<?php 

namespace App\Actions\Balance;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;

class ReplaceBalances {
    protected $leaveTypes = ['vacation leave', 'sick leave', 'force leave'];

    public function currentTransactions(Carbon $date, User $user) {
    
        return Leave::query()
            ->upToDate($date)
            ->where('user_id', $user->id);
    }

   

    
}