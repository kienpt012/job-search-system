<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employers', function (Blueprint $table) {
            if (!Schema::hasColumn('employers', 'map_lat')) {
                $table->decimal('map_lat', 10, 7)->nullable()->after('address');
            }

            if (!Schema::hasColumn('employers', 'map_lng')) {
                $table->decimal('map_lng', 10, 7)->nullable()->after('map_lat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employers', function (Blueprint $table) {
            $dropColumns = array_values(array_filter([
                Schema::hasColumn('employers', 'map_lat') ? 'map_lat' : null,
                Schema::hasColumn('employers', 'map_lng') ? 'map_lng' : null,
            ]));

            if (count($dropColumns) > 0) {
                $table->dropColumn($dropColumns);
            }
        });
    }
};
