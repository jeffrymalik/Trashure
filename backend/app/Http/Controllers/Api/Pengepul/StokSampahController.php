<?php

namespace App\Http\Controllers\Api\Pengepul;

use App\Http\Controllers\Controller;
use App\Models\StokSampah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class StokSampahController extends Controller
{
    #[OA\Get(
        path: "/pengepul/stok",
        summary: "Daftar stok sampah tersedia (Pengepul)",
        description: "Mengambil seluruh daftar stok sampah yang memiliki kuantitas tersedia (> 0) beserta relasi jenis sampah.",
        tags: ["Pengepul - Stok Sampah"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar stok sampah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar stok sampah berhasil diambil."),
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
                description: "Profil pengepul tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Profil pengepul tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && !$user->pengepul) {
            return response()->json([
                'message' => 'Profil pengepul tidak ditemukan.',
            ], 404);
        }

        $stok = StokSampah::with('jenisSampah')
            ->where('jumlah_stok', '>', 0)
            ->orderBy('jenis_sampah_id')
            ->get();

        $stok->each(function ($item) {
            $harga = DB::table('harga_sampah')
                ->where('jenis_sampah_id', $item->jenis_sampah_id)
                ->where('status', 'aktif')
                ->orderBy('berlaku_mulai', 'desc')
                ->first();
            $item->harga_per_kg = $harga ? $harga->harga_per_satuan : 0;
            $item->total_nilai = $item->harga_per_kg * $item->jumlah_stok;
        });

        return response()->json([
            'message' => 'Daftar stok sampah berhasil diambil.',
            'data' => $stok,
        ]);
    }

    #[OA\Get(
        path: "/pengepul/stok/{id}",
        summary: "Detail stok sampah (Pengepul)",
        description: "Mengambil informasi detail stok sampah spesifik berdasarkan ID stok.",
        tags: ["Pengepul - Stok Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Stok Sampah",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail stok sampah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Detail stok sampah berhasil diambil."),
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
                description: "Stok sampah atau Profil Pengepul tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Stok sampah tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function show(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && !$user->pengepul) {
            return response()->json([
                'message' => 'Profil pengepul tidak ditemukan.',
            ], 404);
        }

        $stok = StokSampah::with('jenisSampah')
            ->where('stok_id', $id)
            ->where('jumlah_stok', '>', 0)
            ->first();

        if (!$stok) {
            return response()->json([
                'message' => 'Stok sampah tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail stok sampah berhasil diambil.',
            'data' => $stok,
        ]);
    }
}