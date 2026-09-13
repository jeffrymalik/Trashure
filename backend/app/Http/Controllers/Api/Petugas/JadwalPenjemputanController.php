<?php

namespace App\Http\Controllers\Api\Petugas;

use App\Http\Controllers\Controller;
use App\Models\JadwalPenjemputan;
use Illuminate\Http\Request;

class JadwalPenjemputanController extends Controller
{
    public function index(Request $request)
    {
        $petugas = $request->user()->petugas;

        if (!$petugas) {
            return response()->json([
                'message' => 'Profil petugas tidak ditemukan.',
            ], 404);
        }

        $jadwal = JadwalPenjemputan::where(
                'petugas_id',
                $petugas->petugas_id
            )
            ->with([
                'pengajuanPenjemputan.warga',
                'pengajuanPenjemputan.detailPengajuanSampah.jenisSampah',
            ])
            ->orderBy('tanggal_penjemputan')
            ->orderBy('waktu_penjemputan')
            ->get();

        return response()->json([
            'message' => 'Daftar jadwal penjemputan berhasil diambil.',
            'data' => $jadwal,
        ]);
    }

    public function show(Request $request, $id)
    {
        $petugas = $request->user()->petugas;

        if (!$petugas) {
            return response()->json([
                'message' => 'Profil petugas tidak ditemukan.',
            ], 404);
        }

        $jadwal = JadwalPenjemputan::where(
                'jadwal_id',
                $id
            )
            ->where(
                'petugas_id',
                $petugas->petugas_id
            )
            ->with([
                'pengajuanPenjemputan.warga',
                'pengajuanPenjemputan.detailPengajuanSampah.jenisSampah',
            ])
            ->first();

        if (!$jadwal) {
            return response()->json([
                'message' => 'Jadwal penjemputan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail jadwal penjemputan berhasil diambil.',
            'data' => $jadwal,
        ]);
    }

    public function proses(Request $request, $id)
    {
        $petugas = $request->user()->petugas;

        if (!$petugas) {
            return response()->json([
                'message' => 'Profil petugas tidak ditemukan.',
            ], 404);
        }

        $jadwal = JadwalPenjemputan::where(
                'jadwal_id',
                $id
            )
            ->where(
                'petugas_id',
                $petugas->petugas_id
            )
            ->with('pengajuanPenjemputan')
            ->first();

        if (!$jadwal) {
            return response()->json([
                'message' => 'Jadwal penjemputan tidak ditemukan.',
            ], 404);
        }

        if ($jadwal->status_jadwal !== 'terjadwal') {
            return response()->json([
                'message' => 'Jadwal tidak dapat diproses.',
                'status_jadwal' => $jadwal->status_jadwal,
            ], 422);
        }

        $jadwal->update([
            'status_jadwal' => 'diproses',
        ]);

        $jadwal->pengajuanPenjemputan->update([
            'status_pengajuan' => 'diproses',
        ]);

        $jadwal->load('pengajuanPenjemputan');

        return response()->json([
            'message' => 'Penjemputan berhasil diproses.',
            'data' => $jadwal,
        ]);
    }
}