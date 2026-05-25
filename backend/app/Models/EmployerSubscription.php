<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployerSubscription extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'candidate_search_enabled' => 'boolean',
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }

    public function payment()
    {
        return $this->belongsTo(EmployerPayment::class, 'employer_payment_id');
    }
}
