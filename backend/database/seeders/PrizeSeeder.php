<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('prizes')->insert([
            [
                'id' => 1,
                'candidate_id' => 1,
                'name' => 'Huy chương bạc Olympic Toán cấp quận',
                'receive_date' => new Carbon('2021-09-25'),
                'image' => 'https://devo.vn/wp-content/uploads/2023/01/meo-buon-ba.jpg'
            ],
            [
                'id' => 2,
                'candidate_id' => 1,
                'name' => 'Huy chương vàng Olympic Toán cấp quận',
                'receive_date' => new Carbon('2022-09-26'),
                'image' => 'https://devo.vn/wp-content/uploads/2023/01/meo-buon-ba.jpg'
            ],
        ]);
    }
}
