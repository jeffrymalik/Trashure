<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $vouchers = [
            [
                'nama_voucher' => 'Voucher Rp10.000',
                'deskripsi' => 'Voucher senilai Rp10.000',
                'poin_dibutuhkan' => 1000,
                'jumlah_tersedia' => 100,
                'status' => 'tersedia',
            ],
            [
                'nama_voucher' => 'Voucher Rp25.000',
                'deskripsi' => 'Voucher senilai Rp25.000',
                'poin_dibutuhkan' => 2500,
                'jumlah_tersedia' => 50,
                'status' => 'tersedia',
            ],
            [
                'nama_voucher' => 'Voucher Rp50.000',
                'deskripsi' => 'Voucher senilai Rp50.000',
                'poin_dibutuhkan' => 5000,
                'jumlah_tersedia' => 25,
                'status' => 'tersedia',
            ],
        ];

        foreach ($vouchers as $voucher) {
            Voucher::updateOrCreate(
                [
                    'nama_voucher' => $voucher['nama_voucher'],
                ],
                [
                    'deskripsi' => $voucher['deskripsi'],
                    'poin_dibutuhkan' => $voucher['poin_dibutuhkan'],
                    'jumlah_tersedia' => $voucher['jumlah_tersedia'],
                    'status' => $voucher['status'],
                ]
            );
        }
    }
}