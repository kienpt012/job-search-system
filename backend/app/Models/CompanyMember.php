<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyMember extends Model
{
    use HasFactory;

    public const ROLE_COMPANY_OWNER = 'company_owner';
    public const ROLE_BRANCH_MANAGER = 'branch_manager';
    public const ROLE_BRANCH_HR = 'branch_hr';

    protected $guarded = [];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }

    public function branch()
    {
        return $this->belongsTo(CompanyBranch::class, 'branch_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isCompanyWide(): bool
    {
        return $this->role === self::ROLE_COMPANY_OWNER;
    }

    public function canManageBranch(?int $branchId): bool
    {
        if ($this->isCompanyWide()) {
            return true;
        }

        return $branchId !== null && (int) $this->branch_id === (int) $branchId;
    }
}
