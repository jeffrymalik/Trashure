<?php

namespace Database\Seeders;

use App\Models\Petugas;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PetugasSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            [
                'email' => 'petugas@trashure.test',
            ],
            [
                'username' => 'petugas',
                'password' => Hash::make('password'),
                'role' => 'petugas',
                'status' => 'aktif',
            ]
        );

        Petugas::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'nama_petugas' => 'Ahmad Fauzi',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jakarta',
                'no_telepon' => '081234567890',
            ]
        );
    }
}