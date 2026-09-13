<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\JadwalPenjemputan;
use Illuminate\Http\Request;

class JadwalPenjemputanController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->user()->admin;

        if (!$admin) {
            return response()->json([
                'message' => 'Profil admin tidak ditemukan.',
            ], 404);
        }

        $jadwal = JadwalPenjemputan::with([
            'pengajuanPenjemputan.warga',
            'petugas',
        ])
            ->orderBy('tanggal_penjemputan')
            ->orderBy('waktu_penjemputan')
            ->get();

        return response()->json([
            'message' => 'Daftar jadwal penjemputan berhasil diambil.',
            'data' => $jadwal,
        ]);
    }
}