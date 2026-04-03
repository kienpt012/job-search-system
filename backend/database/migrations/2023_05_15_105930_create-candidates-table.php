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
        Schema::create('candidates', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('firstname', 40);
            $table->string('lastname', 20);
            $table->unsignedTinyInteger('gender')->nullable();
            $table->date('dob')->nullable();
            $table->char('phone', 10)->nullable();
            $table->string('email');
            $table->string('address')->nullable();
            $table->text('link')->nullable();
            $table->text('objective')->nullable();
            $table->text('avatar')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
