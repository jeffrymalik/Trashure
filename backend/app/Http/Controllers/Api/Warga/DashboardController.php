<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\PengajuanPenjemputan;
use App\Models\TransaksiSetoran;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    #[OA\Get(
        path: "/warga/dashboard",
        summary: "Dashboard ringkasan warga",
        description: "Mengambil ringkasan statistik aktivitas pengelolaan sampah warga yang sedang login.",
        tags: ["Warga - Dashboard"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dashboard berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Dashboard berhasil diambil."),
                        new OA\Property(
                            property: "data",
                            type: "object",
                            properties: [
                                new OA\Property(property: "total_setoran", type: "integer", example: 12, description: "Total jumlah setoran"),
                                new OA\Property(property: "total_berat_sampah", type: "number", format: "float", example: 45.2, description: "Total berat sampah dalam kg"),
                                new OA\Property(property: "total_poin_aktif", type: "integer", example: 1250, description: "Total poin yang sudah diterima dan disetujui"),
                                new OA\Property(property: "penjemputan_aktif", type: "integer", example: 1, description: "Jumlah pengajuan penjemputan yang masih aktif/menunggu"),
                                new OA\Property(property: "setoran_menunggu_validasi", type: "integer", example: 2, description: "Jumlah setoran yang menunggu validasi"),
                                new OA\Property(
                                    property: "pengajuan_terbaru",
                                    type: "array",
                                    description: "Daftar pengajuan penjemputan yang belum diproses (pending), diurutkan berdasarkan created_at DESC",
                                    items: new OA\Items(
                                        type: "object",
                                        properties: [
                                            new OA\Property(property: "pengajuan_id", type: "integer", example: 1),
                                            new OA\Property(property: "tanggal_pengajuan", type: "string", format: "date-time", example: "2026-09-15 08:00:00"),
                                            new OA\Property(property: "alamat_penjemputan", type: "string", example: "Jl. Merdeka No. 45"),
                                            new OA\Property(property: "perkiraan_total_berat", type: "number", format: "float", example: 10.5),
                                            new OA\Property(property: "status_pengajuan", type: "string", example: "pending"),
                                            new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-09-15 08:30:00"),
                                            new OA\Property(
                                                property: "detail_sampah",
                                                type: "array",
                                                items: new OA\Items(
                                                    type: "object",
                                                    properties: [
                                                        new OA\Property(property: "jenis_sampah", type: "string", example: "Plastik"),
                                                        new OA\Property(property: "perkiraan_berat", type: "number", format: "float", example: 5.2),
                                                        new OA\Property(property: "satuan", type: "string", example: "kg"),
                                                    ]
                                                )
                                            )
                                        ]
                                    )
                                )
                            ]
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Unauthenticated.")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Profil warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Profil warga tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function index(Request $request)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $totalSetoran = TransaksiSetoran::where('warga_id', $warga->warga_id)
            ->count();

        $totalBeratSampah = TransaksiSetoran::where('warga_id', $warga->warga_id)
            ->sum('total_berat_aktual');

        $totalPoinAktif = TransaksiSetoran::where('warga_id', $warga->warga_id)
            ->where('status_validasi', 'disetujui')
            ->sum('total_poin');

        $penjemputanAktif = PengajuanPenjemputan::where('warga_id', $warga->warga_id)
            ->where(function ($query) {
                $query->where('status_pengajuan', 'pending')
                    ->orWhere('status_pengajuan', 'dijadwalkan');
            })
            ->count();

        $setoranMenungguValidasi = TransaksiSetoran::where('warga_id', $warga->warga_id)
            ->where('status_validasi', 'menunggu')
            ->count();

        $pengajuanTerbaru = PengajuanPenjemputan::where('warga_id', $warga->warga_id)
            ->whereIn('status_pengajuan', ['diajukan', 'dijadwalkan', 'diproses', 'selesai', 'dibatalkan', 'ditolak'])
            ->with(['detailPengajuanSampah.jenisSampah', 'jadwalPenjemputan', 'transaksiSetoran'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $pengajuanTerbaruFormatted = $pengajuanTerbaru->map(function ($pengajuan) {
            $jadwal = $pengajuan->jadwalPenjemputan;
            $setoran = $pengajuan->transaksiSetoran;
            $statusValidasi = $setoran?->status_validasi;

            return [
                'pengajuan_id' => $pengajuan->pengajuan_id,
                'tanggal_pengajuan' => $pengajuan->tanggal_pengajuan?->format('Y-m-d H:i:s'),
                'alamat_penjemputan' => $pengajuan->alamat_penjemputan,
                'perkiraan_total_berat' => (float) $pengajuan->perkiraan_total_berat,
                'status_pengajuan' => $pengajuan->status_pengajuan,
                'status_validasi' => $statusValidasi,
                'created_at' => $pengajuan->created_at?->format('Y-m-d H:i:s'),
                'jadwal' => $jadwal ? [
                    'tanggal_penjemputan' => $jadwal->tanggal_penjemputan?->format('Y-m-d'),
                    'waktu_penjemputan' => $jadwal->waktu_penjemputan,
                    'status_jadwal' => $jadwal->status_jadwal,
                ] : null,
                'detail_sampah' => $pengajuan->detailPengajuanSampah->map(function ($detail) {
                    return [
                        'jenis_sampah' => $detail->jenisSampah?->nama_jenis_sampah,
                        'perkiraan_berat' => (float) $detail->perkiraan_berat,
                        'satuan' => $detail->jenisSampah?->satuan,
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        return response()->json([
            'message' => 'Dashboard berhasil diambil.',
            'data' => [
                'total_setoran' => $totalSetoran,
                'total_berat_sampah' => (float) round($totalBeratSampah, 2),
                'total_poin_aktif' => (int) $totalPoinAktif,
                'penjemputan_aktif' => $penjemputanAktif,
                'setoran_menunggu_validasi' => $setoranMenungguValidasi,
                'pengajuan_terbaru' => $pengajuanTerbaruFormatted,
            ],
        ]);
    }
}
