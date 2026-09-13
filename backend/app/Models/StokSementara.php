<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokSementara extends Model
{
    use HasFactory;

    protected $table = 'stok_sementara';
    protected $primaryKey = 'stok_sementara_id';

    protected $fillable = [
        'setoran_id',
        'jenis_sampah_id',
        'jumlah_stok',
        'satuan',
        'status_stok',
        'validator_admin_id',
        'tanggal_validasi',
        'catatan_validasi',
    ];

    protected function casts(): array
    {
        return [
            'jumlah_stok' => 'decimal:2',
            'tanggal_validasi' => 'datetime',
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

    public function validatorAdmin()
    {
        return $this->belongsTo(Admin::class, 'validator_admin_id', 'admin_id');
    }
}
