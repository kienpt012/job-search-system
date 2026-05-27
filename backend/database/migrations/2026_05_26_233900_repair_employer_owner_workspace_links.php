<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $owners = DB::table('company_members')
            ->join('employers', 'employers.user_id', '=', 'company_members.user_id')
            ->where('company_members.role', 'company_owner')
            ->where(function ($query) {
                $query
                    ->where('company_members.employer_id', 0)
                    ->orWhereColumn('company_members.employer_id', '<>', 'employers.id');
            })
            ->select(
                'company_members.id as member_id',
                'company_members.created_at as member_created_at',
                'employers.id as employer_id',
                'employers.address',
                'employers.contact_name',
                'employers.phone'
            )
            ->get();

        foreach ($owners as $owner) {
            $hasHeadquarters = DB::table('company_branches')
                ->where('employer_id', $owner->employer_id)
                ->where('is_headquarters', 1)
                ->exists();

            if (!$hasHeadquarters) {
                $misplacedBranch = DB::table('company_branches')
                    ->where('employer_id', 0)
                    ->where('is_headquarters', 1)
                    ->where(function ($query) use ($owner) {
                        $query
                            ->where('address', $owner->address)
                            ->orWhere('phone', $owner->phone)
                            ->orWhere('contact_name', $owner->contact_name)
                            ->orWhere('created_at', $owner->member_created_at);
                    })
                    ->orderByDesc('id')
                    ->first();

                if ($misplacedBranch) {
                    DB::table('company_branches')
                        ->where('id', $misplacedBranch->id)
                        ->update([
                            'employer_id' => $owner->employer_id,
                            'updated_at' => $now,
                        ]);
                }
            }

            DB::table('company_members')
                ->where('id', $owner->member_id)
                ->update([
                    'employer_id' => $owner->employer_id,
                    'branch_id' => null,
                    'status' => 'active',
                    'updated_at' => $now,
                ]);
        }
    }

    public function down(): void
    {
        //
    }
};
