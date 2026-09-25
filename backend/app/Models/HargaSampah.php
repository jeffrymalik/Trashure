<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HargaSampah extends Model
{
    use HasFactory;

    protected $table = 'harga_sampah';
    protected $primaryKey = 'harga_id';

    protected $fillable = [
        'jenis_sampah_id',
        'harga_per_satuan',
        'nilai_poin_per_satuan',
        'berlaku_mulai',
        'berlaku_selesai',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'harga_per_satuan' => 'decimal:2',
            'nilai_poin_per_satuan' => 'float',
            'berlaku_mulai' => 'date',
            'berlaku_selesai' => 'date',
        ];
    }

    public function jenisSampah()
    {
        return $this->belongsTo(JenisSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }
}
