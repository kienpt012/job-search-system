<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OtherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('others')->insert([
            [
                'id' => 1,
                'candidate_id' => 1,
                'name' => 'Sở thích',
                'description' => 'Xem phim, nghe nhạc, bóng đá'
            ],
            [
                'id' => 2,
                'candidate_id' => 1,
                'name' => 'Sở trường',
                'description' => 'Nấu ăn, bánh mì kẹp'
            ],
        ]);
    }
}
