<?php

namespace App\Http\Controllers\Api\Petugas;

use App\Http\Controllers\Controller;
use App\Models\JadwalPenjemputan;
use App\Models\TransaksiSetoran;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    #[OA\Get(
        path: "/petugas/dashboard",
        summary: "Dashboard ringkasan petugas",
        description: "Mengambil ringkasan statistik tugas penjemputan dan setoran petugas hari ini.",
        tags: ["Petugas - Dashboard"],
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
                                new OA\Property(property: "penjemputan_hari_ini", type: "integer", example: 5, description: "Total penjemputan yang dijadwalkan hari ini"),
                                new OA\Property(property: "penjemputan_selesai", type: "integer", example: 3, description: "Penjemputan yang sudah selesai"),
                                new OA\Property(property: "penjemputan_menunggu", type: "integer", example: 2, description: "Penjemputan yang masih menunggu/belum selesai"),
                                new OA\Property(property: "total_setoran_dikumpul", type: "number", format: "float", example: 78.5, description: "Total berat setoran yang dikumpul hari ini dalam kg"),
                                new OA\Property(
                                    property: "jadwal_hari_ini",
                                    type: "array",
                                    description: "Daftar jadwal penjemputan hari ini",
                                    items: new OA\Items(
                                        type: "object",
                                        properties: [
                                            new OA\Property(property: "jadwal_id", type: "integer", example: 1),
                                            new OA\Property(property: "tanggal_penjemputan", type: "string", format: "date", example: "2026-09-16"),
                                            new OA\Property(property: "waktu_penjemputan", type: "string", example: "08:00:00"),
                                            new OA\Property(property: "status_jadwal", type: "string", example: "dijadwalkan"),
                                            new OA\Property(property: "nama_warga", type: "string", example: "John Doe"),
                                            new OA\Property(property: "alamat_penjemputan", type: "string", example: "Jl. Merdeka No. 45"),
                                            new OA\Property(property: "no_telepon", type: "string", example: "081234567890"),
                                            new OA\Property(property: "perkiraan_total_berat", type: "number", format: "float", example: 10.5),
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
                description: "Profil petugas tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Profil petugas tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function index(Request $request)
    {
        $petugas = $request->user()->petugas;

        if (!$petugas) {
            return response()->json([
                'message' => 'Profil petugas tidak ditemukan.',
            ], 404);
        }

        $today = Carbon::today()->format('Y-m-d');

        $penjemputanHariIni = JadwalPenjemputan::where('petugas_id', $petugas->petugas_id)
            ->where('tanggal_penjemputan', $today)
            ->count();

        $penjemputanSelesai = JadwalPenjemputan::where('petugas_id', $petugas->petugas_id)
            ->where('tanggal_penjemputan', $today)
            ->where('status_jadwal', 'selesai')
            ->count();

        $penjemputanMenunggu = JadwalPenjemputan::where('petugas_id', $petugas->petugas_id)
            ->where('tanggal_penjemputan', $today)
            ->whereIn('status_jadwal', ['dijadwalkan', 'terjadwal'])
            ->count();

        $totalSetoran = TransaksiSetoran::where('petugas_id', $petugas->petugas_id)
            ->sum('total_berat_aktual');

        $jadwalHariIni = JadwalPenjemputan::where('petugas_id', $petugas->petugas_id)
            ->where('tanggal_penjemputan', $today)
            ->with([
                'pengajuanPenjemputan.warga',
                'pengajuanPenjemputan.detailPengajuanSampah.jenisSampah',
            ])
            ->orderBy('waktu_penjemputan')
            ->get();

        $jadwalFormatted = $jadwalHariIni->map(function ($jadwal) {
            return [
                'jadwal_id' => $jadwal->jadwal_id,
                'tanggal_penjemputan' => $jadwal->tanggal_penjemputan,
                'waktu_penjemputan' => $jadwal->waktu_penjemputan,
                'status_jadwal' => $jadwal->status_jadwal,
                'nama_warga' => $jadwal->pengajuanPenjemputan?->warga?->nama_warga,
                'alamat_penjemputan' => $jadwal->pengajuanPenjemputan?->alamat_penjemputan,
                'no_telepon' => $jadwal->pengajuanPenjemputan?->warga?->no_telepon,
                'perkiraan_total_berat' => (float) $jadwal->pengajuanPenjemputan?->perkiraan_total_berat,
                'detail_sampah' => $jadwal->pengajuanPenjemputan?->detailPengajuanSampah->map(function ($detail) {
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
                'penjemputan_hari_ini' => $penjemputanHariIni,
                'penjemputan_selesai' => $penjemputanSelesai,
                'penjemputan_menunggu' => $penjemputanMenunggu,
                'total_setoran_dikumpul' => (float) round($totalSetoran, 2),
                'jadwal_hari_ini' => $jadwalFormatted,
            ],
        ]);
    }
}
