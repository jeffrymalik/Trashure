<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admin - Voucher",
    description: "API Master Data Voucher untuk Admin (Kelola voucher penukaran poin, jumlah poin, stok ketersediaan, dan status)."
)]
#[OA\Schema(
    schema: "Voucher",
    title: "Voucher",
    description: "Voucher penukaran poin yang tersedia untuk warga.",
    required: [
        "voucher_id",
        "nama_voucher",
        "poin_dibutuhkan",
        "jumlah_tersedia",
        "status",
    ],
    properties: [
        new OA\Property(
            property: "voucher_id",
            type: "integer",
            format: "int64",
            description: "ID unik voucher.",
            example: 1,
        ),
        new OA\Property(
            property: "nama_voucher",
            type: "string",
            maxLength: 100,
            description: "Nama voucher.",
            example: "Voucher Rp10.000",
        ),
        new OA\Property(
            property: "deskripsi",
            type: "string",
            nullable: true,
            description: "Deskripsi voucher.",
            example: "Voucher senilai Rp10.000",
        ),
        new OA\Property(
            property: "poin_dibutuhkan",
            type: "integer",
            description: "Jumlah poin yang dibutuhkan untuk menukar voucher.",
            example: 1000,
        ),
        new OA\Property(
            property: "jumlah_tersedia",
            type: "integer",
            description: "Jumlah voucher yang tersedia.",
            example: 100,
        ),
        new OA\Property(
            property: "status",
            type: "string",
            enum: ["tersedia", "habis", "tidak_aktif"],
            description: "Status ketersediaan voucher.",
            example: "tersedia",
        ),
        new OA\Property(
            property: "created_at",
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Waktu voucher dibuat.",
        ),
        new OA\Property(
            property: "updated_at",
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Waktu voucher terakhir diperbarui.",
        ),
    ],
)]
#[OA\Schema(
    schema: "VoucherListItem",
    title: "Voucher (Item Admin)",
    description: "Voucher beserta jumlah total penukaran poin.",
    allOf: [
        new OA\Schema(ref: "#/components/schemas/Voucher"),
        new OA\Schema(
            properties: [
                new OA\Property(
                    property: "total_ditukar",
                    type: "integer",
                    description: "Total jumlah voucher yang telah ditukar warga.",
                    example: 12,
                ),
            ]
        ),
    ],
)]
class VoucherController extends Controller
{
    #[OA\Get(
        path: "/admin/voucher",
        summary: "Daftar voucher (Admin)",
        description: "Mengambil daftar voucher penukaran poin. Mendukung pencarian berdasarkan nama voucher, filter berdasarkan status, dan pagination.",
        tags: ["Admin - Voucher"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Pencarian berdasarkan nama voucher",
                schema: new OA\Schema(type: "string", example: "Rp10.000")
            ),
            new OA\Parameter(
                name: "status",
                in: "query",
                required: false,
                description: "Filter berdasarkan status",
                schema: new OA\Schema(type: "string", enum: ["tersedia", "habis", "tidak_aktif"], example: "tersedia")
            ),
            new OA\Parameter(
                name: "per_page",
                in: "query",
                required: false,
                description: "Jumlah data per halaman",
                schema: new OA\Schema(type: "integer", example: 15)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar voucher berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Daftar voucher berhasil diambil.",
                        ),
                        new OA\Property(
                            property: "data",
                            type: "array",
                            description: "Daftar voucher.",
                            items: new OA\Items(ref: "#/components/schemas/VoucherListItem"),
                        ),
                        new OA\Property(
                            property: "meta",
                            ref: "#/components/schemas/PaginationMeta",
                            description: "Metadata paginasi (muncul jika parameter 'per_page' diisi).",
                        ),
                    ],
                ),
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
    public function index(Request $request)
    {
        $query = Voucher::query()
            ->withCount('penukaranPoin as total_ditukar')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('nama_voucher', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $vouchers = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'message' => 'Daftar voucher berhasil diambil.',
            'data' => $vouchers->items(),
            'meta' => [
                'current_page' => $vouchers->currentPage(),
                'last_page' => $vouchers->lastPage(),
                'per_page' => $vouchers->perPage(),
                'total' => $vouchers->total(),
                'from' => $vouchers->firstItem(),
                'to' => $vouchers->lastItem(),
            ],
        ]);
    }

    #[OA\Post(
        path: "/admin/voucher",
        summary: "Tambah voucher baru (Admin)",
        description: "Menambahkan data voucher penukaran poin baru ke dalam sistem.",
        tags: ["Admin - Voucher"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_voucher", "poin_dibutuhkan"],
                properties: [
                    new OA\Property(property: "nama_voucher", type: "string", example: "Voucher Rp10.000", description: "Nama voucher"),
                    new OA\Property(property: "deskripsi", type: "string", nullable: true, example: "Voucher senilai Rp10.000", description: "Deskripsi voucher"),
                    new OA\Property(property: "poin_dibutuhkan", type: "integer", example: 1000, description: "Jumlah poin yang dibutuhkan untuk menukar voucher"),
                    new OA\Property(property: "jumlah_tersedia", type: "integer", example: 100, description: "Jumlah voucher yang tersedia"),
                    new OA\Property(property: "status", type: "string", enum: ["tersedia", "habis", "tidak_aktif"], example: "tersedia", description: "Status voucher"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Data voucher berhasil ditambahkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Data voucher berhasil ditambahkan.",
                        ),
                        new OA\Property(
                            property: "data",
                            ref: "#/components/schemas/VoucherListItem",
                        ),
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
                response: 422,
                description: "Validasi gagal",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "The given data was invalid.")
                    ]
                )
            )
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_voucher' => ['required', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'poin_dibutuhkan' => ['required', 'integer', 'min:0'],
            'jumlah_tersedia' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['tersedia', 'habis', 'tidak_aktif'])],
        ]);

        $voucher = Voucher::create([
            'nama_voucher' => $validated['nama_voucher'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'poin_dibutuhkan' => $validated['poin_dibutuhkan'],
            'jumlah_tersedia' => $validated['jumlah_tersedia'] ?? 0,
            'status' => $validated['status'] ?? 'tersedia',
        ]);

        return response()->json([
            'message' => 'Data voucher berhasil ditambahkan.',
            'data' => $voucher->loadCount('penukaranPoin as total_ditukar'),
        ], 201);
    }

    #[OA\Get(
        path: "/admin/voucher/{id}",
        summary: "Detail voucher (Admin)",
        description: "Mengambil detail data voucher berdasarkan ID.",
        tags: ["Admin - Voucher"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Voucher",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail voucher berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Detail voucher berhasil diambil.",
                        ),
                        new OA\Property(
                            property: "data",
                            ref: "#/components/schemas/VoucherListItem",
                        ),
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
                description: "Data voucher tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data voucher tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function show($id)
    {
        $voucher = Voucher::withCount('penukaranPoin as total_ditukar')->find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Data voucher tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail voucher berhasil diambil.',
            'data' => $voucher,
        ]);
    }

    #[OA\Put(
        path: "/admin/voucher/{id}",
        summary: "Perbarui voucher (Admin)",
        description: "Memperbarui data voucher. Field bersifat opsional (partial update).",
        tags: ["Admin - Voucher"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Voucher",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "nama_voucher", type: "string", maxLength: 100, example: "Voucher Rp10.000", description: "Nama voucher"),
                    new OA\Property(property: "deskripsi", type: "string", nullable: true, example: "Voucher senilai Rp10.000", description: "Deskripsi voucher"),
                    new OA\Property(property: "poin_dibutuhkan", type: "integer", example: 1000, description: "Jumlah poin yang dibutuhkan untuk menukar voucher"),
                    new OA\Property(property: "jumlah_tersedia", type: "integer", example: 100, description: "Jumlah voucher yang tersedia"),
                    new OA\Property(property: "status", type: "string", enum: ["tersedia", "habis", "tidak_aktif"], example: "tersedia", description: "Status voucher"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Data voucher berhasil diperbarui",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Data voucher berhasil diperbarui.",
                        ),
                        new OA\Property(
                            property: "data",
                            ref: "#/components/schemas/VoucherListItem",
                        ),
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
                description: "Data voucher tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data voucher tidak ditemukan.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Validasi gagal",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "The given data was invalid.")
                    ]
                )
            )
        ]
    )]
    public function update(Request $request, $id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Data voucher tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'nama_voucher' => ['sometimes', 'required', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'poin_dibutuhkan' => ['sometimes', 'required', 'integer', 'min:0'],
            'jumlah_tersedia' => ['nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'nullable', Rule::in(['tersedia', 'habis', 'tidak_aktif'])],
        ]);

        $voucher->update($validated);

        return response()->json([
            'message' => 'Data voucher berhasil diperbarui.',
            'data' => $voucher->fresh()->loadCount('penukaranPoin as total_ditukar'),
        ]);
    }

    #[OA\Delete(
        path: "/admin/voucher/{id}",
        summary: "Hapus voucher (Admin)",
        description: "Menghapus data voucher berdasarkan ID.",
        tags: ["Admin - Voucher"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Voucher",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Data voucher berhasil dihapus",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data voucher berhasil dihapus.")
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
                description: "Data voucher tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data voucher tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function destroy($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json([
                'message' => 'Data voucher tidak ditemukan.',
            ], 404);
        }

        $voucher->delete();

        return response()->json([
            'message' => 'Data voucher berhasil dihapus.',
        ]);
    }
}