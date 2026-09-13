<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengepul extends Model
{
    use HasFactory;

    protected $table = 'pengepul';
    protected $primaryKey = 'pengepul_id';

    protected $fillable = [
        'user_id',
        'nama_pengepul',
        'alamat',
        'no_telepon',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function transaksiPenjualan()
    {
        return $this->hasMany(TransaksiPenjualan::class, 'pengepul_id', 'pengepul_id');
    }
}
