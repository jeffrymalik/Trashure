<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisSampah extends Model
{
    use HasFactory;

    protected $table = 'jenis_sampah';
    protected $primaryKey = 'jenis_sampah_id';

    protected $fillable = [
        'nama_jenis_sampah',
        'kategori',
        'satuan',
        'keterangan',
        'icon',
        'status',
    ];

    public function hargaSampah()
    {
        return $this->hasMany(HargaSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }

    public function hargaAktif()
    {
        return $this->hasOne(HargaSampah::class, 'jenis_sampah_id', 'jenis_sampah_id')
            ->where('status', 'aktif')
            ->latest('berlaku_mulai');
    }

    public function detailPengajuanSampah()
    {
        return $this->hasMany(DetailPengajuanSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }

    public function detailSetoran()
    {
        return $this->hasMany(DetailSetoran::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }

    public function stokSampah()
    {
        return $this->hasOne(StokSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }

    public function detailPenjualan()
    {
        return $this->hasMany(DetailPenjualan::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }
}
