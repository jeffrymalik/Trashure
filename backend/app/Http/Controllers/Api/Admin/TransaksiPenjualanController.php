<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransaksiPenjualan;
use App\Models\DetailPenjualan;
use App\Models\JenisSampah;
use App\Models\StokSampah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admin - Transaksi Penjualan",
    description: "API transaksi penjualan sampah dari bank sampah ke pengepul."
)]
class TransaksiPenjualanController extends Controller
{
    #[OA\Get(
        path: "/admin/penjualan/jenis-sampah",
        summary: "Daftar jenis sampah untuk transaksi penjualan",
        description: "Mengambil daftar jenis sampah beserta harga jual aktif dan stok tersedia untuk form transaksi penjualan.",
        tags: ["Admin - Transaksi Penjualan"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar jenis sampah berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar jenis sampah berhasil diambil."),
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function jenisSampah()
    {
        $data = JenisSampah::with(['hargaSampah' => function ($q) {
            $q->where('status', 'aktif')
              ->whereDate('berlaku_mulai', '<=', now())
              ->where(function ($q) {
                  $q->whereNull('berlaku_selesai')->orWhereDate('berlaku_selesai', '>=', now());
              })
              ->orderByDesc('berlaku_mulai');
        }, 'stokSampah'])->get();

        // Map harga aktif dan stok ke setiap jenis sampah
        $mapped = $data->map(function ($item) {
            $harga = $item->hargaSampah->first();
            return [
                'jenis_sampah_id' => $item->jenis_sampah_id,
                'nama_jenis_sampah' => $item->nama_jenis_sampah,
                'satuan' => $item->satuan ?? 'kg',
                'harga_jual' => $harga ? $harga->harga_per_satuan : 0,
                'stok_tersedia' => $item->stokSampah ? $item->stokSampah->jumlah_stok : 0,
            ];
        });

        return response()->json([
            'message' => 'Daftar jenis sampah berhasil diambil.',
            'data' => $mapped
        ]);
    }

    #[OA\Get(
        path: "/admin/penjualan",
        summary: "Daftar transaksi penjualan",
        description: "Mengambil daftar transaksi penjualan dengan filter status, tanggal, pengepul, dan pencarian.",
        tags: ["Admin - Transaksi Penjualan"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "status", in: "query", required: false, description: "Filter status transaksi", schema: new OA\Schema(type: "string", enum: ["semua", "selesai", "diajukan", "dibatalkan"])),
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Filter tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Filter tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "pengepul_id", in: "query", required: false, description: "Filter berdasarkan pengepul", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "search", in: "query", required: false, description: "Pencarian berdasarkan nama pengepul", schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar transaksi penjualan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar transaksi penjualan berhasil diambil."),
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function index(Request $request)
    {
        $query = TransaksiPenjualan::with(['pengepul', 'admin', 'detailPenjualan.jenisSampah'])
            ->orderByDesc('penjualan_id');

        // Filter status
        if ($request->has('status') && $request->status !== 'semua') {
            $query->where('status_transaksi', $request->status);
        }

        // Filter tanggal
        if ($request->has('dari') && $request->dari) {
            $query->whereDate('tanggal_transaksi', '>=', $request->dari);
        }
        if ($request->has('sampai') && $request->sampai) {
            $query->whereDate('tanggal_transaksi', '<=', $request->sampai);
        }

        // Filter pengepul
        if ($request->has('pengepul_id') && $request->pengepul_id) {
            $query->where('pengepul_id', $request->pengepul_id);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('pengepul', function ($q) use ($search) {
                $q->where('nama_pengepul', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'message' => 'Daftar transaksi penjualan berhasil diambil.',
            'data' => $query->get()
        ]);
    }

    #[OA\Get(
        path: "/admin/penjualan/{id}",
        summary: "Detail transaksi penjualan",
        description: "Mengambil detail transaksi penjualan berdasarkan ID.",
        tags: ["Admin - Transaksi Penjualan"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID transaksi penjualan", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail transaksi penjualan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Detail transaksi penjualan berhasil diambil."),
                        new OA\Property(property: "data", type: "object"),
                    ],
                ),
            ),
            new OA\Response(response: 404, description: "Transaksi penjualan tidak ditemukan"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function show($id)
    {
        $penjualan = TransaksiPenjualan::with(['pengepul', 'admin', 'detailPenjualan.jenisSampah'])
            ->find($id);

        if (!$penjualan) {
            return response()->json(['message' => 'Transaksi penjualan tidak ditemukan.'], 404);
        }

        return response()->json([
            'message' => 'Detail transaksi penjualan berhasil diambil.',
            'data' => $penjualan
        ]);
    }

    #[OA\Post(
        path: "/admin/penjualan",
        summary: "Buat transaksi penjualan baru",
        description: "Membuat transaksi penjualan sampah ke pengepul. Stok sampah akan dikurangi secara otomatis.",
        tags: ["Admin - Transaksi Penjualan"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["pengepul_id", "tanggal_transaksi", "media_konfirmasi", "metode_transaksi", "detail"],
                properties: [
                    new OA\Property(property: "pengepul_id", type: "integer", description: "ID pengepul", example: 1),
                    new OA\Property(property: "tanggal_transaksi", type: "string", format: "date", description: "Tanggal transaksi", example: "2026-09-17"),
                    new OA\Property(property: "media_konfirmasi", type: "string", maxLength: 50, description: "Media konfirmasi", example: "WhatsApp"),
                    new OA\Property(property: "metode_transaksi", type: "string", maxLength: 50, description: "Metode transaksi", example: "Tunai"),
                    new OA\Property(property: "catatan", type: "string", maxLength: 500, nullable: true, description: "Catatan transaksi"),
                    new OA\Property(
                        property: "detail",
                        type: "array",
                        minItems: 1,
                        description: "Detail item penjualan",
                        items: new OA\Items(
                            type: "object",
                            required: ["jenis_sampah_id", "jumlah_terjual"],
                            properties: [
                                new OA\Property(property: "jenis_sampah_id", type: "integer", description: "ID jenis sampah", example: 1),
                                new OA\Property(property: "jumlah_terjual", type: "number", format: "float", description: "Jumlah terjual (kg)", example: 10.5),
                            ],
                        ),
                    ),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Transaksi penjualan berhasil dibuat",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Transaksi penjualan berhasil dibuat."),
                        new OA\Property(property: "data", type: "object"),
                    ],
                ),
            ),
            new OA\Response(response: 422, description: "Validasi error"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function store(Request $request)
    {
        $request->validate([
            'pengepul_id' => 'required|integer|exists:pengepul,pengepul_id',
            'tanggal_transaksi' => 'required|date',
            'media_konfirmasi' => 'required|string|max:50',
            'metode_transaksi' => 'required|string|max:50',
            'catatan' => 'nullable|string|max:500',
            'detail' => 'required|array|min:1',
            'detail.*.jenis_sampah_id' => 'required|integer|exists:jenis_sampah,jenis_sampah_id',
            'detail.*.jumlah_terjual' => 'required|numeric|min:0.01',
        ]);

        $admin = $request->user()->admin;
        if (!$admin) {
            return response()->json(['message' => 'Profil admin tidak ditemukan.'], 404);
        }

        $result = DB::transaction(function () use ($request, $admin) {
            $totalPenjualan = 0;
            $details = [];

            // Hitung total dan siapkan detail
            foreach ($request->detail as $item) {
                // Ambil harga dari database (tidak dari input)
                $jenis = JenisSampah::find($item['jenis_sampah_id']);
                $harga = $jenis->hargaSampah()
                    ->where('status', 'aktif')
                    ->whereDate('berlaku_mulai', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('berlaku_selesai')->orWhereDate('berlaku_selesai', '>=', now());
                    })
                    ->orderByDesc('berlaku_mulai')
                    ->first();

                $hargaSatuan = $harga ? $harga->harga_per_satuan : 0;
                $subtotal = $item['jumlah_terjual'] * $hargaSatuan;
                $totalPenjualan += $subtotal;
                $details[] = [
                    'jenis_sampah_id' => $item['jenis_sampah_id'],
                    'jumlah_terjual' => $item['jumlah_terjual'],
                    'harga_satuan' => $hargaSatuan,
                    'subtotal' => $subtotal,
                ];
            }

            // Buat transaksi penjualan
            $penjualan = TransaksiPenjualan::create([
                'pengepul_id' => $request->pengepul_id,
                'admin_id' => $admin->admin_id,
                'tanggal_transaksi' => $request->tanggal_transaksi,
                'total_penjualan' => $totalPenjualan,
                'status_transaksi' => 'selesai',
                'media_konfirmasi' => $request->media_konfirmasi,
                'metode_transaksi' => $request->metode_transaksi,
                'catatan' => $request->catatan,
            ]);

            // Buat detail penjualan dan kurangi stok
            foreach ($details as $detail) {
                DetailPenjualan::create(array_merge($detail, [
                    'penjualan_id' => $penjualan->penjualan_id,
                ]));

                // Kurangi stok sampah
                $stok = StokSampah::where('jenis_sampah_id', $detail['jenis_sampah_id'])->first();
                if ($stok) {
                    $stok->decrement('jumlah_stok', $detail['jumlah_terjual']);
                    $stok->update(['terakhir_diperbarui' => now()]);
                }
            }

            return $penjualan;
        });

        $result->load(['pengepul', 'admin', 'detailPenjualan.jenisSampah']);

        return response()->json([
            'message' => 'Transaksi penjualan berhasil dibuat.',
            'data' => $result
        ], 201);
    }

    #[OA\Delete(
        path: "/admin/penjualan/{id}",
        summary: "Hapus transaksi penjualan",
        description: "Menghapus transaksi penjualan dan mengembalikan stok sampah.",
        tags: ["Admin - Transaksi Penjualan"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID transaksi penjualan", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Transaksi penjualan berhasil dihapus",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Transaksi penjualan berhasil dihapus."),
                    ],
                ),
            ),
            new OA\Response(response: 404, description: "Transaksi penjualan tidak ditemukan"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function destroy($id)
    {
        $penjualan = TransaksiPenjualan::with('detailPenjualan')->find($id);
        if (!$penjualan) {
            return response()->json(['message' => 'Transaksi penjualan tidak ditemukan.'], 404);
        }

        DB::transaction(function () use ($penjualan) {
            // Kembalikan stok sampah
            foreach ($penjualan->detailPenjualan as $detail) {
                $stok = StokSampah::where('jenis_sampah_id', $detail->jenis_sampah_id)->first();
                if ($stok) {
                    $stok->increment('jumlah_stok', $detail->jumlah_terjual);
                    $stok->update(['terakhir_diperbarui' => now()]);
                }
            }

            $penjualan->delete();
        });

        return response()->json(['message' => 'Transaksi penjualan berhasil dihapus.']);
    }
}
