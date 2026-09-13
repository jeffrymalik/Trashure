<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PengajuanPenjemputan;
use Illuminate\Http\Request;

class PengajuanPenjemputanController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->user()->admin;

        if (!$admin) {
            return response()->json([
                'message' => 'Profil admin tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'status_pengajuan',
                'diajukan'
            )
            ->with([
                'warga',
                'detailPengajuanSampah.jenisSampah',
            ])
            ->orderByDesc('tanggal_pengajuan')
            ->get();

        return response()->json([
            'message' => 'Daftar pengajuan penjemputan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }

    public function show(Request $request, $id)
    {
        $admin = $request->user()->admin;

        if (!$admin) {
            return response()->json([
                'message' => 'Profil admin tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::with([
            'warga',
            'detailPengajuanSampah.jenisSampah',
            'jadwalPenjemputan.petugas',
        ])
            ->where('pengajuan_id', $id)
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan penjemputan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pengajuan penjemputan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }
    public function jadwalkan(Request $request, $id)
    {
        $admin = $request->user()->admin;

        if (!$admin) {
            return response()->json([
                'message' => 'Profil admin tidak ditemukan.',
            ], 404);
        }

        $request->validate([
            'petugas_id' => 'required|integer|exists:petugas,petugas_id',
            'tanggal_penjemputan' => 'required|date',
            'waktu_penjemputan' => 'required|date_format:H:i',
            'catatan' => 'nullable|string',
        ]);

        $pengajuan = PengajuanPenjemputan::where(
            'pengajuan_id',
            $id
        )->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan penjemputan tidak ditemukan.',
            ], 404);
        }

        if ($pengajuan->status_pengajuan !== 'diajukan') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat dijadwalkan.',
                'status_pengajuan' => $pengajuan->status_pengajuan,
            ], 422);
        }

        if ($pengajuan->jadwalPenjemputan) {
            return response()->json([
                'message' => 'Pengajuan sudah memiliki jadwal penjemputan.',
            ], 422);
        }

        $jadwal = \DB::transaction(function () use (
            $request,
            $admin,
            $pengajuan
        ) {
            $jadwal = \App\Models\JadwalPenjemputan::create([
                'pengajuan_id' => $pengajuan->pengajuan_id,
                'admin_id' => $admin->admin_id,
                'petugas_id' => $request->petugas_id,
                'tanggal_penjemputan' => $request->tanggal_penjemputan,
                'waktu_penjemputan' => $request->waktu_penjemputan,
                'status_jadwal' => 'terjadwal',
                'catatan' => $request->catatan,
            ]);

            $pengajuan->update([
                'status_pengajuan' => 'dijadwalkan',
            ]);

            return $jadwal;
        });

        $jadwal->load([
            'pengajuanPenjemputan.warga',
            'petugas',
            'admin',
        ]);

        return response()->json([
            'message' => 'Penjemputan berhasil dijadwalkan.',
            'data' => $jadwal,
        ], 201);
    }
}