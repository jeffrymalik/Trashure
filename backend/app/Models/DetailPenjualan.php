<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPenjualan extends Model
{
    use HasFactory;

    protected $table = 'detail_penjualan';
    protected $primaryKey = 'detail_penjualan_id';

    protected $fillable = [
        'penjualan_id',
        'jenis_sampah_id',
        'jumlah_terjual',
        'harga_satuan',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'jumlah_terjual' => 'decimal:2',
            'harga_satuan' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    public function transaksiPenjualan()
    {
        return $this->belongsTo(TransaksiPenjualan::class, 'penjualan_id', 'penjualan_id');
    }

    public function jenisSampah()
    {
        return $this->belongsTo(JenisSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }
}
