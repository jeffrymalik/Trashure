<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Petugas extends Model
{
    use HasFactory;

    protected $table = 'petugas';
    protected $primaryKey = 'petugas_id';

    protected $fillable = [
        'user_id',
        'nama_petugas',
        'jenis_kelamin',
        'alamat',
        'no_telepon',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function jadwalPenjemputan()
    {
        return $this->hasMany(JadwalPenjemputan::class, 'petugas_id', 'petugas_id');
    }

    public function transaksiSetoran()
    {
        return $this->hasMany(TransaksiSetoran::class, 'petugas_id', 'petugas_id');
    }

    public function validasiSetoran()
    {
        return $this->hasMany(TransaksiSetoran::class, 'validator_petugas_id', 'petugas_id');
    }
}
