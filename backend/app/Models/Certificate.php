<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;
    protected $table = "certificates";
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
