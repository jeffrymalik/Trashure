<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Warga\JenisSampahController;
use App\Http\Controllers\Api\Warga\PengajuanPenjemputanController;
use App\Http\Controllers\Api\Petugas\JadwalPenjemputanController;
use App\Http\Controllers\Api\Petugas\SetoranController;
use App\Http\Controllers\Api\Admin\PengajuanPenjemputanController as AdminPengajuanPenjemputanController;
use App\Http\Controllers\Api\Admin\JadwalPenjemputanController as AdminJadwalPenjemputanController;

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

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);


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

        Route::patch(
            '/petugas/setoran/{setoranId}/validasi',
            [SetoranController::class, 'validasi']
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
            '/warga/jenis-sampah',
            [JenisSampahController::class, 'index']
        );
        Route::get(
            '/warga/jenis-sampah/{id}',
             [JenisSampahController::class, 'show']
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
    });


    /*
    |--------------------------------------------------------------------------
    | Pengepul
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:pengepul')->group(function () {

        Route::get('/pengepul/test', function (Request $request) {
            return response()->json([
                'message' => 'Akses pengepul berhasil.',
                'user' => $request->user(),
            ]);
        });
    });

});