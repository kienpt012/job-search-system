<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JlevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('jlevels')->insert([
            ['id'=>1, 'name'=>'Thực tập sinh'],
            ['id'=>2, 'name'=>'Nhân viên'],
            ['id'=>3, 'name'=>'Trưởng nhóm/Giám sát'],
            ['id'=>4, 'name'=>'Quản lý'],
            ['id'=>5, 'name'=>'Quản lý cấp cao'],
            ['id'=>6, 'name'=>'Điều hành cấp cao'],
            //['id'=>, 'name'=>''],
        ]);
    }
}
