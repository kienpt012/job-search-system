<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployerRegistration extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'documents' => 'array',
        'approved_at' => 'datetime',
    ];
}
