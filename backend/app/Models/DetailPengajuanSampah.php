<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPengajuanSampah extends Model
{
    use HasFactory;

    protected $table = 'detail_pengajuan_sampah';
    protected $primaryKey = 'detail_pengajuan_id';

    protected $fillable = [
        'pengajuan_id',
        'jenis_sampah_id',
        'perkiraan_berat',
    ];

    protected function casts(): array
    {
        return [
            'perkiraan_berat' => 'decimal:2',
        ];
    }

    public function pengajuanPenjemputan()
    {
        return $this->belongsTo(PengajuanPenjemputan::class, 'pengajuan_id', 'pengajuan_id');
    }

    public function jenisSampah()
    {
        return $this->belongsTo(JenisSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }
}
