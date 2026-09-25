<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransaksiSetoran;
use App\Models\JadwalPenjemputan;
use App\Models\TransaksiPenjualan;
use App\Models\StokSampah;
use App\Models\PenukaranPoin;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admin - Laporan PDF",
    description: "API download laporan dalam format PDF."
)]
class LaporanController extends Controller
{
    #[OA\Get(
        path: "/admin/laporan/setoran",
        summary: "Download laporan setoran (PDF)",
        description: "Mengunduh laporan transaksi setoran sampah dalam format PDF.",
        tags: ["Admin - Laporan PDF"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(response: 200, description: "PDF laporan setoran", content: new OA\MediaType(mediaType: "application/pdf")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 422, description: "Validasi error"),
        ],
    )]
    public function setoran(Request $request)
    {
        $request->validate([
            'dari' => 'nullable|date',
            'sampai' => 'nullable|date|after_or_equal:dari',
        ]);

        $query = TransaksiSetoran::with('warga', 'petugas', 'detailSetoran.jenisSampah');

        if ($request->filled('dari')) {
            $query->where('tanggal_setoran', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->where('tanggal_setoran', '<=', $request->sampai . ' 23:59:59');
        }

        $data = $query->orderBy('tanggal_setoran', 'desc')->get();

        $totalBerat = $data->sum('total_berat_aktual');
        $totalPoin = $data->sum('total_poin');

        $pdf = Pdf::loadView('laporan.setoran', [
            'data' => $data,
            'totalBerat' => $totalBerat,
            'totalPoin' => $totalPoin,
            'dari' => $request->dari ?? Carbon::now()->startOfMonth()->format('d M Y'),
            'sampai' => $request->sampai ?? Carbon::now()->format('d M Y'),
        ]);

        return $pdf->download('laporan-setoran.pdf');
    }

    #[OA\Get(
        path: "/admin/laporan/penjemputan",
        summary: "Download laporan penjemputan (PDF)",
        description: "Mengunduh laporan penjemputan sampah dalam format PDF.",
        tags: ["Admin - Laporan PDF"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(response: 200, description: "PDF laporan penjemputan", content: new OA\MediaType(mediaType: "application/pdf")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 422, description: "Validasi error"),
        ],
    )]
    public function penjemputan(Request $request)
    {
        $request->validate([
            'dari' => 'nullable|date',
            'sampai' => 'nullable|date|after_or_equal:dari',
        ]);

        $query = JadwalPenjemputan::with('pengajuanPenjemputan.warga', 'petugas');

        if ($request->filled('dari')) {
            $query->where('tanggal_penjemputan', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->where('tanggal_penjemputan', '<=', $request->sampai . ' 23:59:59');
        }

        $data = $query->orderBy('tanggal_penjemputan', 'desc')->get();

        $total = $data->count();
        $selesai = $data->where('status_jadwal', 'selesai')->count();
        $dibatalkan = $data->where('status_jadwal', 'dibatalkan')->count();

        $pdf = Pdf::loadView('laporan.penjemputan', [
            'data' => $data,
            'total' => $total,
            'selesai' => $selesai,
            'dibatalkan' => $dibatalkan,
            'dari' => $request->dari ?? Carbon::now()->startOfMonth()->format('d M Y'),
            'sampai' => $request->sampai ?? Carbon::now()->format('d M Y'),
        ]);

        return $pdf->download('laporan-penjemputan.pdf');
    }

    #[OA\Get(
        path: "/admin/laporan/penjualan",
        summary: "Download laporan penjualan (PDF)",
        description: "Mengunduh laporan transaksi penjualan sampah dalam format PDF.",
        tags: ["Admin - Laporan PDF"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(response: 200, description: "PDF laporan penjualan", content: new OA\MediaType(mediaType: "application/pdf")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 422, description: "Validasi error"),
        ],
    )]
    public function penjualan(Request $request)
    {
        $request->validate([
            'dari' => 'nullable|date',
            'sampai' => 'nullable|date|after_or_equal:dari',
        ]);

        $query = TransaksiPenjualan::with('pengepul', 'detailPenjualan.jenisSampah');

        if ($request->filled('dari')) {
            $query->where('tanggal_transaksi', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->where('tanggal_transaksi', '<=', $request->sampai . ' 23:59:59');
        }

        $data = $query->orderBy('tanggal_transaksi', 'desc')->get();

        $totalPenjualan = $data->sum('total_penjualan');

        $pdf = Pdf::loadView('laporan.penjualan', [
            'data' => $data,
            'totalPenjualan' => $totalPenjualan,
            'dari' => $request->dari ?? Carbon::now()->startOfMonth()->format('d M Y'),
            'sampai' => $request->sampai ?? Carbon::now()->format('d M Y'),
        ]);

        return $pdf->download('laporan-penjualan.pdf');
    }

    #[OA\Get(
        path: "/admin/laporan/stok",
        summary: "Download laporan stok sampah (PDF)",
        description: "Mengunduh laporan stok sampah dalam format PDF.",
        tags: ["Admin - Laporan PDF"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "PDF laporan stok", content: new OA\MediaType(mediaType: "application/pdf")),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function stok(Request $request)
    {
        $data = StokSampah::with('jenisSampah')
            ->get()
            ->sortBy(fn ($item) => $item->jenisSampah->nama_jenis_sampah ?? '')
            ->values();

        $totalStok = $data->sum('jumlah_stok');

        $pdf = Pdf::loadView('laporan.stok', [
            'data' => $data,
            'totalStok' => $totalStok,
            'tanggal' => Carbon::now()->format('d M Y'),
        ]);

        return $pdf->download('laporan-stok.pdf');
    }

    #[OA\Get(
        path: "/admin/laporan/poin",
        summary: "Download laporan penukaran poin (PDF)",
        description: "Mengunduh laporan penukaran poin dalam format PDF.",
        tags: ["Admin - Laporan PDF"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(response: 200, description: "PDF laporan penukaran poin", content: new OA\MediaType(mediaType: "application/pdf")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 422, description: "Validasi error"),
        ],
    )]
    public function poin(Request $request)
    {
        $request->validate([
            'dari' => 'nullable|date',
            'sampai' => 'nullable|date|after_or_equal:dari',
        ]);

        $query = PenukaranPoin::with('warga', 'voucher');

        if ($request->filled('dari')) {
            $query->where('tanggal_pengajuan', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->where('tanggal_pengajuan', '<=', $request->sampai . ' 23:59:59');
        }

        $data = $query->orderBy('tanggal_pengajuan', 'desc')->get();

        $totalPoin = $data->sum('poin_digunakan');

        $pdf = Pdf::loadView('laporan.poin', [
            'data' => $data,
            'totalPoin' => $totalPoin,
            'dari' => $request->dari ?? Carbon::now()->startOfMonth()->format('d M Y'),
            'sampai' => $request->sampai ?? Carbon::now()->format('d M Y'),
        ]);

        return $pdf->download('laporan-poin.pdf');
    }
}
