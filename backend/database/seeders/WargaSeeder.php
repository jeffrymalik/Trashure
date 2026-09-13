<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Warga;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class WargaSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            [
                'email' => 'warga@trashure.test',
            ],
            [
                'username' => 'warga',
                'password' => Hash::make('password'),
                'role' => 'warga',
                'status' => 'aktif',
            ]
        );

        $warga = Warga::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'nik' => '3171000000000001',
                'nama_warga' => 'Warga Trashure',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jakarta',
                'no_telepon' => '081234567891',
            ]
        );

        $warga->saldoPoin()->updateOrCreate(
            [
                'warga_id' => $warga->warga_id,
            ],
            [
                'saldo_poin' => 0,
                'terakhir_diperbarui' => now(),
            ]
        );
    }
}