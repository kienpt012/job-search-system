<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidateMessage extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
