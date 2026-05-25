<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employer_id')->index();
            $table->unsignedBigInteger('employer_payment_id')->nullable()->index();
            $table->string('plan_key', 60);
            $table->string('status', 30)->default('ACTIVE')->index();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->unsignedInteger('job_posts_limit')->nullable();
            $table->unsignedInteger('job_posts_used')->default(0);
            $table->boolean('candidate_search_enabled')->default(false);
            $table->timestamps();

            $table->index(['employer_id', 'status', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_subscriptions');
    }
};
