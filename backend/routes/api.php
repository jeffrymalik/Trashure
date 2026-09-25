<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Warga\JenisSampahController as WargaJenisSampahController;
use App\Http\Controllers\Api\Warga\PengajuanPenjemputanController;
use App\Http\Controllers\Api\Warga\SetoranController as WargaSetoranController;
use App\Http\Controllers\Api\Warga\DashboardController as WargaDashboardController;
use App\Http\Controllers\Api\Warga\PoinController as WargaPoinController;
use App\Http\Controllers\Api\Warga\PenukaranPoinController as WargaPenukaranPoinController;
use App\Http\Controllers\Api\Petugas\JadwalPenjemputanController;
use App\Http\Controllers\Api\Petugas\SetoranController;
use App\Http\Controllers\Api\Petugas\DashboardController as PetugasDashboardController;
use App\Http\Controllers\Api\Admin\PengajuanPenjemputanController as AdminPengajuanPenjemputanController;
use App\Http\Controllers\Api\Admin\JadwalPenjemputanController as AdminJadwalPenjemputanController;
use App\Http\Controllers\Api\Admin\WargaController as AdminWargaController;
use App\Http\Controllers\Api\Admin\JenisSampahController as AdminJenisSampahController;
use App\Http\Controllers\Api\Admin\HargaSampahController as AdminHargaSampahController;
use App\Http\Controllers\Api\Admin\VoucherController as AdminVoucherController;
use App\Http\Controllers\Api\Admin\PengepulController as AdminPengepulController;
use App\Http\Controllers\Api\Admin\PetugasController as AdminPetugasController;
use App\Http\Controllers\Api\Admin\SetoranValidasiController;
use App\Http\Controllers\Api\Admin\PenukaranPoinController as AdminPenukaranPoinController;
use App\Http\Controllers\Api\Admin\TransaksiPenjualanController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\LaporanController as AdminLaporanController;
use App\Http\Controllers\Api\Admin\LaporanDataController as AdminLaporanDataController;
use App\Http\Controllers\Api\Pengepul\StokSampahController as PengepulStokSampahController;

// Default code

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

// PDF download via token query param (for browser window.open)
Route::get('/download/laporan/{type}', function ($type) {
    $token = request()->query('token') ?? request()->bearerToken();
    if (!$token) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }
    $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }
    \Illuminate\Support\Facades\Auth::setUser($user);

    $validTypes = ['setoran','penjemputan','penjualan','stok','poin'];
    if (!in_array($type, $validTypes)) {
        return response()->json(['message' => 'Not found'], 404);
    }

    $controller = new \App\Http\Controllers\Api\Admin\LaporanController();
    return $controller->$type(request());
});

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);

    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Notifications (all roles)
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);


    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {

        Route::get('/admin/test', function (Request $request) {
            return response()->json([
                'message' => 'Akses admin berhasil.',
                'user' => $request->user(),
            ]);
        });

        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
        Route::get(
            '/admin/pengajuan',
            [AdminPengajuanPenjemputanController::class, 'index']
        );

        Route::get(
            '/admin/pengajuan/{id}',
            [AdminPengajuanPenjemputanController::class, 'show']
        );

        Route::post(
            '/admin/pengajuan/{id}/jadwal',
            [AdminPengajuanPenjemputanController::class, 'jadwalkan']
        );

        Route::get(
            '/admin/jadwal',
            [AdminJadwalPenjemputanController::class, 'index']
        );

        // Warga CRUD
        Route::get('/admin/warga', [AdminWargaController::class, 'index']);
        Route::post('/admin/warga', [AdminWargaController::class, 'store']);
        Route::get('/admin/warga/{id}', [AdminWargaController::class, 'show']);
        Route::put('/admin/warga/{id}', [AdminWargaController::class, 'update']);
        Route::delete('/admin/warga/{id}', [AdminWargaController::class, 'destroy']);

        // Petugas CRUD
        Route::get('/admin/petugas', [AdminPetugasController::class, 'index']);
        Route::post('/admin/petugas', [AdminPetugasController::class, 'store']);
        Route::get('/admin/petugas/{id}', [AdminPetugasController::class, 'show']);
        Route::put('/admin/petugas/{id}', [AdminPetugasController::class, 'update']);
        Route::delete('/admin/petugas/{id}', [AdminPetugasController::class, 'destroy']);

        // Pengepul CRUD
        Route::get('/admin/pengepul', [AdminPengepulController::class, 'index']);
        Route::post('/admin/pengepul', [AdminPengepulController::class, 'store']);
        Route::get('/admin/pengepul/{id}', [AdminPengepulController::class, 'show']);
        Route::put('/admin/pengepul/{id}', [AdminPengepulController::class, 'update']);
        Route::delete('/admin/pengepul/{id}', [AdminPengepulController::class, 'destroy']);

        Route::get('/admin/jenis-sampah', [AdminJenisSampahController::class, 'index']);
        Route::post('/admin/jenis-sampah', [AdminJenisSampahController::class, 'store']);
        Route::get('/admin/jenis-sampah/{id}', [AdminJenisSampahController::class, 'show']);
        Route::put('/admin/jenis-sampah/{id}', [AdminJenisSampahController::class, 'update']);
        Route::patch('/admin/jenis-sampah/{id}', [AdminJenisSampahController::class, 'update']);
        Route::delete('/admin/jenis-sampah/{id}', [AdminJenisSampahController::class, 'destroy']);

        Route::get(
            '/admin/harga-sampah',
            [AdminHargaSampahController::class, 'index']
        );
        Route::post(
            '/admin/harga-sampah',
            [AdminHargaSampahController::class, 'store']
        );
        Route::get(
            '/admin/harga-sampah/{id}',
            [AdminHargaSampahController::class, 'show']
        );
        Route::put(
            '/admin/harga-sampah/{id}',
            [AdminHargaSampahController::class, 'update']
        );
        Route::delete(
            '/admin/harga-sampah/{id}',
            [AdminHargaSampahController::class, 'destroy']
        );
        Route::get(
            '/admin/jenis-sampah',
            [AdminHargaSampahController::class, 'jenisSampahList']
        );

        Route::get('/admin/voucher', [AdminVoucherController::class, 'index']);
        Route::post('/admin/voucher', [AdminVoucherController::class, 'store']);
        Route::get('/admin/voucher/{id}', [AdminVoucherController::class, 'show']);
        Route::put('/admin/voucher/{id}', [AdminVoucherController::class, 'update']);
        Route::delete('/admin/voucher/{id}', [AdminVoucherController::class, 'destroy']);

        // Pengepul CRUD (akun users dibuat otomatis saat create)
        Route::get('/admin/pengepul', [AdminPengepulController::class, 'index']);
        Route::post('/admin/pengepul', [AdminPengepulController::class, 'store']);
        Route::get('/admin/pengepul/{id}', [AdminPengepulController::class, 'show']);
        Route::put('/admin/pengepul/{id}', [AdminPengepulController::class, 'update']);
        Route::delete('/admin/pengepul/{id}', [AdminPengepulController::class, 'destroy']);

        Route::get('/admin/setoran', [SetoranValidasiController::class, 'index']);
        Route::get('/admin/setoran/{id}', [SetoranValidasiController::class, 'show']);
        Route::patch('/admin/setoran/{id}/validasi', [SetoranValidasiController::class, 'validasi']);

        // Penukaran Poin
        Route::get('/admin/penukaran-poin', [AdminPenukaranPoinController::class, 'index']);

        // Transaksi Penjualan
        Route::get('/admin/penjualan/jenis-sampah', [TransaksiPenjualanController::class, 'jenisSampah']);
        Route::get('/admin/penjualan', [TransaksiPenjualanController::class, 'index']);
        Route::post('/admin/penjualan', [TransaksiPenjualanController::class, 'store']);
        Route::get('/admin/penjualan/{id}', [TransaksiPenjualanController::class, 'show']);
        Route::delete('/admin/penjualan/{id}', [TransaksiPenjualanController::class, 'destroy']);

        // Laporan PDF (support token via query param for download)
        Route::get('/admin/laporan/{type}', function ($type) {
            $controller = new \App\Http\Controllers\Api\Admin\LaporanController();
            $request = request();
            $method = $type;
            if (!in_array($method, ['setoran','penjemputan','keuangan','stok','poin'])) {
                return response()->json(['message' => 'Not found'], 404);
            }
            return $controller->$method($request);
        });

        // Laporan Data (JSON)
        Route::get('/admin/laporan-data/setoran', [AdminLaporanDataController::class, 'setoran']);
        Route::get('/admin/laporan-data/penjemputan', [AdminLaporanDataController::class, 'penjemputan']);
        Route::get('/admin/laporan-data/penjualan', [AdminLaporanDataController::class, 'penjualan']);
        Route::get('/admin/laporan-data/stok', [AdminLaporanDataController::class, 'stok']);
        Route::get('/admin/laporan-data/poin', [AdminLaporanDataController::class, 'poin']);
    });


    /*
    |--------------------------------------------------------------------------
    | Petugas
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:petugas')->group(function () {

        Route::get('/petugas/test', function (Request $request) {
            return response()->json([
                'message' => 'Akses petugas berhasil.',
                'user' => $request->user(),
            ]);
        });

        Route::get('/petugas/jenis-sampah', [WargaJenisSampahController::class, 'index']);

        Route::get(
            '/petugas/dashboard',
            [PetugasDashboardController::class, 'index']
        );

        Route::get(
            '/petugas/jadwal',
            [JadwalPenjemputanController::class, 'index']
        );

        Route::get(
            '/petugas/jadwal/{id}',
            [JadwalPenjemputanController::class, 'show']
        );

        Route::patch(
            '/petugas/jadwal/{id}/proses',
            [JadwalPenjemputanController::class, 'proses']
        );
        
        Route::post(
            '/petugas/jadwal/{jadwalId}/setoran/jenis',
            [SetoranController::class, 'catatJenisAktual']
        );

        Route::post(
            '/petugas/jadwal/{jadwalId}/setoran/berat',
            [SetoranController::class, 'catatBeratAktual']
        );

        Route::post(
            '/petugas/jadwal/{jadwalId}/setoran',
            [SetoranController::class, 'store']
        );

        Route::get(
            '/petugas/setoran',
            [SetoranController::class, 'index']
        );
    });


    /*
    |--------------------------------------------------------------------------
    | Warga
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:warga')->group(function () {

        Route::get('/warga/test', function (Request $request) {
            return response()->json([
                'message' => 'Akses warga berhasil.',
                'user' => $request->user(),
            ]);
        });

        Route::get(
            '/warga/dashboard',
            [WargaDashboardController::class, 'index']
        );

        Route::get(
            '/warga/jenis-sampah',
            [WargaJenisSampahController::class, 'index']
        );
        Route::get(
            '/warga/jenis-sampah/{id}',
             [WargaJenisSampahController::class, 'show']
        );
        Route::get(
            '/warga/pengajuan',
            [PengajuanPenjemputanController::class, 'index']
        );
        Route::post(
            '/warga/pengajuan',
            [PengajuanPenjemputanController::class, 'store']
        );

        Route::get(
            '/warga/pengajuan/{id}',
            [PengajuanPenjemputanController::class, 'show']
        );
        Route::patch(
            '/warga/pengajuan/{id}/cancel',
            [PengajuanPenjemputanController::class, 'cancel']
        );
        Route::get(
            '/warga/pengajuan/{id}/status',
            [PengajuanPenjemputanController::class, 'status']
        );
        Route::get(
            '/warga/setoran',
            [WargaSetoranController::class, 'index']
        );
        Route::get(
            '/warga/setoran/{id}',
            [WargaSetoranController::class, 'show']
        );
        Route::get(
            '/warga/poin',
            [WargaPoinController::class, 'index']
        );
        Route::get(
            '/warga/penukaran-poin/hadiah',
            [WargaPenukaranPoinController::class, 'daftarHadiah']
        );
        Route::get(
            '/warga/penukaran-poin/saldo',
            [WargaPenukaranPoinController::class, 'getSaldo']
        );
        Route::post(
            '/warga/penukaran-poin/tukar',
            [WargaPenukaranPoinController::class, 'tukarPoin']
        );
        Route::get(
            '/warga/penukaran-poin/riwayat',
            [WargaPenukaranPoinController::class, 'riwayatPenukaran']
        );
    });


    /*
    |--------------------------------------------------------------------------
    | Pengepul
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:pengepul,admin')->group(function () {

        Route::get('/pengepul/test', function (Request $request) {
            return response()->json([
                'message' => 'Akses pengepul berhasil.',
                'user' => $request->user(),
            ]);
        });

        Route::get('/pengepul/stok', [PengepulStokSampahController::class, 'index']);

        Route::get('/pengepul/stok/{id}', [PengepulStokSampahController::class, 'show']);
    });

});