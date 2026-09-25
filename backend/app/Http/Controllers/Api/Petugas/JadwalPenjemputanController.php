<?php

namespace App\Http\Controllers\Api\Petugas;

use App\Http\Controllers\Controller;
use App\Models\JadwalPenjemputan;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class JadwalPenjemputanController extends Controller
{
    #[OA\Get(
        path: "/petugas/jadwal",
        summary: "Daftar jadwal penjemputan petugas",
        description: "Mengambil semua daftar tugas jadwal penjemputan sampah untuk petugas yang sedang login.",
        tags: ["Petugas - Jadwal"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar jadwal penjemputan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar jadwal penjemputan berhasil diambil."),
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object"))
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

        $jadwal = JadwalPenjemputan::where(
                'petugas_id',
                $petugas->petugas_id
            )
            ->with([
                'pengajuanPenjemputan.warga',
                'pengajuanPenjemputan.detailPengajuanSampah.jenisSampah',
                'transaksiSetoran.detailSetoran.jenisSampah',
            ])
            ->orderBy('tanggal_penjemputan')
            ->orderBy('waktu_penjemputan')
            ->get();

        return response()->json([
            'message' => 'Daftar jadwal penjemputan berhasil diambil.',
            'data' => $jadwal,
        ]);
    }

    #[OA\Get(
        path: "/petugas/jadwal/{id}",
        summary: "Detail jadwal penjemputan petugas",
        description: "Mengambil detail penjemputan spesifik berdasarkan ID jadwal yang ditugaskan kepada petugas login.",
        tags: ["Petugas - Jadwal"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Jadwal Penjemputan",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail jadwal penjemputan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Detail jadwal penjemputan berhasil diambil."),
                        new OA\Property(property: "data", type: "object")
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
                description: "Jadwal atau Profil Petugas tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Jadwal penjemputan tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function show(Request $request, $id)
    {
        $petugas = $request->user()->petugas;

        if (!$petugas) {
            return response()->json([
                'message' => 'Profil petugas tidak ditemukan.',
            ], 404);
        }

        $jadwal = JadwalPenjemputan::where(
                'jadwal_id',
                $id
            )
            ->where(
                'petugas_id',
                $petugas->petugas_id
            )
            ->with([
                'pengajuanPenjemputan.warga',
                'pengajuanPenjemputan.detailPengajuanSampah.jenisSampah',
                'transaksiSetoran.detailSetoran.jenisSampah',
            ])
            ->first();

        if (!$jadwal) {
            return response()->json([
                'message' => 'Jadwal penjemputan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail jadwal penjemputan berhasil diambil.',
            'data' => $jadwal,
        ]);
    }

    #[OA\Patch(
        path: "/petugas/jadwal/{id}/proses",
        summary: "Mulai proses penjemputan",
        description: "Mengubah status jadwal penjemputan dan pengajuan menjadi 'diproses'.",
        tags: ["Petugas - Jadwal"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Jadwal Penjemputan",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Penjemputan berhasil diproses",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Penjemputan berhasil diproses."),
                        new OA\Property(property: "data", type: "object")
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
                description: "Jadwal atau Profil Petugas tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Jadwal penjemputan tidak ditemukan.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Jadwal tidak dapat diproses karena status bukan 'terjadwal'",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Jadwal tidak dapat diproses."),
                        new OA\Property(property: "status_jadwal", type: "string", example: "selesai")
                    ]
                )
            )
        ]
    )]
    public function proses(Request $request, $id)
    {
        $petugas = $request->user()->petugas;

        if (!$petugas) {
            return response()->json([
                'message' => 'Profil petugas tidak ditemukan.',
            ], 404);
        }

        $jadwal = JadwalPenjemputan::where(
                'jadwal_id',
                $id
            )
            ->where(
                'petugas_id',
                $petugas->petugas_id
            )
            ->with('pengajuanPenjemputan')
            ->first();

        if (!$jadwal) {
            return response()->json([
                'message' => 'Jadwal penjemputan tidak ditemukan.',
            ], 404);
        }

        if ($jadwal->status_jadwal !== 'terjadwal') {
            return response()->json([
                'message' => 'Jadwal tidak dapat diproses.',
                'status_jadwal' => $jadwal->status_jadwal,
            ], 422);
        }

        $jadwal->update([
            'status_jadwal' => 'diproses',
        ]);

        $jadwal->pengajuanPenjemputan->update([
            'status_pengajuan' => 'diproses',
        ]);

        $jadwal->load('pengajuanPenjemputan');

        // Notify warga
        if ($jadwal->pengajuanPenjemputan) {
            $warga = $jadwal->pengajuanPenjemputan->warga;
            if ($warga && $warga->user) {
                NotificationService::send(
                    $warga->user->id,
                    'Penjemputan Diproses',
                    'Penjemputan pengajuan #' . $jadwal->pengajuan_id . ' sedang dalam perjalanan.',
                    'penjemputan_diproses',
                    ['pengajuan_id' => $jadwal->pengajuan_id, 'jadwal_id' => $jadwal->jadwal_id]
                );
            }
        }

        return response()->json([
            'message' => 'Penjemputan berhasil diproses.',
            'data' => $jadwal,
        ]);
    }
}