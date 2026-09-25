<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenukaranPoin extends Model
{
    use HasFactory;

    protected $table = 'penukaran_poin';
    protected $primaryKey = 'penukaran_id';

    protected $fillable = [
        'warga_id',
        'voucher_id',
        'tanggal_pengajuan',
        'tanggal_proses',
        'poin_digunakan',
        'saldo_sebelum',
        'saldo_sesudah',
        'status_penukaran',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pengajuan' => 'datetime',
            'tanggal_proses' => 'datetime',
        ];
    }

    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_id', 'warga_id');
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'voucher_id', 'voucher_id');
    }
}
