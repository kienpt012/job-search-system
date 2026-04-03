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
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employer_id');
            $table->unsignedBigInteger('jtype_id');
            $table->unsignedBigInteger('jlevel_id');
            $table->string('jname', 150);
            $table->text('address');
            $table->unsignedInteger('amount')->nullable();
            $table->unsignedInteger('min_salary')->nullable();
            $table->unsignedInteger('max_salary')->nullable();
            $table->unsignedTinyInteger('yoe')->nullable();
            $table->unsignedTinyInteger('gender')->nullable();
            $table->longText('description');
            $table->date('expire_at');
            $table->boolean('is_hot')->default(0);
            $table->boolean('is_active')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
