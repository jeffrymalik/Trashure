<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiPenjualan extends Model
{
    use HasFactory;

    protected $table = 'transaksi_penjualan';
    protected $primaryKey = 'penjualan_id';

    protected $fillable = [
        'pengepul_id',
        'admin_id',
        'tanggal_transaksi',
        'total_penjualan',
        'status_transaksi',
        'media_konfirmasi',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_transaksi' => 'datetime',
            'total_penjualan' => 'decimal:2',
        ];
    }

    public function pengepul()
    {
        return $this->belongsTo(Pengepul::class, 'pengepul_id', 'pengepul_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id', 'admin_id');
    }

    public function detailPenjualan()
    {
        return $this->hasMany(DetailPenjualan::class, 'penjualan_id', 'penjualan_id');
    }
}
