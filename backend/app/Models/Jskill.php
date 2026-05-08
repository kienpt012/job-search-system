<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jskill extends Model
{
    use HasFactory;

    protected $table = 'jskills';
    protected $guarded = [];
    public $timestamps = false;

    public function jobs()
    {
        return $this->belongsToMany(Job::class, 'job_skill', 'skill_id', 'job_id');
    }
}
