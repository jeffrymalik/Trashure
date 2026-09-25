<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\DetailSetoran;
use App\Models\JadwalPenjemputan;
use App\Models\JenisSampah;
use App\Models\PengajuanPenjemputan;
use App\Models\Petugas;
use App\Models\SaldoPoin;
use App\Models\StokSampah;
use App\Models\TransaksiSetoran;
use App\Models\Warga;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TransaksiSetoranSeeder extends Seeder
{
    public function run(): void
    {
        $warga = Warga::first();
        $petugas = Petugas::first();
        $admin = Admin::first();
        if (!$warga || !$petugas || !$admin) return;

        $plastik = JenisSampah::where('nama_jenis_sampah', 'Plastik')->first();
        $kertas = JenisSampah::where('nama_jenis_sampah', 'Kertas')->first();
        $logam = JenisSampah::where('nama_jenis_sampah', 'Logam')->first();

        $createSetoran = function ($tanggalSetoran, $statusValidasi, $totalBerat, $totalPoin, array $details, $catatanValidasi = null, $tanggalValidasi = null) use ($warga, $petugas, $admin) {
            $pengajuan = PengajuanPenjemputan::create(['warga_id' => $warga->warga_id,'tanggal_pengajuan' => Carbon::parse($tanggalSetoran)->subDays(2),'alamat_penjemputan' => $warga->alamat ?? 'Jl. Merdeka No. 45 RT 02/RW 03','perkiraan_total_berat' => $totalBerat,'catatan' => 'Sampah siap jemput','status_pengajuan' => 'selesai']);
            $jadwal = JadwalPenjemputan::create(['pengajuan_id' => $pengajuan->pengajuan_id,'admin_id' => $admin->admin_id,'petugas_id' => $petugas->petugas_id,'tanggal_penjemputan' => Carbon::parse($tanggalSetoran)->toDateString(),'waktu_penjemputan' => Carbon::parse($tanggalSetoran)->format('H:i:s'),'status_jadwal' => 'selesai','catatan' => 'Selesai']);
            $transaksi = TransaksiSetoran::create(['pengajuan_id' => $pengajuan->pengajuan_id,'jadwal_id' => $jadwal->jadwal_id,'warga_id' => $warga->warga_id,'petugas_id' => $petugas->petugas_id,'validator_admin_id' => $statusValidasi !== 'menunggu' ? $admin->admin_id : null,'tanggal_setoran' => Carbon::parse($tanggalSetoran),'konfirmasi_pengambilan' => '1','status_validasi' => $statusValidasi,'catatan_validasi' => $catatanValidasi,'tanggal_validasi' => $tanggalValidasi ? Carbon::parse($tanggalValidasi) : null,'total_berat_aktual' => $totalBerat,'total_poin' => $totalPoin]);
            foreach ($details as $d) {
                if (!empty($d['jenis_sampah_id'])) DetailSetoran::create(['setoran_id' => $transaksi->setoran_id,'jenis_sampah_id' => $d['jenis_sampah_id'],'berat_aktual' => $d['berat_aktual'],'harga_satuan' => $d['harga_satuan'] ?? 2000,'nilai_poin_per_satuan' => $d['nilai_poin_per_satuan'] ?? 40,'poin' => $d['poin'] ?? 0]);
            }
            if ($statusValidasi === 'disetujui' && $totalPoin > 0) {
                $saldo = SaldoPoin::firstOrCreate(['warga_id' => $warga->warga_id], ['saldo_poin' => 0, 'terakhir_diperbarui' => now()]);
                $saldo->increment('saldo_poin', (int)$totalPoin);
                $saldo->update(['terakhir_diperbarui' => now()]);
                foreach ($details as $d) {
                    if (empty($d['jenis_sampah_id'])) continue;
                    $stok = StokSampah::firstOrCreate(['jenis_sampah_id' => $d['jenis_sampah_id']], ['jumlah_stok' => 0, 'satuan' => 'kg']);
                    $stok->increment('jumlah_stok', (float)$d['berat_aktual']);
                    $stok->update(['terakhir_diperbarui' => now()]);
                }
            }
            return $transaksi;
        };

        // 1. Disetujui - Plastik & Kertas
        $createSetoran('2024-05-22 10:35:00','disetujui',5.50,215,[
            ['jenis_sampah_id'=>$plastik?->jenis_sampah_id,'berat_aktual'=>3.00,'harga_satuan'=>2500,'nilai_poin_per_satuan'=>2.5,'poin'=>75],
            ['jenis_sampah_id'=>$kertas?->jenis_sampah_id,'berat_aktual'=>2.50,'harga_satuan'=>2000,'nilai_poin_per_satuan'=>2,'poin'=>50],
        ],'Sampah bersih dan terpilah rapi.','2024-05-23 09:15:00');

        // 2. Menunggu - Logam
        $createSetoran('2024-05-20 14:20:00','menunggu',2.80,90,[
            ['jenis_sampah_id'=>$logam?->jenis_sampah_id,'berat_aktual'=>2.80,'harga_satuan'=>6000,'nilai_poin_per_satuan'=>6,'poin'=>90],
        ]);

        // 3. Ditolak - Plastik basah
        $createSetoran('2024-05-18 09:15:00','ditolak',1.50,0,[
            ['jenis_sampah_id'=>$plastik?->jenis_sampah_id,'berat_aktual'=>1.50,'harga_satuan'=>2500,'nilai_poin_per_satuan'=>0,'poin'=>0],
        ],'Sampah masih tercampur basah.','2024-05-18 11:00:00');
    }
}
