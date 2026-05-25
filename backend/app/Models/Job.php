<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }
    public function branch()
    {
        return $this->belongsTo(CompanyBranch::class, 'branch_id');
    }
    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by_user_id');
    }
    public function locations()
    {
        return $this->belongsToMany(Location::class);
    }
    public function industries()
    {
        return $this->belongsToMany(Industry::class, 'job_industry');
    }
    public function skills()
    {
        return $this->belongsToMany(Jskill::class, 'job_skill', 'job_id', 'skill_id')
            ->withPivot('requirement_type');
    }
    public function requiredSkills()
    {
        return $this->belongsToMany(Jskill::class, 'job_skill', 'job_id', 'skill_id')
            ->wherePivot('requirement_type', 'required');
    }
    public function preferredSkills()
    {
        return $this->belongsToMany(Jskill::class, 'job_skill', 'job_id', 'skill_id')
            ->wherePivot('requirement_type', 'preferred');
    }
    public function jtype()
    {
        return $this->belongsTo(Jtype::class);
    }
    public function jlevel()
    {
        return $this->belongsTo(Jlevel::class);
    }
    public function candidate_messages()
    {
        return $this->hasMany(CandidateMessage::class);
    }
}
