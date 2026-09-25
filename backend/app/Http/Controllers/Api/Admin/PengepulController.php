<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengepul;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admin - Pengepul",
    description: "CRUD Data Pengepul oleh Admin. Saat pengepul ditambahkan, akun pengguna (users) dengan role 'pengepul' juga otomatis dibuat."
)]
#[OA\Schema(
    schema: "Pengepul",
    title: "Pengepul",
    description: "Data pengepul beserta akun pengguna terkait.",
    required: ["pengepul_id", "user_id", "nama_pengepul"],
    properties: [
        new OA\Property(
            property: "pengepul_id",
            type: "integer",
            format: "int64",
            description: "ID unik pengepul.",
            example: 1,
        ),
        new OA\Property(
            property: "user_id",
            type: "integer",
            format: "int64",
            description: "ID akun pengguna (users) terkait.",
            example: 1,
        ),
        new OA\Property(
            property: "nama_pengepul",
            type: "string",
            maxLength: 100,
            description: "Nama pengepul.",
            example: "Pengepul Trashure",
        ),
        new OA\Property(
            property: "alamat",
            type: "string",
            nullable: true,
            description: "Alamat pengepul.",
            example: "Jl. Pengumpul No. 5, Jakarta",
        ),
        new OA\Property(
            property: "no_telepon",
            type: "string",
            maxLength: 20,
            nullable: true,
            description: "Nomor telepon pengepul.",
            example: "081234567892",
        ),
        new OA\Property(
            property: "user",
            ref: "#/components/schemas/PengepulUser",
            description: "Akun pengguna terkait.",
        ),
    ],
)]
#[OA\Schema(
    schema: "PengepulUser",
    title: "Akun Pengguna (Pengepul)",
    description: "Akun pengguna yang terhubung dengan data pengepul.",
    required: ["id", "username", "email", "role", "status"],
    properties: [
        new OA\Property(property: "id", type: "integer", format: "int64", example: 1, description: "ID akun pengguna."),
        new OA\Property(property: "username", type: "string", example: "pengepul", description: "Username unik."),
        new OA\Property(property: "email", type: "string", format: "email", example: "pengepul@trashure.test", description: "Email unik."),
        new OA\Property(property: "role", type: "string", enum: ["pengepul"], example: "pengepul", description: "Peran akun."),
        new OA\Property(property: "status", type: "string", enum: ["aktif", "nonaktif"], example: "aktif", description: "Status akun."),
    ],
)]
class PengepulController extends Controller
{
    #[OA\Get(
        path: "/admin/pengepul",
        summary: "Daftar semua pengepul",
        description: "Mengambil daftar data pengepul beserta akun pengguna, dengan opsi pencarian, filter status, dan pagination.",
        tags: ["Admin - Pengepul"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Cari berdasarkan nama pengepul atau no. telepon.",
                schema: new OA\Schema(type: "string", example: "Pengepul")
            ),
            new OA\Parameter(
                name: "status",
                in: "query",
                required: false,
                description: "Filter status akun pengguna (aktif/nonaktif).",
                schema: new OA\Schema(type: "string", enum: ["aktif", "nonaktif"], example: "aktif")
            ),
            new OA\Parameter(
                name: "page",
                in: "query",
                required: false,
                description: "Nomor halaman.",
                schema: new OA\Schema(type: "integer", example: 1)
            ),
            new OA\Parameter(
                name: "per_page",
                in: "query",
                required: false,
                description: "Jumlah data per halaman.",
                schema: new OA\Schema(type: "integer", example: 10)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar pengepul berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            description: "Daftar pengepul.",
                            items: new OA\Items(ref: "#/components/schemas/Pengepul"),
                        ),
                        new OA\Property(
                            property: "meta",
                            ref: "#/components/schemas/PaginationMeta",
                            description: "Metadata pagination.",
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        $query = Pengepul::with('user');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_pengepul', 'like', "%{$search}%")
                  ->orWhere('no_telepon', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $perPage = $request->integer('per_page', 10);

        $pengepul = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'message' => 'Daftar pengepul berhasil diambil.',
            'data' => $pengepul->items(),
            'meta' => [
                'current_page' => $pengepul->currentPage(),
                'last_page' => $pengepul->lastPage(),
                'per_page' => $pengepul->perPage(),
                'total' => $pengepul->total(),
                'from' => $pengepul->firstItem(),
                'to' => $pengepul->lastItem(),
            ],
        ]);
    }

    #[OA\Post(
        path: "/admin/pengepul",
        summary: "Tambah pengepul baru",
        description: "Menambahkan data pengepul baru sekaligus membuat akun pengguna (users) dengan role 'pengepul' secara otomatis.",
        tags: ["Admin - Pengepul"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["username", "email", "password", "nama_pengepul"],
                properties: [
                    new OA\Property(property: "username", type: "string", example: "pengepul2", description: "Username unik untuk akun pengepul"),
                    new OA\Property(property: "email", type: "string", format: "email", example: "pengepul2@trashure.test", description: "Email unik untuk akun pengepul"),
                    new OA\Property(property: "password", type: "string", minLength: 6, example: "password", description: "Password minimal 6 karakter"),
                    new OA\Property(property: "nama_pengepul", type: "string", example: "Pengepul Trashure", description: "Nama lengkap pengepul"),
                    new OA\Property(property: "alamat", type: "string", nullable: true, example: "Jl. Pengumpul No. 5, Jakarta"),
                    new OA\Property(property: "no_telepon", type: "string", nullable: true, example: "081234567892"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Pengepul berhasil ditambahkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengepul berhasil ditambahkan."),
                        new OA\Property(property: "data", ref: "#/components/schemas/Pengepul"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(
                response: 422,
                description: "Validasi gagal",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "The given data was invalid."),
                        new OA\Property(property: "errors", type: "object"),
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Gagal menambahkan pengepul",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Gagal menambahkan pengepul."),
                    ]
                )
            ),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', Password::min(6)],
            'nama_pengepul' => 'required|string|max:100',
            'alamat' => 'required|string',
            'no_telepon' => 'required|string|size:12',
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan, gunakan username lain.',
            'username.max' => 'Username maksimal 50 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan, gunakan email lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'nama_pengepul.required' => 'Nama pengepul wajib diisi.',
            'nama_pengepul.max' => 'Nama pengepul maksimal 100 karakter.',
            'alamat.required' => 'Alamat wajib diisi.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.size' => 'Nomor telepon harus terdiri dari 12 digit.',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => 'pengepul',
                'status' => 'aktif',
            ]);

            $pengepul = Pengepul::create([
                'user_id' => $user->id,
                'nama_pengepul' => $validated['nama_pengepul'],
                'alamat' => $validated['alamat'] ?? null,
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pengepul berhasil ditambahkan.',
                'data' => $pengepul->load('user'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menambahkan pengepul.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Get(
        path: "/admin/pengepul/{id}",
        summary: "Detail pengepul",
        description: "Mengambil data detail pengepul beserta akun pengguna berdasarkan ID.",
        tags: ["Admin - Pengepul"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Pengepul (pengepul_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail pengepul berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", ref: "#/components/schemas/Pengepul"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Pengepul tidak ditemukan"),
        ]
    )]
    public function show($id)
    {
        $pengepul = Pengepul::with('user')->findOrFail($id);

        return response()->json([
            'message' => 'Detail pengepul berhasil diambil.',
            'data' => $pengepul,
        ]);
    }

    #[OA\Put(
        path: "/admin/pengepul/{id}",
        summary: "Perbarui data pengepul",
        description: "Memperbarui data pengepul berdasarkan ID. Status akun dan password dapat diubah bila diisi.",
        tags: ["Admin - Pengepul"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Pengepul (pengepul_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_pengepul"],
                properties: [
                    new OA\Property(property: "nama_pengepul", type: "string", example: "Pengepul Trashure"),
                    new OA\Property(property: "alamat", type: "string", nullable: true, example: "Jl. Pengumpul No. 5, Jakarta"),
                    new OA\Property(property: "no_telepon", type: "string", nullable: true, example: "081234567892"),
                    new OA\Property(property: "password", type: "string", nullable: true, minLength: 6, description: "Password baru (opsional)"),
                    new OA\Property(property: "status", type: "string", nullable: true, enum: ["aktif", "nonaktif"], example: "aktif", description: "Status akun pengguna"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Pengepul berhasil diperbarui",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengepul berhasil diperbarui."),
                        new OA\Property(property: "data", ref: "#/components/schemas/Pengepul"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Pengepul tidak ditemukan"),
            new OA\Response(response: 422, description: "Validasi gagal"),
        ]
    )]
    public function update(Request $request, $id)
    {
        $pengepul = Pengepul::with('user')->findOrFail($id);

        $userId = $pengepul->user_id;

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $userId,
            'email' => 'required|email|unique:users,email,' . $userId,
            'nama_pengepul' => 'required|string|max:100',
            'alamat' => 'required|string',
            'no_telepon' => 'required|string|size:12',
            'password' => ['nullable', 'string', Password::min(6)],
            'status' => 'nullable|string|in:aktif,nonaktif',
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan, gunakan username lain.',
            'username.max' => 'Username maksimal 50 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan, gunakan email lain.',
            'nama_pengepul.required' => 'Nama pengepul wajib diisi.',
            'nama_pengepul.max' => 'Nama pengepul maksimal 100 karakter.',
            'alamat.required' => 'Alamat wajib diisi.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.size' => 'Nomor telepon harus terdiri dari 12 digit.',
            'password.min' => 'Password minimal 6 karakter.',
            'status.in' => 'Status harus aktif atau nonaktif.',
        ]);

        DB::beginTransaction();

        try {
            $pengepul->update([
                'nama_pengepul' => $validated['nama_pengepul'],
                'alamat' => $validated['alamat'] ?? null,
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            $userUpdates = [
                'username' => $validated['username'],
                'email' => $validated['email'],
            ];
            if (isset($validated['status'])) {
                $userUpdates['status'] = $validated['status'];
            }
            if (!empty($validated['password'])) {
                $userUpdates['password'] = $validated['password'];
            }
            $pengepul->user->update($userUpdates);

            DB::commit();

            return response()->json([
                'message' => 'Pengepul berhasil diperbarui.',
                'data' => $pengepul->load('user'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui pengepul.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Delete(
        path: "/admin/pengepul/{id}",
        summary: "Hapus pengepul",
        description: "Menghapus data pengepul dan akun pengguna (users) secara permanen (cascade).",
        tags: ["Admin - Pengepul"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Pengepul (pengepul_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Pengepul berhasil dihapus",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Pengepul berhasil dihapus."),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Pengepul tidak ditemukan"),
        ]
    )]
    public function destroy($id)
    {
        $pengepul = Pengepul::findOrFail($id);

        DB::beginTransaction();

        try {
            $penjualanIds = \App\Models\TransaksiPenjualan::where('pengepul_id', $pengepul->pengepul_id)
                ->pluck('penjualan_id');

            if ($penjualanIds->isNotEmpty()) {
                \App\Models\DetailPenjualan::whereIn('penjualan_id', $penjualanIds)->delete();
                \App\Models\TransaksiPenjualan::whereIn('penjualan_id', $penjualanIds)->delete();
            }

            $pengepul->user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Pengepul berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus pengepul.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}