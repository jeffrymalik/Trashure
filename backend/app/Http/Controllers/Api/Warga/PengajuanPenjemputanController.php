<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\PengajuanPenjemputan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengajuanPenjemputanController extends Controller
{
    public function index(Request $request)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'warga_id',
                $warga->warga_id
            )
            ->with([
                'detailPengajuanSampah.jenisSampah'
            ])
            ->latest('tanggal_pengajuan')
            ->get();

        return response()->json([
            'message' => 'Daftar pengajuan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'alamat_penjemputan' => 'required|string',
            'perkiraan_total_berat' => 'required|numeric|min:0.01',
            'catatan' => 'nullable|string',

            'detail_sampah' => 'required|array|min:1',

            'detail_sampah.*.jenis_sampah_id'
                => 'required|integer|exists:jenis_sampah,jenis_sampah_id',

            'detail_sampah.*.perkiraan_berat'
                => 'required|numeric|min:0.01',
        ]);

        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $totalDetailBerat = collect($request->detail_sampah)
            ->sum('perkiraan_berat');

        if ((float) $totalDetailBerat !== (float) $request->perkiraan_total_berat) {
            return response()->json([
                'message' => 'Total perkiraan berat tidak sesuai dengan detail sampah.',
                'total_detail_berat' => $totalDetailBerat,
                'perkiraan_total_berat' => $request->perkiraan_total_berat,
            ], 422);
        }

        $pengajuan = DB::transaction(function () use ($request, $warga) {

            $pengajuan = PengajuanPenjemputan::create([
                'warga_id' => $warga->warga_id,
                'tanggal_pengajuan' => now(),
                'alamat_penjemputan' => $request->alamat_penjemputan,
                'perkiraan_total_berat' => $request->perkiraan_total_berat,
                'catatan' => $request->catatan,
                'status_pengajuan' => 'diajukan',
            ]);

            foreach ($request->detail_sampah as $detail) {
                $pengajuan->detailPengajuanSampah()->create([
                    'jenis_sampah_id' => $detail['jenis_sampah_id'],
                    'perkiraan_berat' => $detail['perkiraan_berat'],
                ]);
            }

            return $pengajuan;
        });

        $pengajuan->load('detailPengajuanSampah.jenisSampah');

        return response()->json([
            'message' => 'Pengajuan penjemputan berhasil dibuat.',
            'data' => $pengajuan,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'pengajuan_id',
                $id
            )
            ->where(
                'warga_id',
                $warga->warga_id
            )
            ->with([
                'detailPengajuanSampah.jenisSampah',
                'jadwalPenjemputan',
                'transaksiSetoran',
            ])
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pengajuan berhasil diambil.',
            'data' => $pengajuan,
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'pengajuan_id',
                $id
            )
            ->where(
                'warga_id',
                $warga->warga_id
            )
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan tidak ditemukan.',
            ], 404);
        }

        if ($pengajuan->status_pengajuan !== 'diajukan') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat dibatalkan karena sudah diproses.',
                'status_pengajuan' => $pengajuan->status_pengajuan,
            ], 422);
        }

        $pengajuan->update([
            'status_pengajuan' => 'dibatalkan',
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil dibatalkan.',
            'data' => $pengajuan,
        ]);
    }

    public function status(Request $request, $id)
    {
        $warga = $request->user()->warga;

        if (!$warga) {
            return response()->json([
                'message' => 'Profil warga tidak ditemukan.',
            ], 404);
        }

        $pengajuan = PengajuanPenjemputan::where(
                'pengajuan_id',
                $id
            )
            ->where(
                'warga_id',
                $warga->warga_id
            )
            ->with([
                'jadwalPenjemputan',
                'transaksiSetoran',
                'transaksiSetoran.poinSementara',
            ])
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan tidak ditemukan.',
            ], 404);
        }

        $setoran = $pengajuan->transaksiSetoran;
        $jadwal = $pengajuan->jadwalPenjemputan;

        return response()->json([
            'message' => 'Status pengajuan berhasil diambil.',
            'data' => [
                'pengajuan_id' => $pengajuan->pengajuan_id,

                'status_pengajuan' => $pengajuan->status_pengajuan,

                'jadwal_penjemputan' => $jadwal ? [
                    'jadwal_id' => $jadwal->jadwal_id,
                    'tanggal_penjemputan' => $jadwal->tanggal_penjemputan,
                    'waktu_penjemputan' => $jadwal->waktu_penjemputan,
                    'status_jadwal' => $jadwal->status_jadwal,
                ] : null,

                'setoran' => $setoran ? [
                    'setoran_id' => $setoran->setoran_id,
                    'tanggal_setoran' => $setoran->tanggal_setoran,
                    'status_validasi' => $setoran->status_validasi,
                    'total_berat_aktual' => $setoran->total_berat_aktual,
                    'total_poin_sementara' => $setoran->total_poin_sementara,
                ] : null,

                'poin' => $setoran?->poinSementara ? [
                    'jumlah_poin' => $setoran->poinSementara->jumlah_poin,
                    'status_poin' => $setoran->poinSementara->status_poin,
                ] : null,
            ],
        ]);
    }
}