<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\JenisSampah;
use Illuminate\Http\Request;

class JenisSampahController extends Controller
{
    public function index()
    {
        $jenisSampah = JenisSampah::where('status', 'aktif')
            ->orderBy('nama_jenis_sampah')
            ->get([
                'jenis_sampah_id',
                'nama_jenis_sampah',
                'satuan',
                'keterangan',
                'status',
            ]);

        return response()->json([
            'message' => 'Data jenis sampah berhasil diambil.',
            'data' => $jenisSampah,
        ]);
    }
    public function show($id)
    {
        $jenisSampah = JenisSampah::where('jenis_sampah_id', $id)
            ->where('status', 'aktif')
            ->first();

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
}