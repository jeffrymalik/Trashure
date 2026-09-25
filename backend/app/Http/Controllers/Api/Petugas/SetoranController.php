<?php

namespace App\Http\Controllers\Api\Petugas;

use App\Http\Controllers\Controller;
use App\Models\JadwalPenjemputan;
use App\Models\JenisSampah;
use App\Models\TransaksiSetoran;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class SetoranController extends Controller
{
    #[OA\Get(path: "/petugas/setoran", summary: "Daftar transaksi setoran sampah (Petugas)", description: "Mengambil seluruh transaksi setoran sampah yang ada di sistem.", tags: ["Petugas - Setoran"], security: [["bearerAuth" => []]], responses: [new OA\Response(response: 200, description: "Daftar transaksi setoran berhasil diambil", content: new OA\JsonContent(properties: [new OA\Property(property: "message", type: "string", example: "Daftar transaksi setoran berhasil diambil."), new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object"))]))])]
    public function index(Request $request)
    {
        $query = TransaksiSetoran::with(['detailSetoran.jenisSampah','warga','petugas','validatorAdmin','jadwalPenjemputan','pengajuanPenjemputan'])->orderByDesc('setoran_id');
        if ($request->has('status') && $request->status !== 'semua') $query->where('status_validasi', $request->status);
        $setoran = $query->get();
        return response()->json(['message' => 'Daftar transaksi setoran berhasil diambil.','data' => $setoran]);
    }

    #[OA\Post(path: "/petugas/jadwal/{jadwalId}/setoran/jenis", summary: "Catat jenis sampah aktual (Petugas)", description: "Mencatat jenis-jenis sampah yang ditemukan secara aktual di lokasi penjemputan.", tags: ["Petugas - Setoran"], security: [["bearerAuth" => []]], parameters: [new OA\Parameter(name: "jadwalId", in: "path", required: true, description: "ID Jadwal Penjemputan", schema: new OA\Schema(type: "integer", example: 1))], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["jenis_sampah"], properties: [new OA\Property(property: "jenis_sampah", type: "array", description: "Daftar ID jenis sampah aktual yang ada di lokasi", items: new OA\Items(type: "object", required: ["jenis_sampah_id"], properties: [new OA\Property(property: "jenis_sampah_id", type: "integer", example: 1)]))])), responses: [new OA\Response(response: 200, description: "Jenis sampah aktual berhasil dicatat", content: new OA\JsonContent(properties: [new OA\Property(property: "message", type: "string", example: "Jenis sampah aktual berhasil dicatat."), new OA\Property(property: "data", type: "object")]))])]
    public function catatJenisAktual(Request $request, $jadwalId)
    {
        $petugas = $request->user()->petugas;
        if (!$petugas) return response()->json(['message' => 'Profil petugas tidak ditemukan.'], 404);
        $jadwal = JadwalPenjemputan::where('jadwal_id', $jadwalId)->where('petugas_id', $petugas->petugas_id)->with('pengajuanPenjemputan')->first();
        if (!$jadwal) return response()->json(['message' => 'Jadwal penjemputan tidak ditemukan.'], 404);
        $request->validate(['jenis_sampah' => 'required|array|min:1','jenis_sampah.*.jenis_sampah_id' => 'required|integer|exists:jenis_sampah,jenis_sampah_id']);
        $jenisSampah = collect($request->jenis_sampah)->map(fn($item) => JenisSampah::find($item['jenis_sampah_id']))->values();
        return response()->json(['message' => 'Jenis sampah aktual berhasil dicatat.','data' => ['jadwal_id' => $jadwal->jadwal_id,'pengajuan_id' => $jadwal->pengajuan_id,'jenis_sampah_aktual' => $jenisSampah]]);
    }

    #[OA\Post(path: "/petugas/jadwal/{jadwalId}/setoran/berat", summary: "Catat berat aktual sampah (Petugas)", description: "Mencatat berat aktual dari masing-masing jenis sampah yang telah ditimbang di lokasi.", tags: ["Petugas - Setoran"], security: [["bearerAuth" => []]], parameters: [new OA\Parameter(name: "jadwalId", in: "path", required: true, description: "ID Jadwal Penjemputan", schema: new OA\Schema(type: "integer", example: 1))], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["detail_sampah"], properties: [new OA\Property(property: "detail_sampah", type: "array", description: "Daftar rincian berat untuk masing-masing jenis sampah", items: new OA\Items(type: "object", required: ["jenis_sampah_id", "berat_aktual"], properties: [new OA\Property(property: "jenis_sampah_id", type: "integer", example: 1), new OA\Property(property: "berat_aktual", type: "number", format: "float", example: 5.5)]))])), responses: [new OA\Response(response: 200, description: "Berat aktual berhasil dicatat", content: new OA\JsonContent(properties: [new OA\Property(property: "message", type: "string", example: "Berat aktual berhasil dicatat."), new OA\Property(property: "data", type: "object")]))])]
    public function catatBeratAktual(Request $request, $jadwalId)
    {
        $petugas = $request->user()->petugas;
        if (!$petugas) return response()->json(['message' => 'Profil petugas tidak ditemukan.'], 404);
        $jadwal = JadwalPenjemputan::where('jadwal_id', $jadwalId)->where('petugas_id', $petugas->petugas_id)->with('pengajuanPenjemputan')->first();
        if (!$jadwal) return response()->json(['message' => 'Jadwal penjemputan tidak ditemukan.'], 404);
        $request->validate(['detail_sampah' => 'required|array|min:1','detail_sampah.*.jenis_sampah_id' => 'required|integer|exists:jenis_sampah,jenis_sampah_id','detail_sampah.*.berat_aktual' => 'required|numeric|min:0.01']);
        $detailSampah = collect($request->detail_sampah)->map(function ($item) { $j = JenisSampah::find($item['jenis_sampah_id']); return ['jenis_sampah_id' => $j->jenis_sampah_id,'nama_jenis_sampah' => $j->nama_jenis_sampah,'berat_aktual' => $item['berat_aktual']]; })->values();
        return response()->json(['message' => 'Berat aktual berhasil dicatat.','data' => ['jadwal_id' => $jadwal->jadwal_id,'pengajuan_id' => $jadwal->pengajuan_id,'detail_sampah' => $detailSampah,'total_berat_aktual' => $detailSampah->sum('berat_aktual')]]);
    }

    #[OA\Post(path: "/petugas/jadwal/{jadwalId}/setoran", summary: "Simpan transaksi setoran sampah (Petugas)", description: "Menyimpan transaksi setoran penjemputan sampah, menghitung akumulasi berat dan poin berdasarkan harga aktif.", tags: ["Petugas - Setoran"], security: [["bearerAuth" => []]], parameters: [new OA\Parameter(name: "jadwalId", in: "path", required: true, description: "ID Jadwal Penjemputan", schema: new OA\Schema(type: "integer", example: 1))], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["konfirmasi_pengambilan", "detail_sampah"], properties: [new OA\Property(property: "konfirmasi_pengambilan", type: "string", enum: ["ya", "tidak"], example: "ya"), new OA\Property(property: "detail_sampah", type: "array", items: new OA\Items(type: "object", required: ["jenis_sampah_id", "berat_aktual"], properties: [new OA\Property(property: "jenis_sampah_id", type: "integer", example: 1), new OA\Property(property: "berat_aktual", type: "number", format: "float", example: 5.5)]))])), responses: [new OA\Response(response: 201, description: "Transaksi setoran berhasil dibuat", content: new OA\JsonContent(properties: [new OA\Property(property: "message", type: "string", example: "Transaksi setoran berhasil dibuat."), new OA\Property(property: "data", type: "object")]))])]
    public function store(Request $request, $jadwalId)
    {
        $petugas = $request->user()->petugas;
        if (!$petugas) return response()->json(['message' => 'Profil petugas tidak ditemukan.'], 404);
        $jadwal = JadwalPenjemputan::where('jadwal_id', $jadwalId)->where('petugas_id', $petugas->petugas_id)->with('pengajuanPenjemputan.warga')->first();
        if (!$jadwal) return response()->json(['message' => 'Jadwal penjemputan tidak ditemukan.'], 404);
        if (!$jadwal->pengajuanPenjemputan) return response()->json(['message' => 'Pengajuan penjemputan tidak ditemukan.'], 404);
        $request->validate([
            'konfirmasi_pengambilan' => 'required|in:ya,tidak',
            'catatan_penolakan' => 'required_if:konfirmasi_pengambilan,tidak|nullable|string|max:500',
            'detail_sampah' => 'required_if:konfirmasi_pengambilan,ya|array|nullable',
            'detail_sampah.*.jenis_sampah_id' => 'required_with:detail_sampah|integer|exists:jenis_sampah,jenis_sampah_id|distinct',
            'detail_sampah.*.berat_aktual' => 'required_with:detail_sampah|numeric|min:0.01'
        ], [
            'detail_sampah.*.jenis_sampah_id.distinct' => 'Setiap jenis sampah hanya boleh diinput satu kali. Jenis yang sudah ada tidak bisa ditambahkan lagi.',
        ]);
        $warga = $jadwal->pengajuanPenjemputan->warga;
        if (!$warga) return response()->json(['message' => 'Data warga pada pengajuan tidak ditemukan.'], 404);
        $transaksi = DB::transaction(function () use ($request, $jadwal, $petugas, $warga) {
            $isBerhasil = $request->konfirmasi_pengambilan === 'ya';
            
            $transaksi = TransaksiSetoran::create([
                'pengajuan_id' => $jadwal->pengajuan_id,
                'jadwal_id' => $jadwal->jadwal_id,
                'warga_id' => $warga->warga_id,
                'petugas_id' => $petugas->petugas_id,
                'tanggal_setoran' => now(),
                'konfirmasi_pengambilan' => $request->konfirmasi_pengambilan,
                'catatan_penolakan' => $request->catatan_penolakan,
                'status_validasi' => $isBerhasil ? 'menunggu' : 'ditolak',
                'catatan_validasi' => $isBerhasil ? null : ($request->catatan_penolakan ? 'Pengambilan gagal: ' . $request->catatan_penolakan : 'Penjemputan gagal dilakukan oleh petugas.'),
                'tanggal_validasi' => $isBerhasil ? null : now(),
                'total_berat_aktual' => 0,
                'total_poin' => 0,
            ]);
            
            if ($isBerhasil && !empty($request->detail_sampah)) {
                $totalBerat = 0;
                $totalPoin = 0;
                
                foreach ($request->detail_sampah as $item) {
                    $jenis = JenisSampah::find($item['jenis_sampah_id']);
                    if (!$jenis) continue;
                    
                    $harga = $jenis->hargaSampah()
                        ->where('status', 'aktif')
                        ->whereDate('berlaku_mulai', '<=', now())
                        ->where(function($q) {
                            $q->whereNull('berlaku_selesai')->orWhereDate('berlaku_selesai', '>=', now());
                        })
                        ->orderByDesc('berlaku_mulai')
                        ->first();
                    
                    if (!$harga) {
                        $harga = $jenis->hargaSampah()->where('status', 'aktif')->orderByDesc('berlaku_mulai')->first();
                    }
                    
                    $hargaPerSatuan = $harga ? (float)$harga->harga_per_satuan : 2000;
                    $nilaiPoinPerSatuan = $harga ? (float)$harga->nilai_poin_per_satuan : 2;
                    $berat = (float)$item['berat_aktual'];
                    $poin = floor($berat * (int)$nilaiPoinPerSatuan);
                    
                    $transaksi->detailSetoran()->create([
                        'jenis_sampah_id' => $jenis->jenis_sampah_id,
                        'berat_aktual' => $berat,
                        'harga_satuan' => $hargaPerSatuan,
                        'nilai_poin_per_satuan' => $nilaiPoinPerSatuan,
                        'poin' => $poin,
                    ]);
                    
                    $totalBerat += $berat;
                    $totalPoin += $poin;
                }
                
                $transaksi->update([
                    'total_berat_aktual' => $totalBerat,
                    'total_poin' => $totalPoin,
                ]);
            }
            
            $jadwal->update(['status_jadwal' => $isBerhasil ? 'selesai' : 'batal']);
            if ($jadwal->pengajuanPenjemputan) {
                $jadwal->pengajuanPenjemputan->update(['status_pengajuan' => $isBerhasil ? 'selesai' : 'ditolak']);
            }
            
            return $transaksi;
        });
        $transaksi->load(['detailSetoran.jenisSampah','warga','petugas','jadwalPenjemputan','pengajuanPenjemputan']);

        // Notify warga + admin
        $pengajuanId = $jadwal->pengajuan_id;
        if ($request->konfirmasi_pengambilan === 'ya') {
            // Notify warga: setoran menunggu validasi
            if ($warga && $warga->user) {
                NotificationService::send(
                    $warga->user->id,
                    'Setoran Dicatat',
                    'Setoran pengajuan #' . $pengajuanId . ' berhasil dicatat. Menunggu validasi admin.',
                    'setoran_menunggu_validasi',
                    ['pengajuan_id' => $pengajuanId, 'setoran_id' => $transaksi->setoran_id]
                );
            }
            // Notify admin
            $adminUsers = \App\Models\User::where('role', 'admin')->where('status', 'aktif')->get();
            foreach ($adminUsers as $adminUser) {
                NotificationService::send(
                    $adminUser->id,
                    'Setoran Baru Perlu Validasi',
                    'Setoran pengajuan #' . $pengajuanId . ' dari ' . ($warga->nama_warga ?? 'Warga') . ' menunggu validasi.',
                    'setoran_baru_validasi',
                    ['pengajuan_id' => $pengajuanId, 'setoran_id' => $transaksi->setoran_id]
                );
            }
        } else {
            // Notify warga: penjemputan ditolak
            if ($warga && $warga->user) {
                NotificationService::send(
                    $warga->user->id,
                    'Penjemputan Ditolak',
                    'Penjemputan pengajuan #' . $pengajuanId . ' tidak dapat dilakukan.',
                    'penjemputan_ditolak',
                    ['pengajuan_id' => $pengajuanId]
                );
            }
        }

        return response()->json(['message' => $request->konfirmasi_pengambilan === 'ya' ? 'Transaksi setoran berhasil dibuat.' : 'Penolakan penjemputan berhasil dicatat.','data' => $transaksi], 201);
    }
}
