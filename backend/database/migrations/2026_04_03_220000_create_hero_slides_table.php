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
        if (Schema::hasTable('hero_slides')) {
            Schema::table('hero_slides', function (Blueprint $table) {
                if (!Schema::hasColumn('hero_slides', 'image')) {
                    $table->string('image')->nullable();
                }
                if (!Schema::hasColumn('hero_slides', 'target_type')) {
                    $table->string('target_type', 20)->default('custom');
                }
                if (!Schema::hasColumn('hero_slides', 'target_company_id')) {
                    $table->unsignedBigInteger('target_company_id')->nullable();
                }
                if (!Schema::hasColumn('hero_slides', 'target_job_id')) {
                    $table->unsignedBigInteger('target_job_id')->nullable();
                }
                if (!Schema::hasColumn('hero_slides', 'custom_url')) {
                    $table->string('custom_url', 1000)->nullable();
                }
                if (!Schema::hasColumn('hero_slides', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
                if (!Schema::hasColumn('hero_slides', 'sort_order')) {
                    $table->unsignedInteger('sort_order')->default(0);
                }
            });
            return;
        }

        Schema::create('hero_slides', function (Blueprint $table) {
            $table->id();
            $table->string('image');
            $table->string('target_type', 20);
            $table->unsignedBigInteger('target_company_id')->nullable();
            $table->unsignedBigInteger('target_job_id')->nullable();
            $table->string('custom_url', 1000)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
