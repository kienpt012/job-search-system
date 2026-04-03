<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EducationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('educations')->insert([
            [
                'id' => 1,
                'candidate_id' => 1,
                'school' => 'Trường THPT Ân Thi',
                'major' => null,
                'start_date' => new Carbon('2016-09-09'),
                'end_date' => new Carbon('2019-06-09'),
                'description' => 'Học cấp 3'
            ],
            [
                'id' => 2,
                'candidate_id' => 1,
                'school' => 'Đại học Bách khoa Hà Nội',
                'major' => 'Công nghệ thông tin',
                'start_date' => new Carbon('2019-09-09'),
                'end_date' => new Carbon('2024-09-09'),
                'description' => 'Học chuyên ngành cntt việt nhật, K64'
            ],
        ]);
    }
}
