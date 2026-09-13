<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warga extends Model
{
    use HasFactory;

    protected $table = 'warga';
    protected $primaryKey = 'warga_id';

    protected $fillable = [
        'user_id',
        'nik',
        'nama_warga',
        'jenis_kelamin',
        'alamat',
        'no_telepon',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function pengajuanPenjemputan()
    {
        return $this->hasMany(PengajuanPenjemputan::class, 'warga_id', 'warga_id');
    }

    public function transaksiSetoran()
    {
        return $this->hasMany(TransaksiSetoran::class, 'warga_id', 'warga_id');
    }

    public function poinSementara()
    {
        return $this->hasMany(PoinSementara::class, 'warga_id', 'warga_id');
    }

    public function saldoPoin()
    {
        return $this->hasOne(SaldoPoin::class, 'warga_id', 'warga_id');
    }

    public function penukaranPoin()
    {
        return $this->hasMany(PenukaranPoin::class, 'warga_id', 'warga_id');
    }
}
