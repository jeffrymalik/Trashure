<?php

namespace App\Http\Controllers\Api\Pengepul;

use App\Http\Controllers\Controller;
use App\Models\StokSampah;
use Illuminate\Http\Request;

class StokSampahController extends Controller
{
    public function index(Request $request)
    {
        $pengepul = $request->user()->pengepul;

        if (!$pengepul) {
            return response()->json([
                'message' => 'Profil pengepul tidak ditemukan.',
            ], 404);
        }

        $stok = StokSampah::with('jenisSampah')
            ->where('jumlah_stok', '>', 0)
            ->orderBy('jenis_sampah_id')
            ->get();

        return response()->json([
            'message' => 'Daftar stok sampah berhasil diambil.',
            'data' => $stok,
        ]);
    }
    public function show(Request $request, $id)
    {
        $pengepul = $request->user()->pengepul;

        if (!$pengepul) {
            return response()->json([
                'message' => 'Profil pengepul tidak ditemukan.',
            ], 404);
        }

        $stok = StokSampah::with('jenisSampah')
            ->where('stok_id', $id)
            ->where('jumlah_stok', '>', 0)
            ->first();

        if (!$stok) {
            return response()->json([
                'message' => 'Stok sampah tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail stok sampah berhasil diambil.',
            'data' => $stok,
        ]);
    }
}