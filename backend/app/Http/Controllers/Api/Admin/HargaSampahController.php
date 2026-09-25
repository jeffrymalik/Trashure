<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HargaSampah;
use App\Models\JenisSampah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class HargaSampahController extends Controller
{
    #[OA\Get(
        path: "/admin/harga-sampah",
        summary: "Daftar harga sampah (Admin)",
        description: "Mengambil daftar harga sampah beserta data jenis sampah terkait. Mendukung pencarian berdasarkan nama jenis sampah, filter berdasarkan status, dan pagination.",
        tags: ["Admin - Harga Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Pencarian berdasarkan nama jenis sampah",
                schema: new OA\Schema(type: "string", example: "Plastik")
            ),
            new OA\Parameter(
                name: "status",
                in: "query",
                required: false,
                description: "Filter berdasarkan status",
                schema: new OA\Schema(type: "string", enum: ["aktif", "nonaktif"], example: "aktif")
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
                description: "Daftar harga sampah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar harga & poin sampah berhasil diambil."),
                        new OA\Property(property: "data", type: "object", description: "Data pagination")
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
    public function index(Request $request)
    {
        $query = HargaSampah::with('jenisSampah')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('jenisSampah', function ($q) use ($search) {
                $q->where('nama_jenis_sampah', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $hargaSampah = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'message' => 'Daftar harga & poin sampah berhasil diambil.',
            'data' => $hargaSampah,
        ]);
    }

    #[OA\Post(
        path: "/admin/harga-sampah",
        summary: "Tambah harga sampah baru (Admin)",
        description: "Menambahkan data tarif harga dan poin baru untuk jenis sampah yang sudah ada di database.",
        tags: ["Admin - Harga Sampah"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["jenis_sampah_id", "harga_per_satuan", "nilai_poin_per_satuan", "berlaku_mulai", "status"],
                properties: [
                    new OA\Property(property: "jenis_sampah_id", type: "integer", example: 1, description: "ID jenis sampah dari database"),
                    new OA\Property(property: "harga_per_satuan", type: "number", format: "float", example: 5000, description: "Harga per satuan (Rp)"),
                    new OA\Property(property: "nilai_poin_per_satuan", type: "number", format: "float", example: 50, description: "Nilai poin per satuan"),
                    new OA\Property(property: "berlaku_mulai", type: "string", format: "date", example: "2026-09-01", description: "Tanggal berlaku mulai"),
                    new OA\Property(property: "berlaku_selesai", type: "string", format: "date", nullable: true, example: "2026-12-31", description: "Tanggal berlaku selesai (opsional)"),
                    new OA\Property(property: "status", type: "string", enum: ["aktif", "nonaktif"], example: "aktif", description: "Status harga sampah"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Data harga dan poin sampah berhasil ditambahkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data harga dan poin sampah berhasil ditambahkan."),
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
            'jenis_sampah_id' => ['required', 'exists:jenis_sampah,jenis_sampah_id'],
            'harga_per_satuan' => ['required', 'numeric', 'min:0'],
            'nilai_poin_per_satuan' => ['required', 'numeric', 'min:0'],
            'berlaku_mulai' => ['required', 'date'],
            'berlaku_selesai' => ['nullable', 'date', 'after_or_equal:berlaku_mulai'],
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $hargaSampah = HargaSampah::create([
            'jenis_sampah_id' => $validated['jenis_sampah_id'],
            'harga_per_satuan' => $validated['harga_per_satuan'],
            'nilai_poin_per_satuan' => $validated['nilai_poin_per_satuan'],
            'berlaku_mulai' => $validated['berlaku_mulai'],
            'berlaku_selesai' => $validated['berlaku_selesai'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Data tarif harga dan poin sampah berhasil ditambahkan.',
            'data' => $hargaSampah->load('jenisSampah'),
        ], 201);
    }

    #[OA\Get(
        path: "/admin/harga-sampah/{id}",
        summary: "Detail harga sampah (Admin)",
        description: "Mengambil detail data harga sampah berdasarkan ID beserta data jenis sampah terkait.",
        tags: ["Admin - Harga Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Harga Sampah",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail harga sampah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Detail harga sampah berhasil diambil."),
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
                description: "Data harga sampah tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data harga sampah tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function show($id)
    {
        $hargaSampah = HargaSampah::with('jenisSampah')->find($id);

        if (!$hargaSampah) {
            return response()->json([
                'message' => 'Data harga sampah tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail harga sampah berhasil diambil.',
            'data' => $hargaSampah,
        ]);
    }

    #[OA\Put(
        path: "/admin/harga-sampah/{id}",
        summary: "Perbarui harga sampah (Admin)",
        description: "Memperbarui data harga dan poin sampah. Field bersifat opsional (partial update).",
        tags: ["Admin - Harga Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Harga Sampah",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "nama_jenis_sampah", type: "string", maxLength: 100, example: "Plastik Premium", description: "Nama jenis sampah"),
                    new OA\Property(property: "satuan", type: "string", maxLength: 20, example: "kg", description: "Satuan ukur"),
                    new OA\Property(property: "harga_per_satuan", type: "number", format: "float", example: 6000, description: "Harga per satuan (Rp)"),
                    new OA\Property(property: "nilai_poin_per_satuan", type: "number", format: "float", example: 60, description: "Nilai poin per satuan"),
                    new OA\Property(property: "berlaku_mulai", type: "string", format: "date", example: "2026-09-01", description: "Tanggal berlaku mulai"),
                    new OA\Property(property: "berlaku_selesai", type: "string", format: "date", nullable: true, example: "2026-12-31", description: "Tanggal berlaku selesai"),
                    new OA\Property(property: "status", type: "string", enum: ["aktif", "nonaktif"], example: "aktif", description: "Status harga sampah"),
                    new OA\Property(property: "keterangan", type: "string", nullable: true, example: "Diperbarui harga terbaru", description: "Keterangan tambahan"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Data harga sampah berhasil diperbarui",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data harga sampah berhasil diperbarui."),
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
                description: "Data harga sampah tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data harga sampah tidak ditemukan.")
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
        $hargaSampah = HargaSampah::find($id);

        if (!$hargaSampah) {
            return response()->json([
                'message' => 'Data harga sampah tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'harga_per_satuan' => ['sometimes', 'required', 'numeric', 'min:0'],
            'nilai_poin_per_satuan' => ['sometimes', 'required', 'numeric', 'min:0'],
            'berlaku_mulai' => ['sometimes', 'required', 'date'],
            'berlaku_selesai' => ['nullable', 'date', 'after_or_equal:berlaku_mulai'],
            'status' => ['sometimes', 'required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $hargaSampah->update($validated);

        return response()->json([
            'message' => 'Data tarif harga & poin berhasil diperbarui.',
            'data' => $hargaSampah->fresh()->load('jenisSampah'),
        ]);
    }

    #[OA\Delete(
        path: "/admin/harga-sampah/{id}",
        summary: "Hapus harga sampah (Admin)",
        description: "Menghapus data harga dan poin sampah berdasarkan ID.",
        tags: ["Admin - Harga Sampah"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Harga Sampah",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Data harga sampah berhasil dihapus",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data harga sampah berhasil dihapus.")
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
                description: "Data harga sampah tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Data harga sampah tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function destroy($id)
    {
        $hargaSampah = HargaSampah::find($id);

        if (!$hargaSampah) {
            return response()->json([
                'message' => 'Data harga sampah tidak ditemukan.',
            ], 404);
        }

        $hargaSampah->delete();

        return response()->json([
            'message' => 'Data harga sampah berhasil dihapus.',
        ]);
    }

    /**
     * Mengambil daftar master jenis sampah yang ada di database untuk pilihan combo box.
     */
    public function jenisSampahList()
    {
        $jenisSampah = JenisSampah::where('status', 'aktif')
            ->orderBy('nama_jenis_sampah')
            ->get(['jenis_sampah_id', 'nama_jenis_sampah', 'satuan', 'keterangan', 'status']);

        return response()->json([
            'message' => 'Daftar jenis sampah berhasil diambil.',
            'data' => $jenisSampah,
        ]);
    }
}

