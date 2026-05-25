<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyBranch extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'map_lat' => 'float',
        'map_lng' => 'float',
        'is_headquarters' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }

    public function members()
    {
        return $this->hasMany(CompanyMember::class, 'branch_id');
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'branch_id');
    }
}
