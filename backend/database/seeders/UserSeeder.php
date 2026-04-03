<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            ['id' => 1, 'email' => 'tranphudhak@gmail.com', 'password' => Hash::make('phu12345'), 'role' => 1, 'is_active' => 1],
            ['id' => 2, 'email' => 'thoa@gmail.com', 'password' => Hash::make('thoa12345'), 'role' => 1, 'is_active' => 1],
            ['id' => 3, 'email' => 'diep@gmail.com', 'password' => Hash::make('diep12345'), 'role' => 1, 'is_active' => 1],
            ['id' => 4, 'email' => 'phong@gmail.com', 'password' => Hash::make('phong12345'), 'role' => 1, 'is_active' => 1],

            ['id' => 5, 'email' => 'huy@gmail.com', 'password' => Hash::make('huy12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 6, 'email' => 'ngoc@gmail.com', 'password' => Hash::make('ngoc12345'), 'role' => 0, 'is_active' => 1],

            ['id' => 7, 'email' => 'company1@gmail.com', 'password' => Hash::make('company1@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 8, 'email' => 'company2@gmail.com', 'password' => Hash::make('company2@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 9, 'email' => 'company3@gmail.com', 'password' => Hash::make('company3@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 10, 'email' => 'company4@gmail.com', 'password' => Hash::make('company4@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 11, 'email' => 'company5@gmail.com', 'password' => Hash::make('company5@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 12, 'email' => 'company6@gmail.com', 'password' => Hash::make('company6@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 13, 'email' => 'company7@gmail.com', 'password' => Hash::make('company7@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 14, 'email' => 'company8@gmail.com', 'password' => Hash::make('company8@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 15, 'email' => 'company9@gmail.com', 'password' => Hash::make('company9@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 16, 'email' => 'company10@gmail.com', 'password' => Hash::make('company10@12345'), 'role' => 2, 'is_active' => 1],
            ['id' => 17, 'email' => 'quang@gmail.com', 'password' => Hash::make('quang123A'), 'role' => 1, 'is_active' => 1],
        ]);
    }
}
