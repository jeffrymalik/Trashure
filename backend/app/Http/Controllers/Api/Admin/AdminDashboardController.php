<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use App\Models\Petugas;
use App\Models\TransaksiSetoran;
use App\Models\DetailSetoran;
use App\Models\PengajuanPenjemputan;
use App\Models\JadwalPenjemputan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admin - Dashboard",
    description: "Dashboard admin - ringkasan aktivitas bank sampah."
)]
class AdminDashboardController extends Controller
{
    #[OA\Get(
        path: "/admin/dashboard",
        summary: "Dashboard admin",
        description: "Mengambil data dashboard admin: statistik, grafik setoran, komposisi sampah, pengajuan terbaru, setoran menunggu validasi, dan aktivitas terbaru.",
        tags: ["Admin - Dashboard"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dashboard berhasil diambil",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Dashboard admin berhasil diambil."),
                        new OA\Property(
                            property: "data",
                            type: "object",
                            properties: [
                                new OA\Property(
                                    property: "stats",
                                    type: "object",
                                    properties: [
                                        new OA\Property(property: "total_warga", type: "integer", example: 50),
                                        new OA\Property(property: "total_petugas", type: "integer", example: 10),
                                        new OA\Property(property: "setoran_7_hari", type: "number", format: "float", example: 125.5),
                                        new OA\Property(property: "persen_setoran", type: "number", format: "float", example: 12.5),
                                        new OA\Property(property: "transaksi_hari_ini", type: "integer", example: 5),
                                    ],
                                ),
                                new OA\Property(property: "grafik_setoran", type: "array", items: new OA\Items(type: "object")),
                                new OA\Property(property: "komposisi_sampah", type: "array", items: new OA\Items(type: "object")),
                                new OA\Property(property: "total_komposisi", type: "number", format: "float"),
                                new OA\Property(property: "pengajuan_terbaru", type: "array", items: new OA\Items(type: "object")),
                                new OA\Property(property: "setoran_menunggu", type: "array", items: new OA\Items(type: "object")),
                                new OA\Property(property: "aktivitas_terbaru", type: "array", items: new OA\Items(type: "object")),
                            ],
                        ),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ],
    )]
    public function index(Request $request)
    {
        $now = now();

        // Stats
        $totalWarga = Warga::count();
        $totalPetugas = Petugas::count();

        $setoran7Hari = TransaksiSetoran::where('tanggal_setoran', '>=', $now->copy()->subDays(7))
            ->sum('total_berat_aktual');

        $setoran7HariSebelumnya = TransaksiSetoran::where('tanggal_setoran', '>=', $now->copy()->subDays(14))
            ->where('tanggal_setoran', '<', $now->copy()->subDays(7))
            ->sum('total_berat_aktual');

        $persenBerat = $setoran7HariSebelumnya > 0
            ? round((($setoran7Hari - $setoran7HariSebelumnya) / $setoran7HariSebelumnya) * 100, 1)
            : ($setoran7Hari > 0 ? 100 : 0);

        $transaksiHariIni = TransaksiSetoran::whereDate('tanggal_setoran', $now->toDateString())->count();

        // Grafik setoran 7 hari terakhir
        $grafikSetoran = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $totalBerat = TransaksiSetoran::whereDate('tanggal_setoran', $date->toDateString())
                ->sum('total_berat_aktual');
            $grafikSetoran[] = [
                'name' => $date->format('d M'),
                'value' => round((float) $totalBerat, 1),
            ];
        }

        // Komposisi jenis sampah (dari detail_setoran 7 hari terakhir)
        $komposisiRaw = DetailSetoran::select('jenis_sampah_id', DB::raw('SUM(berat_aktual) as total_berat'))
            ->whereHas('transaksiSetoran', function ($q) use ($now) {
                $q->where('tanggal_setoran', '>=', $now->copy()->subDays(7));
            })
            ->groupBy('jenis_sampah_id')
            ->with('jenisSampah')
            ->get();

        $totalKomposisi = $komposisiRaw->sum('total_berat');
        $komposisi = $komposisiRaw->map(function ($item) use ($totalKomposisi) {
            $percentage = $totalKomposisi > 0 ? round(($item->total_berat / $totalKomposisi) * 100, 1) : 0;
            return [
                'name' => $item->jenisSampah->nama_jenis_sampah ?? 'Lainnya',
                'value' => round((float) $item->total_berat, 1),
                'percentage' => number_format($percentage, 1, ',', '.') . '%',
            ];
        })->sortByDesc('value')->values();

        // Pengajuan terbaru
        $pengajuan = PengajuanPenjemputan::with(['warga', 'jadwalPenjemputan.petugas'])
            ->latest('tanggal_pengajuan')
            ->take(5)
            ->get()
            ->map(function ($p) {
                $jadwal = $p->jadwalPenjemputan;
                return [
                    'no' => 'PGJ-' . $p->pengajuan_id,
                    'warga' => $p->warga->nama_warga ?? '-',
                    'tanggal_ajukan' => $p->tanggal_pengajuan?->format('d M Y H:i') ?? '-',
                    'jadwal' => $jadwal
                        ? $jadwal->tanggal_penjemputan?->format('d M Y') . ' ' . ($jadwal->waktu_penjemputan ?? '')
                        : '-',
                    'petugas' => $jadwal?->petugas->nama_petugas ?? '-',
                    'status' => $p->status_pengajuan,
                    'status_color' => match ($p->status_pengajuan) {
                        'diajukan' => 'bg-amber-100 text-amber-700',
                        'dijadwalkan' => 'bg-green-100 text-green-700',
                        'diproses' => 'bg-blue-100 text-blue-700',
                        'selesai' => 'bg-emerald-100 text-emerald-700',
                        'dibatalkan' => 'bg-red-100 text-red-700',
                        default => 'bg-gray-100 text-gray-700',
                    },
                ];
            });

        // Setoran menunggu validasi
        $setoranMenunggu = TransaksiSetoran::with(['warga', 'detailSetoran.jenisSampah'])
            ->where('status_validasi', 'menunggu')
            ->latest('tanggal_setoran')
            ->take(5)
            ->get()
            ->map(function ($s) {
                $jenisList = $s->detailSetoran->pluck('jenisSampah.nama_jenis_sampah')->filter()->implode(', ');
                return [
                    'nama' => $s->warga->nama_warga ?? '-',
                    'tanggal' => $s->tanggal_setoran?->format('d M Y H:i') ?? '-',
                    'berat' => number_format((float) $s->total_berat_aktual, 1, ',', '.') . ' kg',
                    'jenis' => $jenisList ?: '-',
                    'status' => 'Menunggu',
                    'status_color' => 'bg-amber-100 text-amber-700',
                ];
            });

        // Aktivitas terbaru (gabungan dari beberapa tabel)
        $aktivitas = collect();

        // Pengajuan terbaru
        PengajuanPenjemputan::with('warga')
            ->latest('created_at')
            ->take(5)
            ->get()
            ->each(function ($p) use ($aktivitas) {
                $statusText = match ($p->status_pengajuan) {
                    'dijadwalkan' => 'Pengajuan dari ' . ($p->warga->nama_warga ?? '-') . ' dijadwalkan',
                    'selesai' => 'Penjemputan dari ' . ($p->warga->nama_warga ?? '-') . ' selesai',
                    'dibatalkan' => 'Pengajuan dari ' . ($p->warga->nama_warga ?? '-') . ' dibatalkan',
                    default => 'Pengajuan baru dari ' . ($p->warga->nama_warga ?? '-'),
                };
                $aktivitas->push([
                    'text' => $statusText,
                    'time' => $p->created_at?->diffForHumans() ?? '-',
                    'timestamp' => $p->created_at,
                    'type' => 'pengajuan',
                ]);
            });

        // Setoran terbaru
        TransaksiSetoran::with('warga')
            ->latest('created_at')
            ->take(5)
            ->get()
            ->each(function ($s) use ($aktivitas) {
                $text = match ($s->status_validasi) {
                    'disetujui' => 'Setoran dari ' . ($s->warga->nama_warga ?? '-') . ' telah divalidasi',
                    'ditolak' => 'Setoran dari ' . ($s->warga->nama_warga ?? '-') . ' ditolak',
                    default => 'Setoran baru dari ' . ($s->warga->nama_warga ?? '-'),
                };
                $aktivitas->push([
                    'text' => $text,
                    'time' => $s->created_at?->diffForHumans() ?? '-',
                    'timestamp' => $s->created_at,
                    'type' => 'setoran',
                ]);
            });

        $aktivitas = $aktivitas->sortByDesc('timestamp')->take(5)->values();

        return response()->json([
            'message' => 'Dashboard admin berhasil diambil.',
            'data' => [
                'stats' => [
                    'total_warga' => $totalWarga,
                    'total_petugas' => $totalPetugas,
                    'setoran_7_hari' => round((float) $setoran7Hari, 1),
                    'persen_setoran' => $persenBerat,
                    'transaksi_hari_ini' => $transaksiHariIni,
                ],
                'grafik_setoran' => $grafikSetoran,
                'komposisi_sampah' => $komposisi,
                'total_komposisi' => round((float) $totalKomposisi, 1),
                'pengajuan_terbaru' => $pengajuan,
                'setoran_menunggu' => $setoranMenunggu,
                'aktivitas_terbaru' => $aktivitas,
            ],
        ]);
    }
}
