<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PoinSementara extends Model
{
    use HasFactory;

    protected $table = 'poin_sementara';
    protected $primaryKey = 'poin_sementara_id';

    protected $fillable = [
        'setoran_id',
        'warga_id',
        'jumlah_poin',
        'status_poin',
        'validator_admin_id',
        'tanggal_validasi',
        'catatan_validasi',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_validasi' => 'datetime',
        ];
    }

    public function transaksiSetoran()
    {
        return $this->belongsTo(TransaksiSetoran::class, 'setoran_id', 'setoran_id');
    }

    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_id', 'warga_id');
    }

    public function validatorAdmin()
    {
        return $this->belongsTo(Admin::class, 'validator_admin_id', 'admin_id');
    }
}
