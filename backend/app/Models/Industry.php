<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Industry extends Model
{
    use HasFactory;
    protected $table = 'industries';
    protected $singular = 'industry';

    public function jobs()
    {
        return $this->belongsToMany(Job::class, 'job_industry');
    }
}
