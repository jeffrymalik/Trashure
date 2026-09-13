<?php

namespace Database\Seeders;

use App\Models\Pengepul;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PengepulSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            [
                'email' => 'pengepul@trashure.test',
            ],
            [
                'username' => 'pengepul',
                'password' => Hash::make('password'),
                'role' => 'pengepul',
                'status' => 'aktif',
            ]
        );

        Pengepul::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'nama_pengepul' => 'Pengepul Trashure',
                'alamat' => 'Jakarta',
                'no_telepon' => '081234567892',
            ]
        );
    }
}