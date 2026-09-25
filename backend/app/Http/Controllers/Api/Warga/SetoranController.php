<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\PengajuanPenjemputan;
use App\Models\TransaksiSetoran;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class SetoranController extends Controller
{
    #[OA\Get(path: "/warga/setoran", summary: "Daftar riwayat setoran sampah (Warga)", tags: ["Warga - Setoran"], security: [["bearerAuth" => []]], parameters: [new OA\Parameter(name: "status", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["semua","menunggu","disetujui","ditolak","dibatalkan"])), new OA\Parameter(name: "bulan", in: "query", required: false, schema: new OA\Schema(type: "string")), new OA\Parameter(name: "sort", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["terbaru","terlama"]))], responses: [new OA\Response(response: 200, description: "Riwayat setoran berhasil diambil")])]
    public function index(Request $request)
    {
        $warga = $request->user()->warga;
        if (!$warga) return response()->json(['message' => 'Profil warga tidak ditemukan.'], 404);
        $pengajuanList = PengajuanPenjemputan::where('warga_id', $warga->warga_id)->with(['detailPengajuanSampah.jenisSampah','jadwalPenjemputan.petugas','transaksiSetoran.detailSetoran.jenisSampah','transaksiSetoran.petugas','transaksiSetoran.validatorAdmin'])->get();
        $processedIds = $pengajuanList->pluck('pengajuan_id')->filter()->all();
        $standaloneSetoran = TransaksiSetoran::where('warga_id', $warga->warga_id)->where(function($q) use ($processedIds){ $q->whereNull('pengajuan_id')->orWhereNotIn('pengajuan_id', $processedIds); })->with(['detailSetoran.jenisSampah','petugas','validatorAdmin','jadwalPenjemputan','pengajuanPenjemputan'])->get();
        $items = collect();
        foreach ($pengajuanList as $p) $items->push($this->formatPengajuanToSetoran($p));
        foreach ($standaloneSetoran as $s) $items->push($this->formatTransaksiSetoran($s));
        $totalSetoran = $items->count();
        $totalBerat = round((float)$items->sum('total_berat_aktual'), 2);
        $totalPoin = (int)$items->where('status_validasi','disetujui')->sum('total_poin');
        $menungguValidasi = (int)$items->where('status_validasi','menunggu')->whereNotIn('status_pengajuan', ['ditolak', 'dibatalkan'])->count();
        $status = $request->query('status','semua');
        if ($status && $status !== 'semua') {
            if ($status === 'menunggu_validasi' || $status === 'menunggu') {
                $items = $items->filter(fn($it) => $it['status_validasi'] === 'menunggu' && !in_array($it['status_pengajuan'] ?? '', ['ditolak', 'dibatalkan']));
            } elseif ($status === 'diajukan') {
                $items = $items->filter(fn($it) => ($it['status_pengajuan'] ?? '') === 'diajukan');
            } elseif ($status === 'ditolak') {
                $items = $items->filter(fn($it) => $it['status_validasi'] === 'ditolak' || ($it['status_pengajuan'] ?? '') === 'ditolak');
            } elseif ($status === 'dibatalkan') {
                $items = $items->filter(fn($it) => ($it['status_pengajuan'] ?? '') === 'dibatalkan');
            } elseif ($status === 'disetujui') {
                $items = $items->where('status_validasi', 'disetujui');
            }
        }
        if ($request->filled('bulan')) { $bulan = $request->query('bulan'); $items = $items->filter(fn($item) => isset($item['tanggal_setoran']) && str_starts_with($item['tanggal_setoran'], $bulan)); }
        $sort = $request->query('sort','terbaru');
        $items = $sort === 'terlama' ? $items->sortBy('tanggal_setoran')->values() : $items->sortByDesc('tanggal_setoran')->values();
        return response()->json(['message' => 'Riwayat setoran berhasil diambil.','data' => $items,'ringkasan' => ['total_setoran' => $totalSetoran,'total_berat_sampah' => $totalBerat,'total_poin_diterima' => $totalPoin,'menunggu_validasi' => $menungguValidasi]]);
    }

    #[OA\Get(path: "/warga/setoran/{id}", summary: "Detail riwayat setoran sampah (Warga)", tags: ["Warga - Setoran"], security: [["bearerAuth" => []]], parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")), new OA\Parameter(name: "tipe", in: "query", required: false, description: "Sumber data: 'pengajuan' atau 'setoran'. Mencegah tertukar saat ID pengajuan sama dengan ID transaksi lain.", schema: new OA\Schema(type: "string", enum: ["pengajuan", "setoran"]))], responses: [new OA\Response(response: 200, description: "Detail setoran berhasil diambil")])]
    public function show(Request $request, $id)
    {
        $warga = $request->user()->warga;
        if (!$warga) return response()->json(['message' => 'Profil warga tidak ditemukan.'], 404);
        // Jika tipe diketahui, dahulukan sumber yang benar agar tidak tertukar
        // saat ID pengajuan sama dengan ID transaksi setoran lain.
        if ($request->query('tipe') === 'pengajuan') {
            $pengajuan = PengajuanPenjemputan::where('pengajuan_id',$id)->where('warga_id',$warga->warga_id)->with(['detailPengajuanSampah.jenisSampah','jadwalPenjemputan.petugas','transaksiSetoran.detailSetoran.jenisSampah','transaksiSetoran.petugas','transaksiSetoran.validatorAdmin'])->first();
            if ($pengajuan) return response()->json(['message' => 'Detail setoran berhasil diambil.','data' => $this->formatPengajuanToSetoran($pengajuan)]);
        }
        $transaksi = TransaksiSetoran::where('setoran_id',$id)->where('warga_id',$warga->warga_id)->with(['detailSetoran.jenisSampah','petugas','validatorAdmin','jadwalPenjemputan','pengajuanPenjemputan.detailPengajuanSampah.jenisSampah'])->first();
        if ($transaksi) return response()->json(['message' => 'Detail setoran berhasil diambil.','data' => $this->formatTransaksiSetoran($transaksi)]);
        $pengajuan = PengajuanPenjemputan::where('pengajuan_id',$id)->where('warga_id',$warga->warga_id)->with(['detailPengajuanSampah.jenisSampah','jadwalPenjemputan.petugas','transaksiSetoran.detailSetoran.jenisSampah','transaksiSetoran.petugas','transaksiSetoran.validatorAdmin'])->first();
        if ($pengajuan) return response()->json(['message' => 'Detail setoran berhasil diambil.','data' => $this->formatPengajuanToSetoran($pengajuan)]);
        return response()->json(['message' => 'Setoran tidak ditemukan.'], 404);
    }

    private function extractPreferensiJadwal($pengajuan): array
    {
        if (!$pengajuan) return ['tanggal' => null, 'waktu' => null];
        if ($pengajuan->jadwalPenjemputan) {
            $tgl = substr((string)$pengajuan->jadwalPenjemputan->tanggal_penjemputan, 0, 10);
            return [
                'tanggal' => $tgl,
                'waktu' => substr((string)$pengajuan->jadwalPenjemputan->waktu_penjemputan, 0, 5) . ' WIB'
            ];
        }
        if ($pengajuan->catatan && preg_match('/Preferensi Jadwal:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\((.*?)\))?(?:\s*\||$)/is', $pengajuan->catatan, $m)) {
            return [
                'tanggal' => $m[1],
                'waktu' => trim($m[2] ?? '') ?: '08:00 - 11:00 (Pagi)'
            ];
        }
        $tgl = $pengajuan->tanggal_pengajuan ? $pengajuan->tanggal_pengajuan->copy()->addDay()->format('Y-m-d') : now()->addDay()->format('Y-m-d');
        return ['tanggal' => $tgl, 'waktu' => '08:00 - 11:00 (Pagi)'];
    }

    private function formatPengajuanToSetoran(PengajuanPenjemputan $pengajuan): array
    {
        if ($pengajuan->transaksiSetoran) return $this->formatTransaksiSetoran($pengajuan->transaksiSetoran);
        $pref = $this->extractPreferensiJadwal($pengajuan);
        $waktuStr = $pref['tanggal'] ? "{$pref['tanggal']} 08:00:00" : null;
        $detailSetoran = $pengajuan->detailPengajuanSampah->map(fn($d) => [
            'detail_setoran_id' => $d->detail_pengajuan_id,
            'setoran_id' => $d->pengajuan_id,
            'jenis_sampah_id' => $d->jenis_sampah_id,
            'berat_aktual' => (float)$d->perkiraan_berat,
            'harga_satuan' => 0,
            'nilai_poin_per_satuan' => 0,
            'poin' => 0,
            'jenis_sampah' => $d->jenisSampah ? [
                'jenis_sampah_id' => $d->jenisSampah->jenis_sampah_id,
                'nama_jenis_sampah' => $d->jenisSampah->nama_jenis_sampah,
                'satuan' => $d->jenisSampah->satuan,
                'keterangan' => $d->jenisSampah->keterangan
            ] : null
        ])->values()->all();

        $isDibatalkan = $pengajuan->status_pengajuan === 'dibatalkan';
        $isDitolak = $pengajuan->status_pengajuan === 'ditolak';

        $catatanValidasi = null;
        if ($isDibatalkan) {
            $catatanValidasi = 'Pengajuan dibatalkan oleh warga';
            if ($pengajuan->catatan && preg_match('/Pembatalan:\s*(.+)$/i', $pengajuan->catatan, $cm)) {
                $catatanValidasi .= ' (Alasan: ' . trim($cm[1]) . ')';
            }
        } elseif ($pengajuan->catatan) {
            $catatanValidasi = 'Catatan Pengajuan: ' . $pengajuan->catatan;
        }

        return [
            'setoran_id' => $pengajuan->pengajuan_id,
            'pengajuan_id' => $pengajuan->pengajuan_id,
            'sumber_data' => 'pengajuan',
            'jadwal_id' => $pengajuan->jadwalPenjemputan?->jadwal_id,
            'warga_id' => $pengajuan->warga_id,
            'petugas_id' => $pengajuan->jadwalPenjemputan?->petugas_id,
            'validator_admin_id' => null,
            'tanggal_setoran' => $waktuStr ?? ($pengajuan->tanggal_pengajuan?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s')),
            'perkiraan_tanggal_jemput' => $pref['tanggal'],
            'perkiraan_waktu_jemput' => $pref['waktu'],
            'tanggal_diajukan' => $pengajuan->tanggal_pengajuan?->format('Y-m-d H:i:s') ?? $pengajuan->created_at?->format('Y-m-d H:i:s'),
            'konfirmasi_pengambilan' => '0',
            'status_validasi' => ($isDibatalkan ? 'dibatalkan' : ($isDitolak ? 'ditolak' : 'belum_disetor')),
            'catatan_validasi' => $catatanValidasi,
            'tanggal_validasi' => null,
            'total_berat_aktual' => (float)$pengajuan->perkiraan_total_berat,
            'total_poin' => 0,
            'poin' => 0,
            'total_poin_sementara' => 0,
            'detail_setoran' => $detailSetoran,
            'petugas' => $pengajuan->jadwalPenjemputan?->petugas ? [
                'petugas_id' => $pengajuan->jadwalPenjemputan->petugas->petugas_id,
                'nama_petugas' => $pengajuan->jadwalPenjemputan->petugas->nama_petugas,
                'no_telepon' => $pengajuan->jadwalPenjemputan->petugas->no_telepon
            ] : null,
            'validator_admin' => null,
            'alamat_penjemputan' => $pengajuan->alamat_penjemputan,
            'status_pengajuan' => $pengajuan->status_pengajuan,
            'catatan_pengajuan' => $pengajuan->catatan
        ];
    }

    private function formatTransaksiSetoran(TransaksiSetoran $t): array
    {
        $pref = $this->extractPreferensiJadwal($t->pengajuanPenjemputan);
        $isMenunggu = $t->status_validasi === 'menunggu';
        $statusPengajuan = $t->pengajuanPenjemputan?->status_pengajuan;
        if (!$statusPengajuan) {
            $statusPengajuan = ($t->status_validasi === 'ditolak' || $t->konfirmasi_pengambilan === 'tidak') ? 'ditolak' : 'selesai';
        }
        $statusValidasi = $t->status_validasi;
        if ($t->konfirmasi_pengambilan === 'tidak' || $statusPengajuan === 'ditolak') {
            $statusValidasi = 'ditolak';
        }
        $catatanValidasi = $t->catatan_validasi ?? ($t->catatan_penolakan ? 'Pengambilan gagal: ' . $t->catatan_penolakan : null);

        $tglSetoran = ($isMenunggu && $pref['tanggal'])
            ? "{$pref['tanggal']} 08:00:00"
            : ($t->tanggal_setoran?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'));

        return [
            'setoran_id' => $t->setoran_id,
            'pengajuan_id' => $t->pengajuan_id,
            'sumber_data' => 'transaksi',
            'jadwal_id' => $t->jadwal_id,
            'warga_id' => $t->warga_id,
            'petugas_id' => $t->petugas_id,
            'validator_admin_id' => $t->validator_admin_id,
            'tanggal_setoran' => $tglSetoran,
            'perkiraan_tanggal_jemput' => $pref['tanggal'],
            'perkiraan_waktu_jemput' => $pref['waktu'],
            'tanggal_diajukan' => $t->pengajuanPenjemputan?->tanggal_pengajuan?->format('Y-m-d H:i:s'),
            'konfirmasi_pengambilan' => (string)($t->konfirmasi_pengambilan ?? '1'),
            'status_validasi' => $statusValidasi,
            'catatan_validasi' => $catatanValidasi,
            'catatan_penolakan' => $t->catatan_penolakan,
            'tanggal_validasi' => $t->tanggal_validasi?->format('Y-m-d H:i:s'),
            'total_berat_aktual' => (float)$t->total_berat_aktual,
            'total_poin' => (int)$t->total_poin,
            'poin' => (int)$t->total_poin,
            'total_poin_sementara' => (int)$t->total_poin,
            'detail_setoran' => $t->detailSetoran,
            'petugas' => $t->petugas,
            'validator_admin' => $t->validatorAdmin,
            'alamat_penjemputan' => $t->pengajuanPenjemputan?->alamat_penjemputan,
            'status_pengajuan' => $statusPengajuan,
            'catatan_pengajuan' => $t->pengajuanPenjemputan?->catatan
        ];
    }
}
