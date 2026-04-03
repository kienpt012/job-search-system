<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployerLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('employer_location')->insert([
            ['employer_id' => 5, 'location_id' => 24],
            ['employer_id' => 5, 'location_id' => 29],
            ['employer_id' => 8, 'location_id' => 24],
            ['employer_id' => 9, 'location_id' => 24],
            ['employer_id' => 10, 'location_id' => 24],
            ['employer_id' => 11, 'location_id' => 24],
            ['employer_id' => 12, 'location_id' => 29],
            ['employer_id' => 13, 'location_id' => 24],
            ['employer_id' => 14, 'location_id' => 24],
            ['employer_id' => 15, 'location_id' => 24],
            ['employer_id' => 16, 'location_id' => 29],
        ]);
    }
}
