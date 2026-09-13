<?php

namespace Database\Seeders;

use App\Models\JenisSampah;
use Illuminate\Database\Seeder;

class JenisSampahSeeder extends Seeder
{
    public function run(): void
    {
        JenisSampah::create([
            'nama_jenis_sampah' => 'Plastik',
            'satuan' => 'kg',
            'keterangan' => 'Sampah plastik yang dapat didaur ulang',
            'status' => 'aktif',
        ]);

        JenisSampah::create([
            'nama_jenis_sampah' => 'Kertas',
            'satuan' => 'kg',
            'keterangan' => 'Sampah kertas dan kardus',
            'status' => 'aktif',
        ]);

        JenisSampah::create([
            'nama_jenis_sampah' => 'Logam',
            'satuan' => 'kg',
            'keterangan' => 'Sampah logam yang dapat didaur ulang',
            'status' => 'aktif',
        ]);

        JenisSampah::create([
            'nama_jenis_sampah' => 'Kaca',
            'satuan' => 'kg',
            'keterangan' => 'Sampah kaca yang dapat didaur ulang',
            'status' => 'aktif',
        ]);
    }
}