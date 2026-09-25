<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransaksiSetoran;
use App\Models\JadwalPenjemputan;
use App\Models\TransaksiPenjualan;
use App\Models\StokSampah;
use App\Models\PenukaranPoin;
use Illuminate\Http\Request;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admin - Laporan Data",
    description: "API data laporan dalam format JSON untuk ditampilkan di halaman laporan admin."
)]
class LaporanDataController extends Controller
{
    private function getDateRange(Request $request): array
    {
        $dari = $request->query('dari');
        $sampai = $request->query('sampai');

        if ($dari && $sampai) {
            return [Carbon::parse($dari)->startOfDay(), Carbon::parse($sampai)->endOfDay()];
        }

        $bulan = $request->query('bulan', now()->format('Y-m'));
        return [Carbon::parse($bulan)->startOfMonth(), Carbon::parse($bulan)->endOfMonth()];
    }

    #[OA\Get(
        path: "/admin/laporan-data/setoran",
        summary: "Data laporan setoran (JSON)",
        description: "Mengambil data laporan transaksi setoran dalam format JSON.",
        tags: ["Admin - Laporan Data"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "bulan", in: "query", required: false, description: "Filter bulan (YYYY-MM)", schema: new OA\Schema(type: "string", example: "2026-09")),
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Data laporan setoran berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "summary", type: "object"),
                        new OA\Property(property: "range", type: "object"),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function setoran(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        $data = TransaksiSetoran::with('warga', 'petugas')
            ->whereBetween('tanggal_setoran', [$start, $end])
            ->orderBy('tanggal_setoran', 'desc')
            ->get();

        return response()->json([
            'data' => $data->map(fn ($item) => [
                'setoran_id' => $item->setoran_id,
                'tanggal' => $item->tanggal_setoran->format('d/m/Y'),
                'nama_warga' => $item->warga->nama_warga ?? '-',
                'nama_petugas' => $item->petugas->nama_petugas ?? '-',
                'berat' => (float) $item->total_berat_aktual,
                'poin' => (int) $item->total_poin,
                'status' => $item->status_validasi,
            ]),
            'summary' => [
                'total' => $data->count(),
                'total_berat' => (float) $data->sum('total_berat_aktual'),
                'total_poin' => (int) $data->sum('total_poin'),
            ],
            'range' => ['dari' => $start->format('Y-m-d'), 'sampai' => $end->format('Y-m-d')],
        ]);
    }

    #[OA\Get(
        path: "/admin/laporan-data/penjemputan",
        summary: "Data laporan penjemputan (JSON)",
        description: "Mengambil data laporan penjemputan dalam format JSON.",
        tags: ["Admin - Laporan Data"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "bulan", in: "query", required: false, description: "Filter bulan (YYYY-MM)", schema: new OA\Schema(type: "string", example: "2026-09")),
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Data laporan penjemputan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "summary", type: "object"),
                        new OA\Property(property: "range", type: "object"),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function penjemputan(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        $data = JadwalPenjemputan::with('pengajuanPenjemputan.warga', 'petugas')
            ->whereBetween('tanggal_penjemputan', [$start, $end])
            ->orderBy('tanggal_penjemputan', 'desc')
            ->get();

        return response()->json([
            'data' => $data->map(fn ($item) => [
                'jadwal_id' => $item->jadwal_id,
                'tanggal' => $item->tanggal_penjemputan->format('d/m/Y'),
                'nama_warga' => $item->pengajuanPenjemputan->warga->nama_warga ?? '-',
                'nama_petugas' => $item->petugas->nama_petugas ?? '-',
                'status' => $item->status_jadwal,
            ]),
            'summary' => [
                'total' => $data->count(),
                'selesai' => $data->where('status_jadwal', 'selesai')->count(),
                'dibatalkan' => $data->where('status_jadwal', 'dibatalkan')->count(),
            ],
            'range' => ['dari' => $start->format('Y-m-d'), 'sampai' => $end->format('Y-m-d')],
        ]);
    }

    #[OA\Get(
        path: "/admin/laporan-data/penjualan",
        summary: "Data laporan penjualan (JSON)",
        description: "Mengambil data laporan transaksi penjualan dalam format JSON.",
        tags: ["Admin - Laporan Data"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "bulan", in: "query", required: false, description: "Filter bulan (YYYY-MM)", schema: new OA\Schema(type: "string", example: "2026-09")),
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Data laporan penjualan berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "summary", type: "object"),
                        new OA\Property(property: "range", type: "object"),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function penjualan(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        $data = TransaksiPenjualan::with('pengepul', 'detailPenjualan.jenisSampah')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->orderBy('tanggal_transaksi', 'desc')
            ->get();

        return response()->json([
            'data' => $data->map(function ($item) {
                $totalBerat = $item->detailPenjualan->sum('jumlah_terjual');

                return [
                    'penjualan_id' => $item->penjualan_id,
                    'tanggal' => $item->tanggal_transaksi->format('d/m/Y'),
                    'nama_pengepul' => $item->pengepul->nama_pengepul ?? '-',
                    'media_konfirmasi' => $item->media_konfirmasi ?? '-',
                    'metode_transaksi' => $item->metode_transaksi ?? '-',
                    'detail_penjualan' => $item->detailPenjualan->map(fn ($d) => [
                        'detail_penjualan_id' => $d->detail_penjualan_id,
                        'jenis_sampah_id' => $d->jenis_sampah_id,
                        'nama_jenis_sampah' => $d->jenisSampah->nama_jenis_sampah ?? '-',
                        'jumlah_terjual' => (float) $d->jumlah_terjual,
                        'harga_satuan' => (float) $d->harga_satuan,
                        'subtotal' => (float) $d->subtotal,
                    ]),
                    'total_berat' => (float) $totalBerat,
                    'total' => (float) $item->total_penjualan,
                    'status' => $item->status_transaksi,
                ];
            }),
            'summary' => [
                'total' => $data->count(),
                'total_berat' => (float) $data->sum(fn ($item) => $item->detailPenjualan->sum('jumlah_terjual')),
                'total_penjualan' => (float) $data->sum('total_penjualan'),
            ],
            'range' => ['dari' => $start->format('Y-m-d'), 'sampai' => $end->format('Y-m-d')],
        ]);
    }

    #[OA\Get(
        path: "/admin/laporan-data/stok",
        summary: "Data laporan stok sampah (JSON)",
        description: "Mengambil data laporan stok sampah dalam format JSON.",
        tags: ["Admin - Laporan Data"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Data laporan stok berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "summary", type: "object"),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function stok(Request $request)
    {
        $data = StokSampah::with('jenisSampah')
            ->get()
            ->sortBy(fn ($item) => $item->jenisSampah->nama_jenis_sampah ?? '')
            ->values();

        return response()->json([
            'data' => $data->map(fn ($item) => [
                'stok_id' => $item->stok_id,
                'nama_jenis' => $item->jenisSampah->nama_jenis_sampah ?? '-',
                'jumlah_stok' => (float) $item->jumlah_stok,
                'satuan' => $item->satuan ?? 'kg',
            ]),
            'summary' => [
                'total_jenis' => $data->count(),
                'total_stok' => (float) $data->sum('jumlah_stok'),
            ],
        ]);
    }

    #[OA\Get(
        path: "/admin/laporan-data/poin",
        summary: "Data laporan penukaran poin (JSON)",
        description: "Mengambil data laporan penukaran poin dalam format JSON.",
        tags: ["Admin - Laporan Data"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "bulan", in: "query", required: false, description: "Filter bulan (YYYY-MM)", schema: new OA\Schema(type: "string", example: "2026-09")),
            new OA\Parameter(name: "dari", in: "query", required: false, description: "Tanggal dari (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
            new OA\Parameter(name: "sampai", in: "query", required: false, description: "Tanggal sampai (YYYY-MM-DD)", schema: new OA\Schema(type: "string", format: "date")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Data laporan penukaran poin berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "summary", type: "object"),
                        new OA\Property(property: "range", type: "object"),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function poin(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);

        $data = PenukaranPoin::with('warga', 'voucher')
            ->whereBetween('tanggal_pengajuan', [$start, $end])
            ->orderBy('tanggal_pengajuan', 'desc')
            ->get();

        return response()->json([
            'data' => $data->map(fn ($item) => [
                'penukaran_id' => $item->penukaran_id,
                'tanggal' => $item->tanggal_pengajuan->format('d/m/Y'),
                'nama_warga' => $item->warga->nama_warga ?? '-',
                'nama_voucher' => $item->voucher->nama_voucher ?? '-',
                'poin_digunakan' => (int) $item->poin_digunakan,
            ]),
            'summary' => [
                'total' => $data->count(),
                'total_poin' => (int) $data->sum('poin_digunakan'),
            ],
            'range' => ['dari' => $start->format('Y-m-d'), 'sampai' => $end->format('Y-m-d')],
        ]);
    }
}
