<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\DetailPengajuanSampah;
use App\Models\JadwalPenjemputan;
use App\Models\JenisSampah;
use App\Models\PengajuanPenjemputan;
use App\Models\Petugas;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PetugasTugasSayaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Petugas Ahmad Fauzi exists
        $userPetugas = User::updateOrCreate(
            ['email' => 'petugas@trashure.test'],
            [
                'username' => 'petugas',
                'password' => Hash::make('password'),
                'role' => 'petugas',
                'status' => 'aktif',
            ]
        );

        $petugas = Petugas::updateOrCreate(
            ['user_id' => $userPetugas->id],
            [
                'nama_petugas' => 'Ahmad Fauzi',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jakarta',
                'no_telepon' => '081234567890',
            ]
        );

        // 2. Ensure Admin exists for foreign key
        $admin = Admin::first();
        if (!$admin) {
            $userAdmin = User::updateOrCreate(
                ['email' => 'admin@trashure.test'],
                [
                    'username' => 'admin',
                    'password' => Hash::make('password'),
                    'role' => 'admin',
                    'status' => 'aktif',
                ]
            );
            $admin = Admin::updateOrCreate(
                ['user_id' => $userAdmin->id],
                ['nama_admin' => 'Admin Trashure']
            );
        }

        // 3. Ensure base JenisSampah exist: Plastik, Kertas, Logam
        $jenisSampahList = [
            'Plastik' => JenisSampah::updateOrCreate(
                ['nama_jenis_sampah' => 'Plastik'],
                ['satuan' => 'Kg', 'keterangan' => 'Sampah plastik daur ulang', 'status' => 'aktif']
            ),
            'Kertas' => JenisSampah::updateOrCreate(
                ['nama_jenis_sampah' => 'Kertas'],
                ['satuan' => 'Kg', 'keterangan' => 'Sampah kertas dan karton daur ulang', 'status' => 'aktif']
            ),
            'Logam' => JenisSampah::updateOrCreate(
                ['nama_jenis_sampah' => 'Logam'],
                ['satuan' => 'Kg', 'keterangan' => 'Sampah kaleng dan logam daur ulang', 'status' => 'aktif']
            ),
        ];

        // Seed HargaSampah for each main waste category
        $hargaData = [
            'Plastik' => ['harga' => 2500, 'poin' => 2.5],
            'Kertas' => ['harga' => 2000, 'poin' => 2.0],
            'Logam' => ['harga' => 6000, 'poin' => 6.0],
        ];

        foreach ($hargaData as $namaJenis => $h) {
            $js = $jenisSampahList[$namaJenis];
            \App\Models\HargaSampah::updateOrCreate(
                [
                    'jenis_sampah_id' => $js->jenis_sampah_id,
                    'status' => 'aktif',
                ],
                [
                    'harga_per_satuan' => $h['harga'],
                    'nilai_poin_per_satuan' => $h['poin'],
                    'berlaku_mulai' => '2024-01-01',
                    'berlaku_selesai' => null,
                ]
            );
        }

        // 4. Buat 1 warga saja
        $userWarga = User::updateOrCreate(
            ['email' => 'warga@trashure.test'],
            [
                'username' => 'warga',
                'password' => Hash::make('password'),
                'role' => 'warga',
                'status' => 'aktif',
            ]
        );

        $warga = Warga::updateOrCreate(
            ['nik' => '3171000000000001'],
            [
                'user_id' => $userWarga->id,
                'nama_warga' => 'Warga Trashure',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Merdeka No. 10, RT 02 / RW 03',
                'no_telepon' => '0812-3456-7890',
            ]
        );

        $warga->saldoPoin()->updateOrCreate(
            ['warga_id' => $warga->warga_id],
            ['saldo_poin' => 0, 'terakhir_diperbarui' => now()]
        );

        // 5. 1 tugas saja - status diproses
        $pengajuan = PengajuanPenjemputan::create([
            'warga_id' => $warga->warga_id,
            'tanggal_pengajuan' => '2024-08-22 07:00:00',
            'alamat_penjemputan' => $warga->alamat,
            'perkiraan_total_berat' => 5.50,
            'catatan' => 'Penjemputan sampah rutin',
            'status_pengajuan' => 'diproses',
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan->pengajuan_id,
            'jenis_sampah_id' => $jenisSampahList['Plastik']->jenis_sampah_id,
            'perkiraan_berat' => 3.50,
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan->pengajuan_id,
            'jenis_sampah_id' => $jenisSampahList['Kertas']->jenis_sampah_id,
            'perkiraan_berat' => 2.00,
        ]);

        JadwalPenjemputan::create([
            'pengajuan_id' => $pengajuan->pengajuan_id,
            'admin_id' => $admin->admin_id,
            'petugas_id' => $petugas->petugas_id,
            'tanggal_penjemputan' => '2024-08-22',
            'waktu_penjemputan' => '09:00:00',
            'status_jadwal' => 'diproses',
            'catatan' => 'Tugas penjemputan',
        ]);
    }
}
