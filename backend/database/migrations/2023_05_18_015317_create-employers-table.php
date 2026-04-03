<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employers', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('name', 150);
            $table->string('address');
            $table->unsignedInteger('min_employees')->nullable();
            $table->unsignedInteger('max_employees')->nullable();
            //$table->unsignedInteger('founded_year')->nullable();
            $table->string('contact_name', 60)->nullable();
            $table->string('phone', 15)->nullable();
            $table->string('website')->nullable();
            $table->longText('description')->nullable();
            $table->text('logo');
            $table->text('image')->nullable();
            $table->boolean('is_hot');
            $table->boolean('is_active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employers');
    }
};
