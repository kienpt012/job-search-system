<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CertificateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('certificates')->insert([
            [
                'id' => 1,
                'candidate_id' => 1,
                'name' => 'Tiếng Nhật N3',
                'receive_date' => new Carbon('2022-09-25'),
                'expire_date' => null,
                'image' => 'https://devo.vn/wp-content/uploads/2023/01/meo-buon-ba.jpg'
            ],
            [
                'id' => 2,
                'candidate_id' => 1,
                'name' => 'Tiếng Nhật N3',
                'receive_date' => new Carbon('2022-09-25'),
                'expire_date' => null,
                'image' => 'https://devo.vn/wp-content/uploads/2023/01/meo-buon-ba.jpg'
            ],
        ]);
    }
}
