<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailSetoran extends Model
{
    use HasFactory;

    protected $table = 'detail_setoran';
    protected $primaryKey = 'detail_setoran_id';

    protected $fillable = [
        'setoran_id',
        'jenis_sampah_id',
        'berat_aktual',
        'harga_satuan',
        'nilai_poin_per_satuan',
        'poin',
    ];

    protected function casts(): array
    {
        return [
            'berat_aktual' => 'decimal:2',
            'harga_satuan' => 'decimal:2',
        ];
    }

    public function transaksiSetoran()
    {
        return $this->belongsTo(TransaksiSetoran::class, 'setoran_id', 'setoran_id');
    }

    public function jenisSampah()
    {
        return $this->belongsTo(JenisSampah::class, 'jenis_sampah_id', 'jenis_sampah_id');
    }
}
