<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JtypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('jtypes')->insert([
            ['id'=>1, 'name'=>'Nhân viên chính thức'],
            ['id'=>2, 'name'=>'Tạm thời / Dự án'],
            ['id'=>3, 'name'=>'Thực tập'],
            //['id'=>4, 'name'=>''],
        ]);
    }
}
