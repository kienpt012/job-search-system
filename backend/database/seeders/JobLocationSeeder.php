<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('job_location')->insert([
            ['job_id'=>1, 'location_id'=>24],
            ['job_id'=>2, 'location_id'=>29],
            ['job_id'=>3, 'location_id'=>29],
            ['job_id'=>4, 'location_id'=>24],
            ['job_id'=>5, 'location_id'=>24],
            ['job_id'=>6, 'location_id'=>24],
            ['job_id'=>7, 'location_id'=>24],
            ['job_id'=>8, 'location_id'=>29],
            ['job_id'=>9, 'location_id'=>24],
            ['job_id'=>10, 'location_id'=>24],
            ['job_id'=>11, 'location_id'=>24],
            ['job_id'=>12, 'location_id'=>24],
            ['job_id'=>13, 'location_id'=>24],
            ['job_id'=>14, 'location_id'=>24],
            ['job_id'=>15, 'location_id'=>24],
            ['job_id'=>16, 'location_id'=>24],
            ['job_id'=>16, 'location_id'=>29],
            ['job_id'=>17, 'location_id'=>31],
            ['job_id'=>17, 'location_id'=>14],
            ['job_id'=>18, 'location_id'=>24],
            ['job_id'=>19, 'location_id'=>24],
            ['job_id'=>20, 'location_id'=>29],
            ['job_id'=>21, 'location_id'=>31],
            ['job_id'=>22, 'location_id'=>29],
            ['job_id'=>23, 'location_id'=>29],
            ['job_id'=>24, 'location_id'=>29],
            ['job_id'=>25, 'location_id'=>29],
        ]);
    }
}
