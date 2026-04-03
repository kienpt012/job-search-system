<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IndustrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('industries')->insert([
            ['id'=>1, 'name'=>'Ngân hàng'],
            ['id'=>2,'name'=>'CNTT-Phần mềm'],
            ['id'=>3,'name'=>'CNTT-Phần cứng / Mạng'],
            ['id'=>4,'name'=>'Tiếp thị trực tuyến'],
            ['id'=>5,'name'=>'Tài chính / Đầu tư'],
            ['id'=>6,'name'=>'Kiến trúc'],
            ['id'=>7,'name'=>'Mỹ thuật / Nghệ thuật / Thiết kế'],
            ['id'=>8,'name'=>'Bưu chính viễn thông'],
            ['id'=>9,'name'=>'Nhân sự'],
            ['id'=>10,'name'=>'Lao động phổ thông'],
            ['id'=>11,'name'=>'Bán hàng / Kinh doanh'],
            ['id'=>12,'name'=>'Dược phẩm'],
            ['id'=>13,'name'=>'Hành chính / Thư ký'],
            ['id'=>14,'name'=>'Tiếp thị / Marketing'],
            ['id'=>15,'name'=>'Vận chuyển / Giao nhận / Kho vận'],
            ['id'=>16,'name'=>'Tư vấn'],
            //['id'=>,'name'=>''],
            //['id'=>,'name'=>''],
        ]);
    }
}
