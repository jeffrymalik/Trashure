<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Stok Sampah</title>
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
        <h1>LAPORAN STOK SAMPAH</h1>
        <p>Bank Sampah TRASHURE</p>
    </div>
    <div class="info">
        <p>Tanggal: <span>{{ $tanggal }}</span></p>
    </div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Jenis Sampah</th>
                <th>Jumlah Stok (kg)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $item)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $item->jenisSampah->nama_jenis_sampah ?? '-' }}</td>
                <td>{{ number_format($item->jumlah_stok, 2, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="3" style="text-align:center;">Tidak ada data</td>
            </tr>
            @endforelse
        </tbody>
    </table>
    <div class="summary">
        <p><strong>Total Stok:</strong> {{ number_format($totalStok, 2, ',', '.') }} kg</p>
    </div>
    <div class="footer">
        <p>Dokumen ini digenerate otomatis oleh sistem TRASHURE</p>
    </div>
</body>
</html>
