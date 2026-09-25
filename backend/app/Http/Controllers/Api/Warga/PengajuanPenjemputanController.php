<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\PengajuanPenjemputan;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class PengajuanPenjemputanController extends Controller
{
    #[OA\Get(
        path: "/warga/pengajuan",
        summary: "Daftar riwayat pengajuan penjemputan (Warga)",
        description: "Mengambil seluruh riwayat daftar pengajuan penjemputan sampah milik warga yang sedang login.",
        tags: ["Warga - Pengajuan"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar pengajuan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Daftar pengajuan berhasil diambil."),
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

        $pengajuan = PengajuanPenjemputan::where(
                'warga_id',
                $warga->warga_id
            )
            ->with([
                'detailPengajuanSampah.jenisSampah'
            ])
            ->latest('tanggal_pengajuan')
            ->get();

        return response()->json([
            'message' => 'Daftar pengajuan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }

    #[OA\Post(
        path: "/warga/pengajuan",
        summary: "Buat pengajuan penjemputan baru (Warga)",
        description: "Membuat permohonan pengajuan penjemputan sampah baru ke sistem.",
        tags: ["Warga - Pengajuan"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["alamat_penjemputan", "perkiraan_total_berat", "detail_sampah"],
                properties: [
                    new OA\Property(property: "alamat_penjemputan", type: "string", example: "Jl. Merdeka No. 45 RT 02/RW 03, Kelurahan Damai", description: "Alamat lengkap penjemputan"),
                    new OA\Property(property: "perkiraan_total_berat", type: "number", format: "float", example: 10.5, description: "Total perkiraan berat (harus sesuai dengan jumlah detail perkiraan berat)"),
                    new OA\Property(property: "catatan", type: "string", nullable: true, example: "Sampah diletakkan di depan pagar rumah", description: "Catatan tambahan untuk petugas"),
                    new OA\Property(
                        property: "detail_sampah",
                        type: "array",
                        description: "Daftar estimasi jenis dan berat sampah yang akan disetor",
                        items: new OA\Items(
                            type: "object",
                            required: ["jenis_sampah_id", "perkiraan_berat"],
                            properties: [
                                new OA\Property(property: "jenis_sampah_id", type: "integer", example: 1),
                                new OA\Property(property: "perkiraan_berat", type: "number", format: "float", example: 10.5),
                            ]
                        )
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Pengajuan penjemputan berhasil dibuat",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan penjemputan berhasil dibuat."),
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
                description: "Profil warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Profil warga tidak ditemukan.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Validasi gagal atau total berat tidak sesuai",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Total perkiraan berat tidak sesuai dengan detail sampah.")
                    ]
                )
            )
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'alamat_penjemputan' => 'required|string',
            'perkiraan_total_berat' => 'required|numeric|min:0.01',
            'catatan' => 'nullable|string',

            'detail_sampah' => 'required|array|min:1',

            'detail_sampah.*.jenis_sampah_id'
                => 'required|integer|exists:jenis_sampah,jenis_sampah_id',

            'detail_sampah.*.perkiraan_berat'
                => 'required|numeric|min:0.01',
        ], [
            'alamat_penjemputan.required' => 'Alamat penjemputan wajib diisi.',
            'perkiraan_total_berat.required' => 'Perkiraan total berat wajib diisi.',
            'detail_sampah.required' => 'Minimal pilih 1 jenis sampah.',
            'detail_sampah.min' => 'Minimal pilih 1 jenis sampah.',
            'detail_sampah.*.jenis_sampah_id.exists' => 'Jenis sampah yang dipilih tidak valid atau sudah tidak aktif di sistem.',
            'detail_sampah.*.perkiraan_berat.min' => 'Perkiraan berat sampah minimal 0.01 kg.',
        ]);

        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $totalDetailBerat = collect($request->detail_sampah)
            ->sum('perkiraan_berat');

        if (round((float) $totalDetailBerat, 2) !== round((float) $request->perkiraan_total_berat, 2)) {
            return response()->json([
                'message' => 'Total perkiraan berat tidak sesuai dengan detail sampah.',
                'total_detail_berat' => $totalDetailBerat,
                'perkiraan_total_berat' => $request->perkiraan_total_berat,
            ], 422);
        }

        $pengajuan = DB::transaction(function () use ($request, $warga) {

            $pengajuan = PengajuanPenjemputan::create([
                'warga_id' => $warga->warga_id,
                'tanggal_pengajuan' => now(),
                'alamat_penjemputan' => $request->alamat_penjemputan,
                'perkiraan_total_berat' => $request->perkiraan_total_berat,
                'catatan' => $request->catatan,
                'status_pengajuan' => 'diajukan',
            ]);

            foreach ($request->detail_sampah as $detail) {
                $pengajuan->detailPengajuanSampah()->create([
                    'jenis_sampah_id' => $detail['jenis_sampah_id'],
                    'perkiraan_berat' => $detail['perkiraan_berat'],
                ]);
            }

            return $pengajuan;
        });

        $pengajuan->load('detailPengajuanSampah.jenisSampah');

        // Notify admin
        $adminUsers = User::where('role', 'admin')->where('status', 'aktif')->get();
        foreach ($adminUsers as $adminUser) {
            NotificationService::send(
                $adminUser->id,
                'Pengajuan Baru',
                'Warga ' . ($warga->nama_warga ?? 'Warga') . ' mengajukan penjemputan #' . $pengajuan->pengajuan_id . '.',
                'pengajuan_baru',
                ['pengajuan_id' => $pengajuan->pengajuan_id]
            );
        }

        return response()->json([
            'message' => 'Pengajuan penjemputan berhasil dibuat.',
            'data' => $pengajuan,
        ], 201);
    }

    #[OA\Get(
        path: "/warga/pengajuan/{id}",
        summary: "Detail pengajuan penjemputan (Warga)",
        description: "Mengambil informasi detail pengajuan penjemputan sampah milik warga berdasarkan ID.",
        tags: ["Warga - Pengajuan"],
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
                        new OA\Property(property: "message", type: "string", example: "Detail pengajuan berhasil diambil."),
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
                description: "Pengajuan atau Profil Warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function show(Request $request, $id)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'pengajuan_id',
                $id
            )
            ->where(
                'warga_id',
                $warga->warga_id
            )
            ->with([
                'detailPengajuanSampah.jenisSampah',
                'jadwalPenjemputan',
                'transaksiSetoran',
            ])
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pengajuan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }

    #[OA\Patch(
        path: "/warga/pengajuan/{id}/cancel",
        summary: "Batalkan pengajuan penjemputan (Warga)",
        description: "Membatalkan pengajuan penjemputan sampah yang masih dalam status 'diajukan'. Alasan pembatalan wajib diisi.",
        tags: ["Warga - Pengajuan"],
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
                required: ["alasan_pembatalan"],
                properties: [
                    new OA\Property(property: "alasan_pembatalan", type: "string", example: "Ada keperluan mendadak", description: "Alasan wajib pembatalan pengajuan"),
                    new OA\Property(property: "catatan", type: "string", example: "Ada keperluan mendadak", description: "Alias catatan alasan pembatalan")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Pengajuan berhasil dibatalkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan berhasil dibatalkan."),
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
                description: "Pengajuan atau Profil Warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan tidak ditemukan.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Pengajuan sudah diproses atau alasan pembatalan belum diisi",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Alasan pembatalan wajib diisi."),
                        new OA\Property(property: "status_pengajuan", type: "string", example: "dijadwalkan")
                    ]
                )
            )
        ]
    )]
    public function cancel(Request $request, $id)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'pengajuan_id',
                $id
            )
            ->where(
                'warga_id',
                $warga->warga_id
            )
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan tidak ditemukan.',
            ], 404);
        }

        if ($pengajuan->status_pengajuan !== 'diajukan') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat dibatalkan karena sudah diproses.',
                'status_pengajuan' => $pengajuan->status_pengajuan,
            ], 422);
        }

        $request->validate([
            'alasan_pembatalan' => 'required_without:catatan|nullable|string|min:3|max:500',
            'catatan' => 'required_without:alasan_pembatalan|nullable|string|min:3|max:500',
        ], [
            'alasan_pembatalan.required_without' => 'Alasan pembatalan wajib diisi.',
            'catatan.required_without' => 'Alasan pembatalan wajib diisi.',
            'alasan_pembatalan.min' => 'Alasan pembatalan minimal 3 karakter.',
            'catatan.min' => 'Alasan pembatalan minimal 3 karakter.',
        ]);

        $alasan = trim((string)($request->input('alasan_pembatalan') ?? $request->input('catatan')));

        if (empty($alasan)) {
            return response()->json([
                'message' => 'Alasan pembatalan wajib diisi.',
                'errors' => [
                    'alasan_pembatalan' => ['Alasan pembatalan wajib diisi.']
                ]
            ], 422);
        }

        $catatanExisting = $pengajuan->catatan;
        $updateData = [
            'status_pengajuan' => 'dibatalkan',
            'catatan' => $catatanExisting
                ? ($catatanExisting . " | Pembatalan: " . $alasan)
                : ("Pembatalan: " . $alasan),
        ];

        $pengajuan->update($updateData);

        // Notify admin
        $adminUsers = \App\Models\User::where('role', 'admin')->where('status', 'aktif')->get();
        foreach ($adminUsers as $adminUser) {
            NotificationService::send(
                $adminUser->id,
                'Pengajuan Dibatalkan',
                'Pengajuan #' . $pengajuan->pengajuan_id . ' dibatalkan oleh warga.',
                'pengajuan_dibatalkan',
                ['pengajuan_id' => $pengajuan->pengajuan_id]
            );
        }

        // Notify petugas (if assigned)
        if ($pengajuan->jadwalPenjemputan && $pengajuan->jadwalPenjemputan->petugas && $pengajuan->jadwalPenjemputan->petugas->user) {
            NotificationService::send(
                $pengajuan->jadwalPenjemputan->petugas->user->id,
                'Pengajuan Dibatalkan',
                'Pengajuan #' . $pengajuan->pengajuan_id . ' dibatalkan oleh warga. Tugas jemput dibatalkan.',
                'pengajuan_dibatalkan',
                ['pengajuan_id' => $pengajuan->pengajuan_id]
            );
        }

        return response()->json([
            'message' => 'Pengajuan berhasil dibatalkan.',
            'data' => $pengajuan,
        ]);
    }

    #[OA\Get(
        path: "/warga/pengajuan/{id}/status",
        summary: "Tracking status pengajuan & poin (Warga)",
        description: "Melakukan pelacakan status pengajuan dari proses jadwal penjemputan hingga penambahan poin hasil setoran.",
        tags: ["Warga - Pengajuan"],
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
                description: "Status pengajuan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Status pengajuan berhasil diambil."),
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
                description: "Pengajuan atau Profil Warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengajuan tidak ditemukan.")
                    ]
                )
            )
        ]
    )]
    public function status(Request $request, $id)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'pengajuan_id',
                $id
            )
            ->where(
                'warga_id',
                $warga->warga_id
            )
            ->with([
                'jadwalPenjemputan',
                'transaksiSetoran',
            ])
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan tidak ditemukan.',
            ], 404);
        }

        $setoran = $pengajuan->transaksiSetoran;
        $jadwal = $pengajuan->jadwalPenjemputan;

        return response()->json([
            'message' => 'Status pengajuan berhasil diambil.',
            'data' => [
                'pengajuan_id' => $pengajuan->pengajuan_id,

                'status_pengajuan' => $pengajuan->status_pengajuan,

                'jadwal_penjemputan' => $jadwal ? [
                    'jadwal_id' => $jadwal->jadwal_id,
                    'tanggal_penjemputan' => $jadwal->tanggal_penjemputan,
                    'waktu_penjemputan' => $jadwal->waktu_penjemputan,
                    'status_jadwal' => $jadwal->status_jadwal,
                ] : null,

                'setoran' => $setoran ? [
                    'setoran_id' => $setoran->setoran_id,
                    'tanggal_setoran' => $setoran->tanggal_setoran,
                    'status_validasi' => $setoran->status_validasi,
                    'total_berat_aktual' => $setoran->total_berat_aktual,
                    'total_poin' => $setoran->total_poin,
                ] : null,

                'poin' => $setoran && $setoran->status_validasi === 'disetujui' ? [
                    'jumlah_poin' => (int) $setoran->total_poin,
                    'status_poin' => 'disetujui',
                ] : null,
            ],
        ]);
    }
}