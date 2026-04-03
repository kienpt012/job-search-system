<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('activities')->insert([
            [
                'id' => 1,
                'candidate_id' => 1,
                'organization' => 'Đội sinh viên tình nguyện',
                'role' => 'Tình nguyện viên',
                'is_present' => 0,
                'start_date' => new Carbon('2022-03-20'),
                'end_date' => new Carbon('2022-06-20'),
                'description' => 'Hỗ trợ giấy tờ cho ban tổ chức',
                'link' => 'https://github.com/ldhoang201/shoes_store'
            ],
            [
                'id' => 2,
                'candidate_id' => 1,
                'organization' => 'Đội sinh viên tình nguyện',
                'role' => 'Tình nguyện viên',
                'is_present' => 1,
                'start_date' => new Carbon('2022-03-20'),
                'end_date' => NULL,
                'description' => 'Hỗ trợ giấy tờ cho ban tổ chức',
                'link' => NULL,
            ],
        ]);
    }
}
