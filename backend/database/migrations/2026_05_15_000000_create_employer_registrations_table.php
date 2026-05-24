<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('company_name', 150);
            $table->string('address');
            $table->string('contact_name', 100)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('website')->nullable();
            $table->unsignedInteger('min_employees')->nullable();
            $table->unsignedInteger('max_employees')->nullable();
            $table->longText('description')->nullable();
            $table->json('documents')->nullable();
            $table->string('status', 20)->default('pending');
            $table->text('admin_note')->nullable();
            $table->unsignedBigInteger('approved_user_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_registrations');
    }
};
