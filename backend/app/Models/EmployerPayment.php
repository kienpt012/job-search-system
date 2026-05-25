<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployerPayment extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'provider_payload' => 'array',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }
}
