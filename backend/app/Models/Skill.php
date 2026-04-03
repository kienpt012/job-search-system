<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;
    protected $table = "skills";
    protected $guarded = [];
    public $timestamps = false;

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}
