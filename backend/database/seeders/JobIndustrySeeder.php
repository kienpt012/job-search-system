<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobIndustrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('job_industry')->insert([
            ['job_id'=>1, 'industry_id'=>1],
            ['job_id'=>1, 'industry_id'=>2],
            ['job_id'=>1, 'industry_id'=>3],
            ['job_id'=>2, 'industry_id'=>1],
            ['job_id'=>2, 'industry_id'=>4],
            ['job_id'=>2, 'industry_id'=>5],
            ['job_id'=>3, 'industry_id'=>1],
            ['job_id'=>3, 'industry_id'=>2],
            ['job_id'=>3, 'industry_id'=>3],
            ['job_id'=>4, 'industry_id'=>6],
            ['job_id'=>4, 'industry_id'=>7],
            ['job_id'=>5, 'industry_id'=>2],
            ['job_id'=>5, 'industry_id'=>3],
            ['job_id'=>5, 'industry_id'=>8],
            ['job_id'=>6, 'industry_id'=>2],
            ['job_id'=>6, 'industry_id'=>3],
            ['job_id'=>7, 'industry_id'=>9],
            ['job_id'=>8, 'industry_id'=>1],
            ['job_id'=>8, 'industry_id'=>6],
            ['job_id'=>8, 'industry_id'=>10],
            ['job_id'=>9, 'industry_id'=>11],
            ['job_id'=>9, 'industry_id'=>12],
            ['job_id'=>9, 'industry_id'=>13],
            ['job_id'=>10, 'industry_id'=>2],
            ['job_id'=>11, 'industry_id'=>2],
            ['job_id'=>11, 'industry_id'=>11],
            ['job_id'=>12, 'industry_id'=>14],
            ['job_id'=>13, 'industry_id'=>2],
            ['job_id'=>14, 'industry_id'=>3],
            ['job_id'=>14, 'industry_id'=>11],
            ['job_id'=>15, 'industry_id'=>3],
            ['job_id'=>15, 'industry_id'=>11],
            ['job_id'=>16, 'industry_id'=>11],
            ['job_id'=>16, 'industry_id'=>14],
            ['job_id'=>17, 'industry_id'=>11],
            ['job_id'=>17, 'industry_id'=>15],
            ['job_id'=>18, 'industry_id'=>2],
            ['job_id'=>18, 'industry_id'=>3],
            ['job_id'=>19, 'industry_id'=>2],
            ['job_id'=>20, 'industry_id'=>2],
            ['job_id'=>20, 'industry_id'=>3],
            ['job_id'=>20, 'industry_id'=>11],
            ['job_id'=>21, 'industry_id'=>1],
            ['job_id'=>21, 'industry_id'=>5],
            ['job_id'=>22, 'industry_id'=>1],
            ['job_id'=>22, 'industry_id'=>5],
            ['job_id'=>23, 'industry_id'=>2],
            ['job_id'=>23, 'industry_id'=>11],
            ['job_id'=>23, 'industry_id'=>14],
            ['job_id'=>24, 'industry_id'=>2],
            ['job_id'=>24, 'industry_id'=>11],
            ['job_id'=>24, 'industry_id'=>16],
            ['job_id'=>25, 'industry_id'=>14],
            //['job_id'=>, 'industry_id'=>],
            //['job_id'=>, 'industry_id'=>],
        ]);
    }
}
