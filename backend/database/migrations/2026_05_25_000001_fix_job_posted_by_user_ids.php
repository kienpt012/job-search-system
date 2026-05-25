<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('jobs', 'posted_by_user_id')) {
            return;
        }

        DB::table('jobs')
            ->join('employers', 'employers.id', '=', 'jobs.employer_id')
            ->where(function ($query) {
                $query->whereNull('jobs.posted_by_user_id')
                    ->orWhereColumn('jobs.posted_by_user_id', 'jobs.employer_id');
            })
            ->update([
                'jobs.posted_by_user_id' => DB::raw('employers.user_id'),
            ]);
    }

    public function down(): void
    {
        // Data correction only; no rollback.
    }
};
