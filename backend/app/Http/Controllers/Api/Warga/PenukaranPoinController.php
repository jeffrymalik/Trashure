<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\SaldoPoin;
use App\Models\PenukaranPoin;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use OpenApi\Attributes as OA;

class PenukaranPoinController extends Controller
{
    #[OA\Get(
        path: "/warga/penukaran-poin/hadiah",
        summary: "Daftar hadiah/voucher untuk ditukar",
        description: "Mengambil daftar hadiah/voucher yang tersedia untuk ditukar dengan poin warga.",
        tags: ["Warga - Penukaran Poin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "kategori",
                in: "query",
                required: false,
                description: "Filter kategori voucher",
                schema: new OA\Schema(type: "string", example: "voucher")
            ),
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Cari berdasarkan nama voucher",
                schema: new OA\Schema(type: "string", example: "Voucher")
            ),
            new OA\Parameter(
                name: "sort",
                in: "query",
                required: false,
                description: "Urutkan berdasarkan poin (asc/desc)",
                schema: new OA\Schema(type: "string", enum: ["asc", "desc"], example: "asc")
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
                schema: new OA\Schema(type: "integer", example: 12)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar hadiah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar hadiah berhasil diambil."),
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "pagination", type: "object")
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
            )
        ]
    )]
    public function daftarHadiah(Request $request)
    {
        $query = Voucher::where('status', 'tersedia');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('nama_voucher', 'like', "%$search%");
        }

        $sort = $request->query('sort', 'asc');
        $query->orderBy('poin_dibutuhkan', $sort);

        $perPage = $request->query('per_page', 12);
        $vouchers = $query->paginate($perPage);

        $data = $vouchers->map(function ($voucher) {
            return [
                'voucher_id' => $voucher->voucher_id,
                'nama_voucher' => $voucher->nama_voucher,
                'deskripsi' => $voucher->deskripsi,
                'poin_dibutuhkan' => $voucher->poin_dibutuhkan,
                'jumlah_tersedia' => $voucher->jumlah_tersedia,
                'status' => $voucher->status,
            ];
        });

        return response()->json([
            'message' => 'Daftar hadiah berhasil diambil.',
            'data' => $data,
            'pagination' => [
                'current_page' => $vouchers->currentPage(),
                'total' => $vouchers->total(),
                'per_page' => $vouchers->perPage(),
                'last_page' => $vouchers->lastPage(),
                'from' => $vouchers->firstItem(),
                'to' => $vouchers->lastItem(),
            ],
        ]);
    }

    #[OA\Get(
        path: "/warga/penukaran-poin/saldo",
        summary: "Saldo poin warga",
        description: "Mengambil saldo poin warga yang sedang login.",
        tags: ["Warga - Penukaran Poin"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Saldo poin berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Saldo poin berhasil diambil."),
                        new OA\Property(
                            property: "data",
                            type: "object",
                            properties: [
                                new OA\Property(property: "saldo_poin", type: "integer", example: 1250),
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
    public function getSaldo(Request $request)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $saldoPoin = SaldoPoin::where('warga_id', $warga->warga_id)->first();
        $saldo = $saldoPoin?->saldo_poin ?? 0;

        return response()->json([
            'message' => 'Saldo poin berhasil diambil.',
            'data' => [
                'saldo_poin' => (int) $saldo,
            ],
        ]);
    }

    #[OA\Post(
        path: "/warga/penukaran-poin/tukar",
        summary: "Tukar poin dengan hadiah",
        description: "Menukar poin warga dengan hadiah/voucher yang tersedia.",
        tags: ["Warga - Penukaran Poin"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["voucher_id"],
                properties: [
                    new OA\Property(property: "voucher_id", type: "integer", example: 1),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Penukaran poin berhasil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Penukaran poin berhasil."),
                        new OA\Property(
                            property: "data",
                            type: "object",
                            properties: [
                                new OA\Property(property: "penukaran_id", type: "integer", example: 1),
                                new OA\Property(property: "voucher_id", type: "integer", example: 1),
                                new OA\Property(property: "poin_digunakan", type: "integer", example: 500),
                                new OA\Property(property: "saldo_sebelum", type: "integer", example: 1250),
                                new OA\Property(property: "saldo_sesudah", type: "integer", example: 750),
                                new OA\Property(property: "status_penukaran", type: "string", example: "diajukan"),
                            ]
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Validasi gagal",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Saldo poin tidak cukup.")
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
                description: "Voucher atau warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Voucher tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function tukarPoin(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|integer|exists:voucher,voucher_id',
        ]);

        $warga = $request->user()->warga;
        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $voucher = Voucher::find($request->voucher_id);
        if (!$voucher || $voucher->status !== 'tersedia') {
            return response()->json([
                'message' => 'Voucher tidak tersedia.',
            ], 404);
        }

        if ($voucher->jumlah_tersedia <= 0) {
            return response()->json([
                'message' => 'Stok voucher habis.',
            ], 400);
        }

        $saldoPoin = SaldoPoin::where('warga_id', $warga->warga_id)->first();
        $saldoSaat = $saldoPoin?->saldo_poin ?? 0;

        if ($saldoSaat < $voucher->poin_dibutuhkan) {
            return response()->json([
                'message' => 'Saldo poin tidak cukup.',
            ], 400);
        }

        try {
            \DB::beginTransaction();

            $saldoSesudah = $saldoSaat - $voucher->poin_dibutuhkan;

            $penukaran = PenukaranPoin::create([
                'warga_id' => $warga->warga_id,
                'voucher_id' => $voucher->voucher_id,
                'tanggal_pengajuan' => Carbon::now(),
                'poin_digunakan' => $voucher->poin_dibutuhkan,
                'saldo_sebelum' => $saldoSaat,
                'saldo_sesudah' => $saldoSesudah,
                'status_penukaran' => 'diajukan',
            ]);

            $saldoPoin->update([
                'saldo_poin' => $saldoSesudah,
                'terakhir_diperbarui' => Carbon::now(),
            ]);

            $voucher->decrement('jumlah_tersedia');

            \DB::commit();

            return response()->json([
                'message' => 'Penukaran poin berhasil.',
                'data' => [
                    'penukaran_id' => $penukaran->penukaran_id,
                    'voucher_id' => $penukaran->voucher_id,
                    'poin_digunakan' => $penukaran->poin_digunakan,
                    'saldo_sebelum' => $penukaran->saldo_sebelum,
                    'saldo_sesudah' => $penukaran->saldo_sesudah,
                    'status_penukaran' => $penukaran->status_penukaran,
                ],
            ], 200);
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'message' => 'Gagal melakukan penukaran poin.',
            ], 500);
        }
    }

    #[OA\Get(
        path: "/warga/penukaran-poin/riwayat",
        summary: "Riwayat penukaran poin warga",
        description: "Mengambil riwayat penukaran poin warga yang sedang login.",
        tags: ["Warga - Penukaran Poin"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "sort",
                in: "query",
                required: false,
                description: "Urutkan berdasarkan tanggal (terbaru/terlama)",
                schema: new OA\Schema(type: "string", enum: ["terbaru", "terlama"], example: "terbaru")
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
                description: "Riwayat penukaran berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Riwayat penukaran berhasil diambil."),
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "pagination", type: "object")
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
    public function riwayatPenukaran(Request $request)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $query = PenukaranPoin::where('warga_id', $warga->warga_id)
            ->with('voucher');

        $sort = $request->query('sort', 'terbaru');
        if ($sort === 'terlama') {
            $query->orderBy('tanggal_pengajuan', 'asc');
        } else {
            $query->orderBy('tanggal_pengajuan', 'desc');
        }

        $perPage = $request->query('per_page', 10);
        $riwayat = $query->paginate($perPage);

        $data = $riwayat->map(function ($item) {
            return [
                'penukaran_id' => $item->penukaran_id,
                'nama_voucher' => $item->voucher?->nama_voucher,
                'tanggal_pengajuan' => $item->tanggal_pengajuan->format('Y-m-d H:i:s'),
                'poin_digunakan' => $item->poin_digunakan,
                'status_penukaran' => $item->status_penukaran,
            ];
        });

        return response()->json([
            'message' => 'Riwayat penukaran berhasil diambil.',
            'data' => $data,
            'pagination' => [
                'current_page' => $riwayat->currentPage(),
                'total' => $riwayat->total(),
                'per_page' => $riwayat->perPage(),
                'last_page' => $riwayat->lastPage(),
                'from' => $riwayat->firstItem(),
                'to' => $riwayat->lastItem(),
            ],
        ]);
    }
}
