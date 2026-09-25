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
            ['nama_jenis_sampah' => 'Plastik', 'harga_per_satuan' => 2500, 'nilai_poin_per_satuan' => 2.5],
            ['nama_jenis_sampah' => 'Kertas', 'harga_per_satuan' => 2000, 'nilai_poin_per_satuan' => 2],
            ['nama_jenis_sampah' => 'Logam', 'harga_per_satuan' => 6000, 'nilai_poin_per_satuan' => 6],
        ];

        foreach ($data as $item) {
            $jenisSampah = JenisSampah::where(
                'nama_jenis_sampah',
                $item['nama_jenis_sampah']
            )->first();

            if ($jenisSampah) {
                HargaSampah::updateOrCreate(
                    [
                        'jenis_sampah_id' => $jenisSampah->jenis_sampah_id,
                        'berlaku_mulai' => '2024-08-01',
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
}
