<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $table = 'voucher';
    protected $primaryKey = 'voucher_id';

    protected $fillable = [
        'nama_voucher',
        'deskripsi',
        'poin_dibutuhkan',
        'jumlah_tersedia',
        'status',
    ];

    public function penukaranPoin()
    {
        return $this->hasMany(PenukaranPoin::class, 'voucher_id', 'voucher_id');
    }
}
