<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\JenisSampah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admin - Jenis Sampah",
    description: "API Master Data Jenis Sampah untuk Admin (Kelola data jenis sampah, satuan, keterangan, dan status)."
)]
#[OA\Schema(
    schema: "HargaSampah",
    title: "Harga Sampah",
    description: "Aturan harga per satuan untuk suatu jenis sampah.",
    required: ["harga_id", "jenis_sampah_id", "harga_per_satuan", "nilai_poin_per_satuan", "berlaku_mulai", "status"],
    properties: [
        new OA\Property(
            property: "harga_id",
            type: "integer",
            format: "int64",
            description: "ID unik harga.",
            example: 1,
        ),
        new OA\Property(
            property: "jenis_sampah_id",
            type: "integer",
            format: "int64",
            description: "ID jenis sampah terkait.",
            example: 1,
        ),
        new OA\Property(
            property: "harga_per_satuan",
            type: "number",
            format: "double",
            description: "Harga pembelian per satuan dalam rupiah.",
            example: 5000,
        ),
        new OA\Property(
            property: "nilai_poin_per_satuan",
            type: "number",
            description: "Nilai poin yang diberikan per satuan.",
            example: 10,
        ),
        new OA\Property(
            property: "berlaku_mulai",
            type: "string",
            format: "date",
            description: "Tanggal harga mulai berlaku.",
            example: "2026-09-01",
        ),
        new OA\Property(
            property: "berlaku_selesai",
            type: "string",
            format: "date",
            nullable: true,
            description: "Tanggal harga berakhir (null jika masih berlaku).",
        ),
        new OA\Property(
            property: "status",
            type: "string",
            enum: ["aktif", "nonaktif"],
            description: "Status harga.",
            example: "aktif",
        ),
    ],
)]
#[OA\Schema(
    schema: "JenisSampahListItem",
    title: "Jenis Sampah (Item Admin)",
    description: "Jenis sampah beserta harga aktif yang sedang berlaku.",
    allOf: [
        new OA\Schema(ref: "#/components/schemas/JenisSampah"),
        new OA\Schema(
            properties: [
                new OA\Property(
                    property: "harga_aktif",
                    description: "Harga aktif yang sedang berlaku.",
                    nullable: true,
                    allOf: [new OA\Schema(ref: "#/components/schemas/HargaSampah")],
                ),
            ]
        ),
    ],
)]
#[OA\Schema(
    schema: "AdminJenisSampah",
    title: "Jenis Sampah (Detail Admin)",
    description: "Detail lengkap jenis sampah beserta harga aktif dan riwayat harga.",
    allOf: [
        new OA\Schema(ref: "#/components/schemas/JenisSampah"),
        new OA\Schema(
            properties: [
                new OA\Property(
                    property: "harga_aktif",
                    description: "Harga aktif yang sedang berlaku.",
                    nullable: true,
                    allOf: [new OA\Schema(ref: "#/components/schemas/HargaSampah")],
                ),
                new OA\Property(
                    property: "harga_sampah",
                    type: "array",
                    description: "Riwayat seluruh harga, terurut berdasarkan tanggal berlaku terbaru.",
                    items: new OA\Items(ref: "#/components/schemas/HargaSampah"),
                ),
            ]
        ),
    ],
)]
#[OA\Schema(
    schema: "PaginationMeta",
    title: "Metadata Paginasi",
    description: "Metadata paginasi Laravel.",
    properties: [
        new OA\Property(property: "current_page", type: "integer", example: 1),
        new OA\Property(property: "last_page", type: "integer", example: 1),
        new OA\Property(property: "per_page", type: "integer", example: 10),
        new OA\Property(property: "total", type: "integer", example: 25),
        new OA\Property(property: "from", type: "integer", nullable: true, example: 1),
        new OA\Property(property: "to", type: "integer", nullable: true, example: 10),
    ],
)]
class JenisSampahController extends Controller
{
    #[OA\Get(
        path: "/admin/jenis-sampah",
        summary: "Daftar jenis sampah (Admin)",
        description: "Mengambil daftar master jenis sampah beserta harga aktif, dengan pencarian dan filter satuan/status. Mendukung pengurutan serta paginasi.",
        tags: ["Admin - Jenis Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Cari berdasarkan nama jenis sampah.",
                schema: new OA\Schema(type: "string"),
            ),
            new OA\Parameter(
                name: "satuan",
                in: "query",
                required: false,
                description: "Filter berdasarkan satuan. Gunakan 'Semua Satuan' atau 'semua' untuk menampilkan semua.",
                schema: new OA\Schema(type: "string"),
            ),
            new OA\Parameter(
                name: "status",
                in: "query",
                required: false,
                description: "Filter berdasarkan status. Gunakan 'Semua Status' atau 'semua' untuk menampilkan semua.",
                schema: new OA\Schema(type: "string", enum: ["aktif", "nonaktif", "Semua Status", "semua"]),
            ),
            new OA\Parameter(
                name: "sort_by",
                in: "query",
                required: false,
                description: "Kolom pengurutan data.",
                schema: new OA\Schema(type: "string", default: "jenis_sampah_id"),
            ),
            new OA\Parameter(
                name: "sort_dir",
                in: "query",
                required: false,
                description: "Arah pengurutan data.",
                schema: new OA\Schema(type: "string", enum: ["asc", "desc"], default: "asc"),
            ),
            new OA\Parameter(
                name: "per_page",
                in: "query",
                required: false,
                description: "Jumlah data per halaman. Jika diisi, respons akan memuat objek 'meta' paginasi.",
                schema: new OA\Schema(type: "integer", example: 10),
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar jenis sampah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Daftar jenis sampah berhasil diambil.",
                        ),
                        new OA\Property(
                            property: "data",
                            type: "array",
                            description: "Daftar jenis sampah.",
                            items: new OA\Items(ref: "#/components/schemas/JenisSampahListItem"),
                        ),
                        new OA\Property(
                            property: "meta",
                            ref: "#/components/schemas/PaginationMeta",
                            description: "Metadata paginasi (hanya muncul jika parameter 'per_page' diisi).",
                        ),
                        new OA\Property(
                            property: "total",
                            type: "integer",
                            nullable: true,
                            description: "Total data (muncul jika tanpa paginasi).",
                            example: 15,
                        ),
                    ],
                ),
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Unauthenticated."),
                    ],
                ),
            ),
        ],
    )]
    public function index(Request $request)
    {
        $query = JenisSampah::with('hargaAktif');

        // Search by name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama_jenis_sampah', 'like', "%{$search}%");
        }


        // Filter by unit
        if ($request->filled('satuan') && $request->satuan !== 'Semua Satuan' && $request->satuan !== 'semua') {
            $query->where('satuan', $request->satuan);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'Semua Status' && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        $sortField = $request->get('sort_by', 'jenis_sampah_id');
        $sortDirection = $request->get('sort_dir', 'asc');
        $query->orderBy($sortField, $sortDirection);

        if ($request->has('per_page') && is_numeric($request->per_page)) {
            $perPage = (int) $request->per_page;
            $data = $query->paginate($perPage);

            return response()->json([
                'message' => 'Daftar jenis sampah berhasil diambil.',
                'data' => $data->items(),
                'meta' => [
                    'current_page' => $data->currentPage(),
                    'last_page' => $data->lastPage(),
                    'per_page' => $data->perPage(),
                    'total' => $data->total(),
                    'from' => $data->firstItem(),
                    'to' => $data->lastItem(),
                ],
            ]);
        }

        $data = $query->get();

        return response()->json([
            'message' => 'Daftar jenis sampah berhasil diambil.',
            'data' => $data,
            'total' => $data->count(),
        ]);
    }

    #[OA\Post(
        path: "/admin/jenis-sampah",
        summary: "Tambah jenis sampah baru (Admin)",
        description: "Menambahkan data master jenis sampah baru (nama, satuan, status, keterangan).",
        tags: ["Admin - Jenis Sampah"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_jenis_sampah", "satuan", "status"],
                properties: [
                    new OA\Property(
                        property: "nama_jenis_sampah",
                        type: "string",
                        description: "Nama jenis sampah (unik).",
                        example: "Botol Plastik PET",
                    ),
                    new OA\Property(
                        property: "satuan",
                        type: "string",
                        description: "Satuan penimbangan.",
                        example: "Kg",
                    ),
                    new OA\Property(
                        property: "status",
                        type: "string",
                        enum: ["aktif", "nonaktif", "tidak_aktif"],
                        description: "Status jenis sampah ('tidak_aktif' otomatis disimpan sebagai 'nonaktif').",
                        example: "aktif",
                    ),
                    new OA\Property(
                        property: "keterangan",
                        type: "string",
                        nullable: true,
                        description: "Deskripsi tambahan.",
                        example: "Botol plastik minuman kemasan bersih.",
                    ),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Jenis sampah berhasil ditambahkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Jenis sampah berhasil ditambahkan.",
                        ),
                        new OA\Property(
                            property: "data",
                            ref: "#/components/schemas/JenisSampahListItem",
                        ),
                    ],
                ),
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Unauthenticated."),
                    ],
                ),
            ),
            new OA\Response(
                response: 422,
                description: "Validasi gagal",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Validasi gagal."),
                        new OA\Property(property: "errors", type: "object"),
                    ],
                ),
            ),
        ],
    )]
    public function store(Request $request)
    {
        // Sesuaikan dengan skema tabel jenis_sampah (tanpa harga dan poin)
        $validator = Validator::make($request->all(), [
            'nama_jenis_sampah' => 'required|string|max:100|unique:jenis_sampah,nama_jenis_sampah',
            'satuan' => 'required|string|max:20',
            'keterangan' => 'nullable|string',
            'status' => 'required|string|in:aktif,tidak_aktif,nonaktif',
        ], [
            'nama_jenis_sampah.required' => 'Nama jenis sampah wajib diisi.',
            'nama_jenis_sampah.unique' => 'Nama jenis sampah sudah terdaftar.',
            'satuan.required' => 'Satuan wajib dipilih.',
            'status.required' => 'Status wajib dipilih.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $statusNormalized = $request->status === 'tidak_aktif' ? 'nonaktif' : $request->status;

            $jenisSampah = JenisSampah::create([
                'nama_jenis_sampah' => $request->nama_jenis_sampah,
                'satuan' => $request->satuan,
                'keterangan' => $request->keterangan,
                'status' => $statusNormalized,
            ]);

            return response()->json([
                'message' => 'Jenis sampah berhasil ditambahkan.',
                'data' => $jenisSampah->load('hargaAktif'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menambahkan jenis sampah: ' . $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Get(
        path: "/admin/jenis-sampah/{id}",
        summary: "Detail jenis sampah (Admin)",
        description: "Mengambil detail informasi jenis sampah beserta harga aktif dan riwayat harga berdasarkan ID.",
        tags: ["Admin - Jenis Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Jenis Sampah.",
                schema: new OA\Schema(type: "integer", format: "int64", example: 1),
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail jenis sampah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Detail jenis sampah berhasil diambil.",
                        ),
                        new OA\Property(
                            property: "data",
                            ref: "#/components/schemas/AdminJenisSampah",
                        ),
                    ],
                ),
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Unauthenticated."),
                    ],
                ),
            ),
            new OA\Response(
                response: 404,
                description: "Jenis sampah tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Jenis sampah tidak ditemukan."),
                    ],
                ),
            ),
        ],
    )]
    public function show($id)
    {
        $jenisSampah = JenisSampah::with(['hargaAktif', 'hargaSampah' => function ($q) {
            $q->orderBy('berlaku_mulai', 'desc');
        }])->find($id);

        if (!$jenisSampah) {
            return response()->json([
                'message' => 'Jenis sampah tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail jenis sampah berhasil diambil.',
            'data' => $jenisSampah,
        ]);
    }

    #[OA\Put(
        path: "/admin/jenis-sampah/{id}",
        summary: "Ubah jenis sampah (Admin)",
        description: "Memperbarui master data jenis sampah (nama, satuan, status, keterangan). Seluruh field bersifat opsional (parsial).",
        tags: ["Admin - Jenis Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Jenis Sampah.",
                schema: new OA\Schema(type: "integer", format: "int64", example: 1),
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: "nama_jenis_sampah",
                        type: "string",
                        description: "Nama jenis sampah (unik).",
                        example: "Botol Plastik PET",
                    ),
                    new OA\Property(
                        property: "satuan",
                        type: "string",
                        description: "Satuan penimbangan.",
                        example: "Kg",
                    ),
                    new OA\Property(
                        property: "status",
                        type: "string",
                        enum: ["aktif", "nonaktif", "tidak_aktif"],
                        description: "Status jenis sampah ('tidak_aktif' otomatis disimpan sebagai 'nonaktif').",
                        example: "aktif",
                    ),
                    new OA\Property(
                        property: "keterangan",
                        type: "string",
                        nullable: true,
                        description: "Deskripsi tambahan.",
                        example: "Botol plastik minuman kemasan bersih.",
                    ),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Jenis sampah berhasil diperbarui",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Jenis sampah berhasil diperbarui.",
                        ),
                        new OA\Property(
                            property: "data",
                            ref: "#/components/schemas/JenisSampahListItem",
                        ),
                    ],
                ),
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Unauthenticated."),
                    ],
                ),
            ),
            new OA\Response(
                response: 404,
                description: "Jenis sampah tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Jenis sampah tidak ditemukan."),
                    ],
                ),
            ),
            new OA\Response(
                response: 422,
                description: "Validasi gagal",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Validasi gagal."),
                        new OA\Property(property: "errors", type: "object"),
                    ],
                ),
            ),
        ],
    )]
    public function update(Request $request, $id)
    {
        $jenisSampah = JenisSampah::find($id);

        if (!$jenisSampah) {
            return response()->json([
                'message' => 'Jenis sampah tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_jenis_sampah' => 'sometimes|required|string|max:100|unique:jenis_sampah,nama_jenis_sampah,' . $id . ',jenis_sampah_id',
            'satuan' => 'sometimes|required|string|max:20',
            'keterangan' => 'nullable|string',
            'status' => 'sometimes|required|string|in:aktif,tidak_aktif,nonaktif',
        ], [
            'nama_jenis_sampah.required' => 'Nama jenis sampah wajib diisi.',
            'nama_jenis_sampah.unique' => 'Nama jenis sampah sudah terdaftar.',
            'satuan.required' => 'Satuan wajib dipilih.',
            'status.required' => 'Status wajib dipilih.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $statusNormalized = $request->has('status')
                ? ($request->status === 'tidak_aktif' ? 'nonaktif' : $request->status)
                : $jenisSampah->status;

            $updateData = [];
            if ($request->has('nama_jenis_sampah')) $updateData['nama_jenis_sampah'] = $request->nama_jenis_sampah;
            if ($request->has('satuan')) $updateData['satuan'] = $request->satuan;
            if ($request->has('keterangan')) $updateData['keterangan'] = $request->keterangan;
            if ($request->has('status')) $updateData['status'] = $statusNormalized;

            if (!empty($updateData)) {
                $jenisSampah->update($updateData);
            }

            $jenisSampah->refresh()->load('hargaAktif');

            return response()->json([
                'message' => 'Jenis sampah berhasil diperbarui.',
                'data' => $jenisSampah,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memperbarui jenis sampah: ' . $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Delete(
        path: "/admin/jenis-sampah/{id}",
        summary: "Hapus jenis sampah (Admin)",
        description: "Menghapus jenis sampah beserta riwayat harganya, hanya jika belum memiliki riwayat transaksi (pengajuan/setoran/penjualan).",
        tags: ["Admin - Jenis Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Jenis Sampah.",
                schema: new OA\Schema(type: "integer", format: "int64", example: 1),
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Jenis sampah berhasil dihapus",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Jenis sampah berhasil dihapus.",
                        ),
                    ],
                ),
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Unauthenticated."),
                    ],
                ),
            ),
            new OA\Response(
                response: 404,
                description: "Jenis sampah tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Jenis sampah tidak ditemukan."),
                    ],
                ),
            ),
            new OA\Response(
                response: 422,
                description: "Tidak dapat dihapus karena memiliki transaksi terkait",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Jenis sampah tidak dapat dihapus karena sudah memiliki riwayat transaksi. Anda dapat menonaktifkan statusnya.",
                        ),
                        new OA\Property(property: "has_transactions", type: "boolean", example: true),
                    ],
                ),
            ),
        ],
    )]
    public function destroy($id)
    {
        $jenisSampah = JenisSampah::find($id);

        if (!$jenisSampah) {
            return response()->json([
                'message' => 'Jenis sampah tidak ditemukan.',
            ], 404);
        }

        // Check if there are related records in transactions
        $hasRelations = $jenisSampah->detailPengajuanSampah()->exists()
            || $jenisSampah->detailSetoran()->exists()
            || $jenisSampah->detailPenjualan()->exists();

        if ($hasRelations) {
            return response()->json([
                'message' => 'Jenis sampah tidak dapat dihapus karena sudah memiliki riwayat transaksi. Anda dapat menonaktifkan statusnya.',
                'has_transactions' => true,
            ], 422);
        }

        try {
            // Hapus riwayat harga terkait lalu hapus jenis sampah
            $jenisSampah->hargaSampah()->delete();
            $jenisSampah->delete();

            return response()->json([
                'message' => 'Jenis sampah berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus jenis sampah: ' . $e->getMessage(),
            ], 500);
        }
    }
}