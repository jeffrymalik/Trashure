<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokSampah extends Model
{
    use HasFactory;

    protected $table = 'stok_sampah';
    protected $primaryKey = 'stok_id';

    protected $fillable = [
        'jenis_sampah_id',
        'jumlah_stok',
        'satuan',
        'terakhir_diperbarui',
    ];

    protected function casts(): array
    {
        return [
            'jumlah_stok' => 'decimal:2',
            'terakhir_diperbarui' => 'datetime',
        ];
    }

    public function jenisSampah()
    {
        return $this->belongsTo(JenisSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }
}
