<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Admin - Warga", description: "CRUD Data Warga oleh Admin")]
class WargaController extends Controller
{
    #[OA\Get(
        path: "/admin/warga",
        summary: "Daftar semua warga",
        description: "Mengambil daftar data warga dengan opsi pencarian dan filter status.",
        tags: ["Admin - Warga"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Cari berdasarkan nama, NIK, atau no. telepon",
                schema: new OA\Schema(type: "string", example: "Siti")
            ),
            new OA\Parameter(
                name: "status",
                in: "query",
                required: false,
                description: "Filter status pengguna (aktif/nonaktif)",
                schema: new OA\Schema(type: "string", enum: ["aktif", "nonaktif"], example: "aktif")
            ),
            new OA\Parameter(
                name: "page",
                in: "query",
                required: false,
                description: "Nomor halaman",
                schema: new OA\Schema(type: "integer", example: 1)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar warga berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(property: "last_page", type: "integer", example: 5),
                        new OA\Property(property: "per_page", type: "integer", example: 10),
                        new OA\Property(property: "total", type: "integer", example: 50),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        $query = Warga::with('user');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_warga', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('no_telepon', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $warga = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($warga);
    }

    #[OA\Post(
        path: "/admin/warga",
        summary: "Tambah warga baru",
        description: "Menambahkan data warga baru beserta akun pengguna (user).",
        tags: ["Admin - Warga"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["username", "email", "password", "nik", "nama_warga", "jenis_kelamin", "alamat"],
                properties: [
                    new OA\Property(property: "username", type: "string", example: "siti_nurhayati", description: "Username unik untuk akun warga"),
                    new OA\Property(property: "email", type: "string", format: "email", example: "siti@email.com", description: "Email unik untuk akun warga"),
                    new OA\Property(property: "password", type: "string", minLength: 6, example: "password123", description: "Password minimal 6 karakter"),
                    new OA\Property(property: "nik", type: "string", minLength: 16, maxLength: 16, example: "3201234567890001", description: "NIK 16 digit"),
                    new OA\Property(property: "nama_warga", type: "string", example: "Siti Nurhayati", description: "Nama lengkap warga"),
                    new OA\Property(property: "jenis_kelamin", type: "string", enum: ["Laki-laki", "Perempuan"], example: "Perempuan"),
                    new OA\Property(property: "alamat", type: "string", example: "Jl. Merdeka No. 10, Jakarta"),
                    new OA\Property(property: "no_telepon", type: "string", nullable: true, example: "081234567890"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Warga berhasil ditambahkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Warga berhasil ditambahkan."),
                        new OA\Property(property: "data", type: "object"),
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
                description: "Gagal menambahkan warga",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Gagal menambahkan warga."),
                    ]
                )
            ),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', Password::min(6)],
            'nik' => 'required|string|size:16|unique:warga,nik',
            'nama_warga' => 'required|string|max:100',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'alamat' => 'required|string',
            'no_telepon' => 'required|string|size:12',
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan, gunakan username lain.',
            'username.max' => 'Username maksimal 255 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan, gunakan email lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'nik.required' => 'NIK wajib diisi.',
            'nik.size' => 'NIK harus terdiri dari 16 digit.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'nama_warga.required' => 'Nama warga wajib diisi.',
            'nama_warga.max' => 'Nama warga maksimal 100 karakter.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'jenis_kelamin.in' => 'Jenis kelamin harus Laki-laki atau Perempuan.',
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
                'role' => 'warga',
                'status' => 'aktif',
            ]);

            $warga = Warga::create([
                'user_id' => $user->id,
                'nik' => $validated['nik'],
                'nama_warga' => $validated['nama_warga'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'alamat' => $validated['alamat'],
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Warga berhasil ditambahkan.',
                'data' => $warga->load('user'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menambahkan warga.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Get(
        path: "/admin/warga/{id}",
        summary: "Detail warga",
        description: "Mengambil data detail warga berdasarkan ID.",
        tags: ["Admin - Warga"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Warga (warga_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detail warga berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "object"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(
                response: 404,
                description: "Warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "No query results for model [App\\Models\\Warga]."),
                    ]
                )
            ),
        ]
    )]
    public function show($id)
    {
        $warga = Warga::with('user')->findOrFail($id);

        return response()->json([
            'data' => $warga,
        ]);
    }

    #[OA\Put(
        path: "/admin/warga/{id}",
        summary: "Perbarui data warga",
        description: "Memperbarui data warga berdasarkan ID. Status akun juga dapat diubah.",
        tags: ["Admin - Warga"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Warga (warga_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nik", "nama_warga", "jenis_kelamin", "alamat"],
                properties: [
                    new OA\Property(property: "nik", type: "string", minLength: 16, maxLength: 16, example: "3201234567890001"),
                    new OA\Property(property: "nama_warga", type: "string", example: "Siti Nurhayati"),
                    new OA\Property(property: "jenis_kelamin", type: "string", enum: ["Laki-laki", "Perempuan"], example: "Perempuan"),
                    new OA\Property(property: "alamat", type: "string", example: "Jl. Merdeka No. 10, Jakarta"),
                    new OA\Property(property: "no_telepon", type: "string", nullable: true, example: "081234567890"),
                    new OA\Property(property: "status", type: "string", nullable: true, enum: ["aktif", "nonaktif"], example: "aktif", description: "Status akun pengguna"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Warga berhasil diperbarui",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Warga berhasil diperbarui."),
                        new OA\Property(property: "data", type: "object"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(
                response: 404,
                description: "Warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "No query results for model [App\\Models\\Warga]."),
                    ]
                )
            ),
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
        ]
    )]
    public function update(Request $request, $id)
    {
        $warga = Warga::with('user')->findOrFail($id);

        $userId = $warga->user_id;

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $userId,
            'email' => 'required|email|unique:users,email,' . $userId,
            'password' => ['nullable', 'string', Password::min(6)],
            'nik' => 'required|string|size:16|unique:warga,nik,' . $id . ',warga_id',
            'nama_warga' => 'required|string|max:100',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'alamat' => 'required|string',
            'no_telepon' => 'required|string|size:12',
            'status' => 'nullable|string|in:aktif,nonaktif',
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan, gunakan username lain.',
            'username.max' => 'Username maksimal 255 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan, gunakan email lain.',
            'password.min' => 'Password minimal 6 karakter.',
            'nik.required' => 'NIK wajib diisi.',
            'nik.size' => 'NIK harus terdiri dari 16 digit.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'nama_warga.required' => 'Nama warga wajib diisi.',
            'nama_warga.max' => 'Nama warga maksimal 100 karakter.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'jenis_kelamin.in' => 'Jenis kelamin harus Laki-laki atau Perempuan.',
            'alamat.required' => 'Alamat wajib diisi.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.size' => 'Nomor telepon harus terdiri dari 12 digit.',
            'status.in' => 'Status harus aktif atau nonaktif.',
        ]);

        DB::beginTransaction();

        try {
            $warga->update([
                'nik' => $validated['nik'],
                'nama_warga' => $validated['nama_warga'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'alamat' => $validated['alamat'],
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            $userUpdates = [
                'username' => $validated['username'],
                'email' => $validated['email'],
            ];
            if (!empty($validated['password'])) {
                $userUpdates['password'] = $validated['password'];
            }
            if (isset($validated['status'])) {
                $userUpdates['status'] = $validated['status'];
            }
            $warga->user->update($userUpdates);

            DB::commit();

            return response()->json([
                'message' => 'Warga berhasil diperbarui.',
                'data' => $warga->load('user'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui warga.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Delete(
        path: "/admin/warga/{id}",
        summary: "Hapus warga",
        description: "Menghapus data warga dan akun pengguna secara permanen.",
        tags: ["Admin - Warga"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Warga (warga_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Warga berhasil dihapus",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Warga berhasil dihapus."),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(
                response: 404,
                description: "Warga tidak ditemukan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "No query results for model [App\\Models\\Warga]."),
                    ]
                )
            ),
        ]
    )]
    public function destroy($id)
    {
        $warga = Warga::findOrFail($id);

        DB::beginTransaction();

        try {
            $setoranIds = \App\Models\TransaksiSetoran::where('warga_id', $warga->warga_id)
                ->pluck('setoran_id');

            if ($setoranIds->isNotEmpty()) {
                \App\Models\DetailSetoran::whereIn('setoran_id', $setoranIds)->delete();
                \App\Models\TransaksiSetoran::whereIn('setoran_id', $setoranIds)->delete();
            }

            \App\Models\PenukaranPoin::where('warga_id', $warga->warga_id)->delete();

            $pengajuanIds = \App\Models\PengajuanPenjemputan::where('warga_id', $warga->warga_id)
                ->pluck('pengajuan_id');

            if ($pengajuanIds->isNotEmpty()) {
                \App\Models\DetailPengajuanSampah::whereIn('pengajuan_id', $pengajuanIds)->delete();
                \App\Models\JadwalPenjemputan::whereIn('pengajuan_id', $pengajuanIds)->delete();
                \App\Models\PengajuanPenjemputan::whereIn('pengajuan_id', $pengajuanIds)->delete();
            }

            $warga->user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Warga berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus warga.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
