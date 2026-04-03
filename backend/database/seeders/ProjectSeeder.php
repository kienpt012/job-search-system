<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('projects')->insert([
            [
                'id' => 1,
                'candidate_id' => 1,
                'name' => 'shoes shop',
                'prj_type' => 'nhóm',
                'role' => 'đảm nhiệm backend',
                'technologies' => 'ReactJS, Laravel, Bootstrap',
                'start_date' => new Carbon('2022-03-20'),
                'end_date' => new Carbon('2022-06-20'),
                'description' => 'Trang web mua bán giày dép',
                'link' => 'https://github.com/ldhoang201/shoes_store'
            ],
            [
                'id' => 2,
                'candidate_id' => 1,
                'name' => 'shoes shop',
                'prj_type' => 'nhóm',
                'role' => 'đảm nhiệm backend',
                'technologies' => 'ReactJS, Laravel, Bootstrap',
                'start_date' => new Carbon('2022-03-20'),
                'end_date' => new Carbon('2022-06-20'),
                'description' => 'Trang web mua bán giày dép',
                'link' => 'https://github.com/ldhoang201/shoes_store'
            ],
        ]);
    }
}
