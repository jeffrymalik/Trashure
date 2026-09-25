<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\JadwalPenjemputan;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class JadwalPenjemputanController extends Controller
{
    #[OA\Get(
        path: "/admin/jadwal",
        summary: "Daftar jadwal penjemputan (Admin)",
        description: "Mengambil semua daftar jadwal penjemputan yang telah dijadwalkan oleh admin.",
        tags: ["Admin - Jadwal"],
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

        $jadwal = JadwalPenjemputan::with([
            'pengajuanPenjemputan.warga',
            'petugas',
        ])
            ->orderBy('tanggal_penjemputan')
            ->orderBy('waktu_penjemputan')
            ->get();

        return response()->json([
            'message' => 'Daftar jadwal penjemputan berhasil diambil.',
            'data' => $jadwal,
        ]);
    }
}