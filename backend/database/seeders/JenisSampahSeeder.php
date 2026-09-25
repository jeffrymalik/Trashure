<?php

namespace Database\Seeders;

use App\Models\JenisSampah;
use Illuminate\Database\Seeder;

class JenisSampahSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['nama_jenis_sampah' => 'Plastik', 'satuan' => 'Kg', 'keterangan' => 'Sampah plastik daur ulang seperti botol, gelas, dan kresek.'],
            ['nama_jenis_sampah' => 'Kertas', 'satuan' => 'Kg', 'keterangan' => 'Sampah kertas dan karton daur ulang seperti kardus, koran, dan HVS.'],
            ['nama_jenis_sampah' => 'Logam', 'satuan' => 'Kg', 'keterangan' => 'Sampah kaleng dan logam daur ulang seperti aluminium dan besi.'],
        ];

        foreach ($items as $item) {
            JenisSampah::updateOrCreate(
                ['nama_jenis_sampah' => $item['nama_jenis_sampah']],
                [
                    'satuan' => $item['satuan'],
                    'keterangan' => $item['keterangan'],
                    'status' => 'aktif',
                ]
            );
        }
    }
}
