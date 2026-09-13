<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalPenjemputan extends Model
{
    use HasFactory;

    protected $table = 'jadwal_penjemputan';
    protected $primaryKey = 'jadwal_id';

    protected $fillable = [
        'pengajuan_id',
        'admin_id',
        'petugas_id',
        'tanggal_penjemputan',
        'waktu_penjemputan',
        'status_jadwal',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_penjemputan' => 'date',
        ];
    }

    public function pengajuanPenjemputan()
    {
        return $this->belongsTo(PengajuanPenjemputan::class, 'pengajuan_id', 'pengajuan_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id', 'admin_id');
    }

    public function petugas()
    {
        return $this->belongsTo(Petugas::class, 'petugas_id', 'petugas_id');
    }

    public function transaksiSetoran()
    {
        return $this->hasOne(TransaksiSetoran::class, 'jadwal_id', 'jadwal_id');
    }
}
