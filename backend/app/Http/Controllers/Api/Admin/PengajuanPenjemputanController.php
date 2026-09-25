<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PengajuanPenjemputan;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PengajuanPenjemputanController extends Controller
{
    #[OA\Get(
        path: "/admin/pengajuan",
        summary: "Daftar pengajuan penjemputan baru (Admin)",
        description: "Mengambil semua daftar pengajuan penjemputan sampah dari warga dengan status 'diajukan'.",
        tags: ["Admin - Pengajuan"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar pengajuan penjemputan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar pengajuan penjemputan berhasil diambil."),
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
                description: "Profil admin tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Profil admin tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function index(Request $request)
    {
        $admin = $request->user()->admin;

        if (!$admin) {
            return response()->json([
                'message' => 'Profil admin tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::with([
                'warga',
                'detailPengajuanSampah.jenisSampah',
                'jadwalPenjemputan.petugas',
            ])
            ->orderByDesc('tanggal_pengajuan')
            ->get();

        return response()->json([
            'message' => 'Daftar pengajuan penjemputan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }

    #[OA\Get(
        path: "/admin/pengajuan/{id}",
        summary: "Detail pengajuan penjemputan (Admin)",
        description: "Mengambil rincian pengajuan penjemputan sampah berdasarkan ID pengajuan beserta data warga, detail sampah, dan jadwal jika ada.",
        tags: ["Admin - Pengajuan"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Pengajuan Penjemputan",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail pengajuan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Detail pengajuan penjemputan berhasil diambil."),
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
                description: "Pengajuan atau Profil Admin tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan penjemputan tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function show(Request $request, $id)
    {
        $admin = $request->user()->admin;

        if (!$admin) {
            return response()->json([
                'message' => 'Profil admin tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::with([
            'warga',
            'detailPengajuanSampah.jenisSampah',
            'jadwalPenjemputan.petugas',
        ])
            ->where('pengajuan_id', $id)
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan penjemputan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pengajuan penjemputan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }

    #[OA\Post(
        path: "/admin/pengajuan/{id}/jadwal",
        summary: "Jadwalkan penjemputan sampah (Admin)",
        description: "Menetapkan petugas, tanggal, dan waktu penjemputan untuk pengajuan berstatus 'diajukan'.",
        tags: ["Admin - Pengajuan"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Pengajuan Penjemputan",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["petugas_id", "tanggal_penjemputan", "waktu_penjemputan"],
                properties: [
                    new OA\Property(property: "petugas_id", type: "integer", example: 1, description: "ID Petugas yang ditugaskan"),
                    new OA\Property(property: "tanggal_penjemputan", type: "string", format: "date", example: "2026-09-15", description: "Tanggal penjemputan (YYYY-MM-DD)"),
                    new OA\Property(property: "waktu_penjemputan", type: "string", example: "09:00", description: "Waktu penjemputan format H:i"),
                    new OA\Property(property: "catatan", type: "string", nullable: true, example: "Harap bawa karung tambahan", description: "Catatan penjemputan"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Penjemputan berhasil dijadwalkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Penjemputan berhasil dijadwalkan."),
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
                description: "Pengajuan atau Profil Admin tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan penjemputan tidak ditemukan.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Validasi gagal atau pengajuan tidak dapat dijadwalkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan tidak dapat dijadwalkan.")
                    ]
                )
            )
        ]
    )]
    public function jadwalkan(Request $request, $id)
    {
        $admin = $request->user()->admin;

        if (!$admin) {
            return response()->json([
                'message' => 'Profil admin tidak ditemukan.',
            ], 404);
        }

        $request->validate([
            'petugas_id' => 'required|integer|exists:petugas,petugas_id',
            'tanggal_penjemputan' => 'required|date',
            'waktu_penjemputan' => 'required|date_format:H:i',
            'catatan' => 'nullable|string',
        ]);

        $pengajuan = PengajuanPenjemputan::where(
            'pengajuan_id',
            $id
        )->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan penjemputan tidak ditemukan.',
            ], 404);
        }

        if ($pengajuan->status_pengajuan !== 'diajukan') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat dijadwalkan.',
                'status_pengajuan' => $pengajuan->status_pengajuan,
            ], 422);
        }

        if ($pengajuan->jadwalPenjemputan) {
            return response()->json([
                'message' => 'Pengajuan sudah memiliki jadwal penjemputan.',
            ], 422);
        }

        $jadwal = \DB::transaction(function () use (
            $request,
            $admin,
            $pengajuan
        ) {
            $jadwal = \App\Models\JadwalPenjemputan::create([
                'pengajuan_id' => $pengajuan->pengajuan_id,
                'admin_id' => $admin->admin_id,
                'petugas_id' => $request->petugas_id,
                'tanggal_penjemputan' => $request->tanggal_penjemputan,
                'waktu_penjemputan' => $request->waktu_penjemputan,
                'status_jadwal' => 'terjadwal',
                'catatan' => $request->catatan,
            ]);

            $pengajuan->update([
                'status_pengajuan' => 'dijadwalkan',
            ]);

            return $jadwal;
        });

        $jadwal->load([
            'pengajuanPenjemputan.warga',
            'petugas',
            'admin',
        ]);

        // Notify warga
        if ($jadwal->pengajuanPenjemputan && $jadwal->pengajuanPenjemputan->warga) {
            $wargaUser = $jadwal->pengajuanPenjemputan->warga->user;
            if ($wargaUser) {
                NotificationService::send(
                    $wargaUser->id,
                    'Pengajuan Dijadwalkan',
                    'Pengajuan #' . $pengajuan->pengajuan_id . ' dijadwalkan penjemputan tanggal ' . $request->tanggal_penjemputan . ' jam ' . $request->waktu_penjemputan . '.',
                    'pengajuan_dijadwalkan',
                    ['pengajuan_id' => $pengajuan->pengajuan_id]
                );
            }
        }

        // Notify petugas
        if ($jadwal->petugas && $jadwal->petugas->user) {
            NotificationService::send(
                $jadwal->petugas->user->id,
                'Jadwal Penjemputan Baru',
                'Anda ditugaskan jemput pengajuan #' . $pengajuan->pengajuan_id . ' tanggal ' . $request->tanggal_penjemputan . ' jam ' . $request->waktu_penjemputan . '.',
                'jadwal_ditugaskan',
                ['pengajuan_id' => $pengajuan->pengajuan_id, 'jadwal_id' => $jadwal->jadwal_id]
            );
        }

        return response()->json([
            'message' => 'Penjemputan berhasil dijadwalkan.',
            'data' => $jadwal,
        ], 201);
    }
}