<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employer extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $guarded = [];

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
    public function payments()
    {
        return $this->hasMany(EmployerPayment::class);
    }
    public function subscriptions()
    {
        return $this->hasMany(EmployerSubscription::class);
    }
    public function branches()
    {
        return $this->hasMany(CompanyBranch::class);
    }
    public function activeBranches()
    {
        return $this->hasMany(CompanyBranch::class)->where('is_active', 1);
    }
    public function members()
    {
        return $this->hasMany(CompanyMember::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
