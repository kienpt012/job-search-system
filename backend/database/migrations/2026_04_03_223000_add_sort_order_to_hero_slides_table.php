<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('hero_slides')) {
            return;
        }

        if (!Schema::hasColumn('hero_slides', 'sort_order')) {
            Schema::table('hero_slides', function (Blueprint $table) {
                $table->unsignedInteger('sort_order')->default(0)->after('is_active');
            });
        }

        $slides = DB::table('hero_slides')->orderBy('id')->get(['id']);
        foreach ($slides as $index => $slide) {
            DB::table('hero_slides')
                ->where('id', $slide->id)
                ->update(['sort_order' => $index + 1]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('hero_slides') && Schema::hasColumn('hero_slides', 'sort_order')) {
            Schema::table('hero_slides', function (Blueprint $table) {
                $table->dropColumn('sort_order');
            });
        }
    }
};
