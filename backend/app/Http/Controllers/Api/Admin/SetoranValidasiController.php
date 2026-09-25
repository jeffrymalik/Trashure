<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SaldoPoin;
use App\Models\StokSampah;
use App\Models\TransaksiSetoran;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class SetoranValidasiController extends Controller
{
    #[OA\Get(path: "/admin/setoran", summary: "Daftar setoran menunggu validasi (Admin)", tags: ["Admin - Validasi"], security: [["bearerAuth" => []]], responses: [new OA\Response(response: 200, description: "Daftar setoran berhasil diambil")])]
    public function index(Request $request)
    {
        $q = TransaksiSetoran::with(['detailSetoran.jenisSampah','warga','petugas','validatorAdmin','pengajuanPenjemputan'])->orderByDesc('setoran_id');

        // Filter status
        if ($request->has('status') && $request->status !== 'semua') {
            $q->where('status_validasi', $request->status);
        }

        // Filter tanggal
        if ($request->has('dari') && $request->dari) {
            $q->whereDate('tanggal_setoran', '>=', $request->dari);
        }
        if ($request->has('sampai') && $request->sampai) {
            $q->whereDate('tanggal_setoran', '<=', $request->sampai);
        }

        // Filter petugas
        if ($request->has('petugas_id') && $request->petugas_id) {
            $q->where('petugas_id', $request->petugas_id);
        }

        // Filter jenis sampah
        if ($request->has('jenis_sampah_id') && $request->jenis_sampah_id) {
            $q->whereHas('detailSetoran', function ($subQuery) use ($request) {
                $subQuery->where('jenis_sampah_id', $request->jenis_sampah_id);
            });
        }

        // Search (nama warga atau nama petugas)
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $q->where(function ($subQuery) use ($search) {
                $subQuery->whereHas('warga', function ($wq) use ($search) {
                    $wq->where('nama_warga', 'like', "%{$search}%");
                })->orWhereHas('petugas', function ($pq) use ($search) {
                    $pq->where('nama_petugas', 'like', "%{$search}%");
                });
            });
        }

        return response()->json(['message' => 'Daftar setoran berhasil diambil.','data' => $q->get()]);
    }

    #[OA\Get(path: "/admin/setoran/{id}", summary: "Detail setoran (Admin)", tags: ["Admin - Validasi"], security: [["bearerAuth" => []]], parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))], responses: [new OA\Response(response: 200, description: "Detail setoran berhasil diambil")])]
    public function show(Request $request, $id)
    {
        $setoran = TransaksiSetoran::with(['detailSetoran.jenisSampah','warga','petugas','validatorAdmin','pengajuanPenjemputan'])->find($id);
        if (!$setoran) return response()->json(['message' => 'Setoran tidak ditemukan.'], 404);
        return response()->json(['message' => 'Detail setoran berhasil diambil.','data' => $setoran]);
    }

    #[OA\Patch(path: "/admin/setoran/{id}/validasi", summary: "Validasi setoran (Admin) - langsung update poin & stok", tags: ["Admin - Validasi"], security: [["bearerAuth" => []]], parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["status_validasi"], properties: [new OA\Property(property: "status_validasi", type: "string", enum: ["disetujui","ditolak"]), new OA\Property(property: "catatan_validasi", type: "string", nullable: true)])), responses: [new OA\Response(response: 200, description: "Validasi berhasil")])]
    public function validasi(Request $request, $id)
    {
        $admin = $request->user()->admin;
        if (!$admin) return response()->json(['message' => 'Profil admin tidak ditemukan.'], 404);
        $request->validate(['status_validasi' => 'required|in:disetujui,ditolak','catatan_validasi' => 'nullable|string']);
        $setoran = TransaksiSetoran::with('detailSetoran')->find($id);
        if (!$setoran) return response()->json(['message' => 'Setoran tidak ditemukan.'], 404);
        if ($setoran->status_validasi !== 'menunggu') return response()->json(['message' => 'Setoran sudah divalidasi sebelumnya.'], 422);

        DB::transaction(function () use ($setoran, $admin, $request) {
            $setoran->update(['validator_admin_id' => $admin->admin_id,'status_validasi' => $request->status_validasi,'catatan_validasi' => $request->catatan_validasi,'tanggal_validasi' => now()]);
            if ($request->status_validasi === 'disetujui') {
                $saldo = SaldoPoin::firstOrCreate(['warga_id' => $setoran->warga_id], ['saldo_poin' => 0,'terakhir_diperbarui' => now()]);
                $saldo->increment('saldo_poin', (int)$setoran->total_poin);
                $saldo->update(['terakhir_diperbarui' => now()]);
                foreach ($setoran->detailSetoran as $detail) {
                    $stok = StokSampah::firstOrCreate(['jenis_sampah_id' => $detail->jenis_sampah_id], ['jumlah_stok' => 0,'satuan' => 'kg']);
                    $stok->increment('jumlah_stok', (float)$detail->berat_aktual);
                    $stok->update(['terakhir_diperbarui' => now()]);
                }
            } elseif ($request->status_validasi === 'ditolak') {
                if ($setoran->pengajuanPenjemputan) {
                    $setoran->pengajuanPenjemputan->update(['status_pengajuan' => 'ditolak']);
                }
            }
        });

        $setoran->load(['detailSetoran.jenisSampah','warga','petugas','validatorAdmin','pengajuanPenjemputan']);

        // Notify warga
        if ($setoran->warga && $setoran->warga->user) {
            if ($request->status_validasi === 'disetujui') {
                NotificationService::send(
                    $setoran->warga->user->id,
                    'Setoran Disetujui',
                    'Setoran pengajuan #' . $setoran->pengajuan_id . ' disetujui. ' . $setoran->total_poin . ' poin telah ditambahkan ke saldo Anda.',
                    'setoran_disetujui',
                    ['pengajuan_id' => $setoran->pengajuan_id, 'setoran_id' => $setoran->setoran_id, 'poin' => $setoran->total_poin]
                );
            } else {
                NotificationService::send(
                    $setoran->warga->user->id,
                    'Setoran Ditolak',
                    'Setoran pengajuan #' . $setoran->pengajuan_id . ' ditolak oleh admin.',
                    'setoran_ditolak',
                    ['pengajuan_id' => $setoran->pengajuan_id, 'setoran_id' => $setoran->setoran_id]
                );
            }
        }

        return response()->json(['message' => $request->status_validasi === 'disetujui' ? 'Setoran disetujui. Poin & stok diperbarui.' : 'Setoran ditolak.','data' => $setoran]);
    }
}
