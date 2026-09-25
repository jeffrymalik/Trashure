<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PenukaranPoin;
use App\Models\Voucher;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PenukaranPoinController extends Controller
{
    #[OA\Get(
        path: "/admin/penukaran-poin",
        summary: "Daftar semua penukaran poin",
        description: "Mengambil daftar semua penukaran poin dari seluruh warga dengan pencarian dan filter tanggal.",
        tags: ["Admin - Penukaran Poin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Cari berdasarkan nama warga",
                schema: new OA\Schema(type: "string", example: "Budi")
            ),
            new OA\Parameter(
                name: "dari",
                in: "query",
                required: false,
                description: "Filter dari tanggal (YYYY-MM-DD)",
                schema: new OA\Schema(type: "string", example: "2026-01-01")
            ),
            new OA\Parameter(
                name: "sampai",
                in: "query",
                required: false,
                description: "Filter sampai tanggal (YYYY-MM-DD)",
                schema: new OA\Schema(type: "string", example: "2026-12-31")
            ),
            new OA\Parameter(
                name: "page",
                in: "query",
                required: false,
                description: "Halaman",
                schema: new OA\Schema(type: "integer", example: 1)
            ),
            new OA\Parameter(
                name: "per_page",
                in: "query",
                required: false,
                description: "Item per halaman",
                schema: new OA\Schema(type: "integer", example: 10)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar penukaran poin berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "summary", type: "object"),
                        new OA\Property(property: "pagination", type: "object"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        $query = PenukaranPoin::with('warga', 'voucher');

        // Search by nama warga
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('warga', function ($q) use ($search) {
                $q->where('nama_warga', 'like', "%$search%");
            });
        }

        // Filter by date range
        if ($request->filled('dari')) {
            $query->where('tanggal_pengajuan', '>=', $request->query('dari'));
        }
        if ($request->filled('sampai')) {
            $query->where('tanggal_pengajuan', '<=', $request->query('sampai') . ' 23:59:59');
        }

        $query->orderBy('tanggal_pengajuan', 'desc');

        $perPage = $request->query('per_page', 10);
        $penukaran = $query->paginate($perPage);

        // Summary for current month
        $now = now();
        $summaryQuery = PenukaranPoin::whereYear('tanggal_pengajuan', $now->year)
            ->whereMonth('tanggal_pengajuan', $now->month);

        $totalPenukaran = (clone $summaryQuery)->count();
        $totalPoin = (clone $summaryQuery)->sum('poin_digunakan');

        // Ketersediaan voucher (total jumlah_tersedia dari semua voucher aktif)
        $ketersediaanVoucher = Voucher::where('status', 'tersedia')->sum('jumlah_tersedia');

        $data = $penukaran->map(function ($item) {
            return [
                'penukaran_id' => $item->penukaran_id,
                'nama_warga' => $item->warga?->nama_warga ?? '-',
                'no_telepon' => $item->warga?->no_telepon ?? '-',
                'nama_voucher' => $item->voucher?->nama_voucher ?? '-',
                'deskripsi_voucher' => $item->voucher?->deskripsi ?? '-',
                'poin_voucher' => $item->voucher?->poin_dibutuhkan ?? 0,
                'poin_digunakan' => $item->poin_digunakan,
                'saldo_sebelum' => $item->saldo_sebelum,
                'saldo_sesudah' => $item->saldo_sesudah,
                'tanggal_pengajuan' => $item->tanggal_pengajuan->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'message' => 'Daftar penukaran poin berhasil diambil.',
            'data' => $data,
            'summary' => [
                'total_penukaran' => $totalPenukaran,
                'total_poin' => $totalPoin,
                'ketersediaan_voucher' => $ketersediaanVoucher,
            ],
            'pagination' => [
                'current_page' => $penukaran->currentPage(),
                'total' => $penukaran->total(),
                'per_page' => $penukaran->perPage(),
                'last_page' => $penukaran->lastPage(),
                'from' => $penukaran->firstItem(),
                'to' => $penukaran->lastItem(),
            ],
        ]);
    }
}
