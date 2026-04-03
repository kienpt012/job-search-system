<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    use HasFactory;
    protected $table = "resumes";
    protected $guarded = [];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
    public function educations()
    {
        return $this->hasMany(Education::class);
    }
    public function experiences()
    {
        return $this->hasMany(Experience::class);
    }
    public function projects()
    {
        return $this->hasMany(Project::class);
    }
    public function skills()
    {
        return $this->hasMany(Skill::class);
    }
    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
    public function prizes()
    {
        return $this->hasMany(Prize::class);
    }
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
    public function others()
    {
        return $this->hasMany(Other::class);
    }
}
