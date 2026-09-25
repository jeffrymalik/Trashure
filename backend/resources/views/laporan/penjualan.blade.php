<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #16a34a; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 18px; color: #16a34a; }
        .header p { margin: 5px 0 0; font-size: 11px; color: #666; }
        .info { margin-bottom: 15px; font-size: 11px; }
        .info span { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 10px; }
        th { background-color: #16a34a; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 15px; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 5px; }
        .summary p { margin: 3px 0; font-size: 11px; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN PENJUALAN</h1>
        <p>Bank Sampah TRASHURE</p>
    </div>
    <div class="info">
        <p>Periode: <span>{{ $dari }} - {{ $sampai }}</span></p>
        <p>Dicetak: <span>{{ now()->format('d M Y H:i') }}</span></p>
    </div>
    <table>
        <thead>
            <tr>
                <th>No. Transaksi</th>
                <th>Tanggal</th>
                <th>Pengepul</th>
                <th>Media</th>
                <th>Metode</th>
                <th>Jenis Sampah</th>
                <th>Total Berat</th>
                <th>Total Harga</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $item)
            @php
                $totalBerat = $item->detailPenjualan->sum('jumlah_terjual');
            @endphp
            <tr>
                <td>PJL-{{ str_pad($item->penjualan_id, 4, '0', STR_PAD_LEFT) }}</td>
                <td>{{ $item->tanggal_transaksi->format('d/m/Y') }}</td>
                <td>{{ $item->pengepul->nama_pengepul ?? '-' }}</td>
                <td>{{ $item->media_konfirmasi ?? '-' }}</td>
                <td>{{ $item->metode_transaksi ?? '-' }}</td>
                <td>{{ $item->detailPenjualan->pluck('jenisSampah.nama_jenis_sampah')->implode(', ') ?: '-' }}</td>
                <td>{{ number_format($totalBerat, 1, ',', '.') }} kg</td>
                <td>Rp {{ number_format($item->total_penjualan, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center;">Tidak ada data</td>
            </tr>
            @endforelse
        </tbody>
    </table>
    <div class="summary">
        <p><strong>Total Transaksi:</strong> {{ $data->count() }}</p>
        <p><strong>Total Berat:</strong> {{ number_format($data->sum(fn($item) => $item->detailPenjualan->sum('jumlah_terjual')), 1, ',', '.') }} kg</p>
        <p><strong>Total Penjualan:</strong> Rp {{ number_format($totalPenjualan, 0, ',', '.') }}</p>
    </div>
    <div class="footer">
        <p>Dokumen ini digenerate otomatis oleh sistem TRASHURE</p>
    </div>
</body>
</html>
