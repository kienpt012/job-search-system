<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employer_id')->index();
            $table->unsignedBigInteger('order_code')->unique();
            $table->string('provider', 30)->default('payos');
            $table->string('plan_key', 60);
            $table->unsignedInteger('amount');
            $table->string('currency', 8)->default('VND');
            $table->string('status', 30)->default('PENDING')->index();
            $table->string('payment_link_id')->nullable()->index();
            $table->text('checkout_url')->nullable();
            $table->json('provider_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['employer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_payments');
    }
};
