<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applying', function (Blueprint $table) {
            $table->unsignedBigInteger('resume_id')->nullable()->after('candidate_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('job_applying', function (Blueprint $table) {
            $table->dropIndex(['resume_id']);
            $table->dropColumn('resume_id');
        });
    }
};
