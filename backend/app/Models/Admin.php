<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $table = 'admin';
    protected $primaryKey = 'admin_id';

    protected $fillable = [
        'user_id',
        'nama_admin',
        'no_telepon',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function jadwalPenjemputan()
    {
        return $this->hasMany(JadwalPenjemputan::class, 'admin_id', 'admin_id');
    }

    public function transaksiSetoranValidasi()
    {
        return $this->hasMany(TransaksiSetoran::class, 'validator_admin_id', 'admin_id');
    }

    public function transaksiPenjualan()
    {
        return $this->hasMany(TransaksiPenjualan::class, 'admin_id', 'admin_id');
    }
}
