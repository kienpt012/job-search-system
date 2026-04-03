<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $table = "projects";
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
