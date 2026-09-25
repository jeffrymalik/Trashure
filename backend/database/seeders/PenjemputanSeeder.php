<?php

namespace Database\Seeders;

use App\Models\JadwalPenjemputan;
use App\Models\PengajuanPenjemputan;
use App\Models\DetailPengajuanSampah;
use App\Models\Warga;
use App\Models\Petugas;
use App\Models\Admin;
use App\Models\JenisSampah;
use Illuminate\Database\Seeder;

class PenjemputanSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::first();
        $petugas = Petugas::first();
        $warga = Warga::first();
        if (!$admin || !$petugas || !$warga) return;

        $plastik = JenisSampah::where('nama_jenis_sampah', 'Plastik')->first();
        $kertas = JenisSampah::where('nama_jenis_sampah', 'Kertas')->first();
        $logam = JenisSampah::where('nama_jenis_sampah', 'Logam')->first();

        // 1. Pengajuan diajukan (belum ada jadwal)
        $pengajuan1 = PengajuanPenjemputan::create([
            'warga_id' => $warga->warga_id,
            'tanggal_pengajuan' => now()->addDays(1),
            'alamat_penjemputan' => $warga->alamat ?? 'Jl. Merdeka No. 10, RT 02 / RW 03',
            'perkiraan_total_berat' => 4.00,
            'catatan' => 'Sampah plastik dan kertas',
            'status_pengajuan' => 'diajukan',
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan1->pengajuan_id,
            'jenis_sampah_id' => $plastik?->jenis_sampah_id,
            'perkiraan_berat' => 2.50,
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan1->pengajuan_id,
            'jenis_sampah_id' => $kertas?->jenis_sampah_id,
            'perkiraan_berat' => 1.50,
        ]);

        // 2. Pengajuan diproses (sudah ada jadwal, petugas akan jemput)
        $pengajuan2 = PengajuanPenjemputan::create([
            'warga_id' => $warga->warga_id,
            'tanggal_pengajuan' => now(),
            'alamat_penjemputan' => $warga->alamat ?? 'Jl. Merdeka No. 10, RT 02 / RW 03',
            'perkiraan_total_berat' => 6.00,
            'catatan' => 'Sampah logam dan plastik',
            'status_pengajuan' => 'diproses',
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan2->pengajuan_id,
            'jenis_sampah_id' => $logam?->jenis_sampah_id,
            'perkiraan_berat' => 3.00,
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan2->pengajuan_id,
            'jenis_sampah_id' => $plastik?->jenis_sampah_id,
            'perkiraan_berat' => 3.00,
        ]);

        JadwalPenjemputan::create([
            'pengajuan_id' => $pengajuan2->pengajuan_id,
            'admin_id' => $admin->admin_id,
            'petugas_id' => $petugas->petugas_id,
            'tanggal_penjemputan' => now()->toDateString(),
            'waktu_penjemputan' => '10:00',
            'status_jadwal' => 'diproses',
            'catatan' => 'Petugas sedang dalam perjalanan',
        ]);

        // 3. Pengajuan dijadwalkan (admin sudah jadwalkan, petugas belum mulai)
        $pengajuan3 = PengajuanPenjemputan::create([
            'warga_id' => $warga->warga_id,
            'tanggal_pengajuan' => now()->subDays(1),
            'alamat_penjemputan' => $warga->alamat ?? 'Jl. Merdeka No. 10, RT 02 / RW 03',
            'perkiraan_total_berat' => 5.00,
            'catatan' => 'Sampah kertas dan logam',
            'status_pengajuan' => 'dijadwalkan',
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan3->pengajuan_id,
            'jenis_sampah_id' => $kertas?->jenis_sampah_id,
            'perkiraan_berat' => 2.00,
        ]);

        DetailPengajuanSampah::create([
            'pengajuan_id' => $pengajuan3->pengajuan_id,
            'jenis_sampah_id' => $logam?->jenis_sampah_id,
            'perkiraan_berat' => 3.00,
        ]);

        JadwalPenjemputan::create([
            'pengajuan_id' => $pengajuan3->pengajuan_id,
            'admin_id' => $admin->admin_id,
            'petugas_id' => $petugas->petugas_id,
            'tanggal_penjemputan' => now()->addDays(1)->toDateString(),
            'waktu_penjemputan' => '09:00',
            'status_jadwal' => 'terjadwal',
            'catatan' => 'Jadwal penjemputan besok',
        ]);
    }
}
