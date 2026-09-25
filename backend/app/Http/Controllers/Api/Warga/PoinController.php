<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\DetailSetoran;
use App\Models\SaldoPoin;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PoinController extends Controller
{
    #[OA\Get(
        path: "/warga/poin",
        summary: "Riwayat poin warga",
        description: "Mengambil riwayat poin yang diterima warga dari setoran sampah yang sudah divalidasi.",
        tags: ["Warga - Poin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "tanggal_mulai",
                in: "query",
                required: false,
                description: "Filter tanggal mulai format YYYY-MM-DD",
                schema: new OA\Schema(type: "string", example: "2026-09-01")
            ),
            new OA\Parameter(
                name: "tanggal_akhir",
                in: "query",
                required: false,
                description: "Filter tanggal akhir format YYYY-MM-DD",
                schema: new OA\Schema(type: "string", example: "2026-09-30")
            ),
            new OA\Parameter(
                name: "sort",
                in: "query",
                required: false,
                description: "Urutan data berdasarkan tanggal (terbaru, terlama)",
                schema: new OA\Schema(type: "string", enum: ["terbaru", "terlama"], example: "terbaru")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Riwayat poin berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Riwayat poin berhasil diambil."),
                        new OA\Property(
                            property: "data",
                            type: "object",
                            properties: [
                                new OA\Property(property: "total_poin", type: "integer", example: 1250, description: "Total poin yang sudah diterima"),
                                new OA\Property(
                                    property: "riwayat",
                                    type: "array",
                                    description: "Daftar riwayat poin",
                                    items: new OA\Items(
                                        type: "object",
                                        properties: [
                                            new OA\Property(property: "tanggal", type: "string", format: "date", example: "2026-09-15"),
                                            new OA\Property(property: "jenis_sampah", type: "string", example: "Plastik"),
                                            new OA\Property(property: "berat", type: "number", format: "float", example: 5.2),
                                            new OA\Property(property: "satuan", type: "string", example: "kg"),
                                            new OA\Property(property: "poin", type: "integer", example: 100),
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

        $saldoPoin = SaldoPoin::where('warga_id', $warga->warga_id)->first();
        $totalPoin = $saldoPoin?->saldo_poin ?? 0;

        $query = DetailSetoran::whereHas('transaksiSetoran', function ($q) use ($warga) {
            $q->where('warga_id', $warga->warga_id)
              ->where('status_validasi', 'disetujui');
        })
        ->with([
            'jenisSampah',
            'transaksiSetoran' => function ($q) {
                $q->select('setoran_id', 'tanggal_setoran');
            }
        ]);

        if ($request->filled('tanggal_mulai')) {
            $tanggalMulai = $request->query('tanggal_mulai');
            $query->whereHas('transaksiSetoran', function ($q) use ($tanggalMulai) {
                $q->whereDate('tanggal_setoran', '>=', $tanggalMulai);
            });
        }

        if ($request->filled('tanggal_akhir')) {
            $tanggalAkhir = $request->query('tanggal_akhir');
            $query->whereHas('transaksiSetoran', function ($q) use ($tanggalAkhir) {
                $q->whereDate('tanggal_setoran', '<=', $tanggalAkhir);
            });
        }

        $sort = $request->query('sort', 'terbaru');
        if ($sort === 'terlama') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $riwayatPoin = $query->get();

        $riwayatFormatted = $riwayatPoin->map(function ($detail) {
            return [
                'tanggal' => $detail->transaksiSetoran?->tanggal_setoran?->format('Y-m-d'),
                'jenis_sampah' => $detail->jenisSampah?->nama_jenis_sampah,
                'berat' => (float) $detail->berat_aktual,
                'satuan' => $detail->jenisSampah?->satuan,
                'poin' => (int) $detail->poin,
            ];
        })->values()->all();

        return response()->json([
            'message' => 'Riwayat poin berhasil diambil.',
            'data' => [
                'total_poin' => (int) $totalPoin,
                'riwayat' => $riwayatFormatted,
            ],
        ]);
    }
}
