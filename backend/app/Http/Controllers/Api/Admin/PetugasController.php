<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Petugas;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Admin - Petugas", description: "CRUD Data Petugas oleh Admin")]
class PetugasController extends Controller
{
    #[OA\Get(
        path: "/admin/petugas",
        summary: "Daftar semua petugas",
        description: "Mengambil daftar data petugas dengan opsi pencarian, filter status, dan filter area.",
        tags: ["Admin - Petugas"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                required: false,
                description: "Cari berdasarkan nama petugas, nomor telepon, atau alamat/area",
                schema: new OA\Schema(type: "string", example: "Ahmad")
            ),
            new OA\Parameter(
                name: "status",
                in: "query",
                required: false,
                description: "Filter status akun (aktif/nonaktif)",
                schema: new OA\Schema(type: "string", enum: ["aktif", "nonaktif"], example: "aktif")
            ),
            new OA\Parameter(
                name: "area",
                in: "query",
                required: false,
                description: "Filter berdasarkan alamat/area tugas",
                schema: new OA\Schema(type: "string", example: "RT 02")
            ),
            new OA\Parameter(
                name: "page",
                in: "query",
                required: false,
                description: "Nomor halaman",
                schema: new OA\Schema(type: "integer", example: 1)
            ),
            new OA\Parameter(
                name: "per_page",
                in: "query",
                required: false,
                description: "Jumlah data per halaman",
                schema: new OA\Schema(type: "integer", example: 10)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Daftar petugas berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(property: "last_page", type: "integer", example: 3),
                        new OA\Property(property: "per_page", type: "integer", example: 10),
                        new OA\Property(property: "total", type: "integer", example: 28),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        $query = Petugas::with('user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_petugas', 'like', "%{$search}%")
                  ->orWhere('no_telepon', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->status;
            $query->whereHas('user', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        if ($request->filled('area')) {
            $area = $request->area;
            $query->where('alamat', 'like', "%{$area}%");
        }

        $perPage = (int) $request->input('per_page', 10);
        $petugas = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($petugas);
    }

    #[OA\Post(
        path: "/admin/petugas",
        summary: "Tambah petugas baru",
        description: "Menambahkan data petugas baru dan akun user terkait secara otomatis (role: petugas).",
        tags: ["Admin - Petugas"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["username", "email", "password", "nama_petugas", "jenis_kelamin"],
                properties: [
                    new OA\Property(property: "username", type: "string", example: "ahmad_fauzi", description: "Username akun petugas"),
                    new OA\Property(property: "email", type: "string", format: "email", example: "ahmad@trashure.id", description: "Email akun petugas"),
                    new OA\Property(property: "password", type: "string", minLength: 6, example: "password123", description: "Password minimal 6 karakter"),
                    new OA\Property(property: "nama_petugas", type: "string", example: "Ahmad Fauzi", description: "Nama lengkap petugas"),
                    new OA\Property(property: "jenis_kelamin", type: "string", enum: ["Laki-laki", "Perempuan", "L", "P"], example: "Laki-laki"),
                    new OA\Property(property: "alamat", type: "string", nullable: true, example: "RT 02 / RW 03", description: "Alamat atau area tugas petugas"),
                    new OA\Property(property: "no_telepon", type: "string", nullable: true, example: "0812-3456-7890"),
                    new OA\Property(property: "status", type: "string", enum: ["aktif", "nonaktif"], example: "aktif"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Petugas berhasil ditambahkan",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Petugas berhasil ditambahkan."),
                        new OA\Property(property: "data", type: "object"),
                    ]
                )
            ),
            new OA\Response(response: 422, description: "Validasi gagal"),
            new OA\Response(response: 500, description: "Terjadi kesalahan server"),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'string', Password::min(6)],
            'nama_petugas' => 'required|string|max:100',
            'jenis_kelamin' => 'required|string|max:20',
            'alamat' => 'required|string',
            'no_telepon' => 'required|string|size:12',
            'status' => 'nullable|string|in:aktif,nonaktif',
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan, gunakan username lain.',
            'username.max' => 'Username maksimal 50 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan, gunakan email lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'nama_petugas.required' => 'Nama petugas wajib diisi.',
            'nama_petugas.max' => 'Nama petugas maksimal 100 karakter.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'alamat.required' => 'Alamat wajib diisi.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.size' => 'Nomor telepon harus terdiri dari 12 digit.',
            'status.in' => 'Status harus aktif atau nonaktif.',
        ]);

        DB::beginTransaction();

        try {
            // Otomatis membuat akun di tabel users dengan role 'petugas'
            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => $validated['password'], // di-hash otomatis via casting model
                'role' => 'petugas',
                'status' => $validated['status'] ?? 'aktif',
            ]);

            // Membuat record di tabel petugas terkait user_id
            $petugas = Petugas::create([
                'user_id' => $user->id,
                'nama_petugas' => $validated['nama_petugas'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'alamat' => $validated['alamat'] ?? null,
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Petugas berhasil ditambahkan.',
                'data' => $petugas->load('user'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menambahkan petugas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Get(
        path: "/admin/petugas/{id}",
        summary: "Detail petugas",
        description: "Mengambil data detail petugas beserta data user berdasarkan ID.",
        tags: ["Admin - Petugas"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Petugas (petugas_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Detail petugas berhasil diambil"),
            new OA\Response(response: 404, description: "Petugas tidak ditemukan"),
        ]
    )]
    public function show($id)
    {
        $petugas = Petugas::with('user')->findOrFail($id);

        return response()->json([
            'data' => $petugas,
        ]);
    }

    #[OA\Put(
        path: "/admin/petugas/{id}",
        summary: "Perbarui data petugas",
        description: "Memperbarui data petugas dan status akun pengguna terkait.",
        tags: ["Admin - Petugas"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Petugas (petugas_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_petugas", "jenis_kelamin"],
                properties: [
                    new OA\Property(property: "nama_petugas", type: "string", example: "Ahmad Fauzi"),
                    new OA\Property(property: "jenis_kelamin", type: "string", example: "Laki-laki"),
                    new OA\Property(property: "alamat", type: "string", nullable: true, example: "RT 02 / RW 03"),
                    new OA\Property(property: "no_telepon", type: "string", nullable: true, example: "0812-3456-7890"),
                    new OA\Property(property: "status", type: "string", nullable: true, enum: ["aktif", "nonaktif"], example: "aktif"),
                    new OA\Property(property: "password", type: "string", nullable: true, minLength: 6, example: "newpassword123"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Petugas berhasil diperbarui"),
            new OA\Response(response: 404, description: "Petugas tidak ditemukan"),
            new OA\Response(response: 422, description: "Validasi gagal"),
        ]
    )]
    public function update(Request $request, $id)
    {
        $petugas = Petugas::with('user')->findOrFail($id);

        $userId = $petugas->user_id;

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $userId,
            'email' => 'required|email|max:255|unique:users,email,' . $userId,
            'nama_petugas' => 'required|string|max:100',
            'jenis_kelamin' => 'required|string|max:20',
            'alamat' => 'required|string',
            'no_telepon' => 'required|string|size:12',
            'status' => 'nullable|string|in:aktif,nonaktif',
            'password' => ['nullable', 'string', Password::min(6)],
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan, gunakan username lain.',
            'username.max' => 'Username maksimal 50 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan, gunakan email lain.',
            'nama_petugas.required' => 'Nama petugas wajib diisi.',
            'nama_petugas.max' => 'Nama petugas maksimal 100 karakter.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'alamat.required' => 'Alamat wajib diisi.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.size' => 'Nomor telepon harus terdiri dari 12 digit.',
            'status.in' => 'Status harus aktif atau nonaktif.',
            'password.min' => 'Password minimal 6 karakter.',
        ]);

        DB::beginTransaction();

        try {
            $petugas->update([
                'nama_petugas' => $validated['nama_petugas'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'alamat' => $validated['alamat'] ?? null,
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            if ($petugas->user) {
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
                $petugas->user->update($userUpdates);
            }

            DB::commit();

            return response()->json([
                'message' => 'Petugas berhasil diperbarui.',
                'data' => $petugas->load('user'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui petugas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    #[OA\Delete(
        path: "/admin/petugas/{id}",
        summary: "Hapus petugas",
        description: "Menghapus data petugas beserta akun user terkait secara aman.",
        tags: ["Admin - Petugas"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID Petugas (petugas_id)",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Petugas berhasil dihapus"),
            new OA\Response(response: 404, description: "Petugas tidak ditemukan"),
        ]
    )]
    public function destroy($id)
    {
        $petugas = Petugas::with('user')->findOrFail($id);

        DB::beginTransaction();

        try {
            $setoranIds = \App\Models\TransaksiSetoran::where('petugas_id', $petugas->petugas_id)
                ->pluck('setoran_id');

            if ($setoranIds->isNotEmpty()) {
                \App\Models\DetailSetoran::whereIn('setoran_id', $setoranIds)->delete();
                \App\Models\TransaksiSetoran::whereIn('setoran_id', $setoranIds)->delete();
            }

            \App\Models\JadwalPenjemputan::where('petugas_id', $petugas->petugas_id)->delete();

            if ($petugas->user) {
                $petugas->user->delete();
            } else {
                $petugas->delete();
            }

            DB::commit();

            return response()->json([
                'message' => 'Petugas berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus petugas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
