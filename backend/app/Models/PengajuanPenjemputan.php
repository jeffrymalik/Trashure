<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanPenjemputan extends Model
{
    use HasFactory;

    protected $table = 'pengajuan_penjemputan';
    protected $primaryKey = 'pengajuan_id';

    protected $fillable = [
        'warga_id',
        'tanggal_pengajuan',
        'alamat_penjemputan',
        'perkiraan_total_berat',
        'catatan',
        'status_pengajuan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pengajuan' => 'datetime',
            'perkiraan_total_berat' => 'decimal:2',
        ];
    }

    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_id', 'warga_id');
    }

    public function detailPengajuanSampah()
    {
        return $this->hasMany(DetailPengajuanSampah::class, 'pengajuan_id', 'pengajuan_id');
    }

    public function jadwalPenjemputan()
    {
        return $this->hasOne(JadwalPenjemputan::class, 'pengajuan_id', 'pengajuan_id');
    }

    public function transaksiSetoran()
    {
        return $this->hasOne(TransaksiSetoran::class, 'pengajuan_id', 'pengajuan_id');
    }
}
