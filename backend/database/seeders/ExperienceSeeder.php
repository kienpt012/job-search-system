<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExperienceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('experiences')->insert([
            [
                'id' => 1,
                'candidate_id' => 1,
                'name' => 'Thực tập sinh PHP',
                'company' => 'Trung tâm CNTT MobiFone',
                'start_date' => new Carbon('2019-03-07'),
                'end_date' => new Carbon('2019-06-19'),
                'description' => 'Nghiên cứu và triển khai framework Laravel'
            ],
            [
                'id' => 2,
                'candidate_id' => 1,
                'name' => 'Thực tập sinh PHP',
                'company' => 'Trung tâm CNTT MobiFone',
                'start_date' => new Carbon('2019-03-07'),
                'end_date' => new Carbon('2019-06-19'),
                'description' => 'Nghiên cứu và triển khai framework Laravel'
            ],
        ]);
    }
}
