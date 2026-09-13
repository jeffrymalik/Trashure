<?php

namespace Database\Seeders;

use App\Models\HargaSampah;
use App\Models\JenisSampah;
use Illuminate\Database\Seeder;

class HargaSampahSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'nama_jenis_sampah' => 'Plastik',
                'harga_per_satuan' => 5000,
                'nilai_poin_per_satuan' => 50,
            ],
            [
                'nama_jenis_sampah' => 'Kertas',
                'harga_per_satuan' => 3000,
                'nilai_poin_per_satuan' => 30,
            ],
            [
                'nama_jenis_sampah' => 'Logam',
                'harga_per_satuan' => 8000,
                'nilai_poin_per_satuan' => 80,
            ],
            [
                'nama_jenis_sampah' => 'Kaca',
                'harga_per_satuan' => 2500,
                'nilai_poin_per_satuan' => 25,
            ],
        ];

        foreach ($data as $item) {
            $jenisSampah = JenisSampah::where(
                'nama_jenis_sampah',
                $item['nama_jenis_sampah']
            )->firstOrFail();

            HargaSampah::updateOrCreate(
                [
                    'jenis_sampah_id' => $jenisSampah->jenis_sampah_id,
                    'berlaku_mulai' => now()->toDateString(),
                ],
                [
                    'harga_per_satuan' => $item['harga_per_satuan'],
                    'nilai_poin_per_satuan' => $item['nilai_poin_per_satuan'],
                    'status' => 'aktif',
                ]
            );
        }
    }
}