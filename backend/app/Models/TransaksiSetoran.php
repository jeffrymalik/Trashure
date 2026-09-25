<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiSetoran extends Model
{
    use HasFactory;

    protected $table = 'transaksi_setoran';
    protected $primaryKey = 'setoran_id';

    protected $fillable = [
        'pengajuan_id',
        'jadwal_id',
        'warga_id',
        'petugas_id',
        'validator_admin_id',
        'tanggal_setoran',
        'konfirmasi_pengambilan',
        'status_validasi',
        'catatan_validasi',
        'tanggal_validasi',
        'total_berat_aktual',
        'total_poin',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_setoran' => 'datetime',
            'tanggal_validasi' => 'datetime',
            'total_berat_aktual' => 'decimal:2',
        ];
    }

    public function pengajuanPenjemputan()
    {
        return $this->belongsTo(PengajuanPenjemputan::class, 'pengajuan_id', 'pengajuan_id');
    }

    public function jadwalPenjemputan()
    {
        return $this->belongsTo(JadwalPenjemputan::class, 'jadwal_id', 'jadwal_id');
    }

    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_id', 'warga_id');
    }

    public function petugas()
    {
        return $this->belongsTo(Petugas::class, 'petugas_id', 'petugas_id');
    }

    public function validatorAdmin()
    {
        return $this->belongsTo(Admin::class, 'validator_admin_id', 'admin_id');
    }

    public function detailSetoran()
    {
        return $this->hasMany(DetailSetoran::class, 'setoran_id', 'setoran_id');
    }
}
