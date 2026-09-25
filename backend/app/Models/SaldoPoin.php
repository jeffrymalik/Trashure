<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaldoPoin extends Model
{
    use HasFactory;

    protected $table = 'saldo_poin';
    protected $primaryKey = 'saldo_poin_id';

    protected $fillable = [
        'warga_id',
        'saldo_poin',
        'terakhir_diperbarui',
    ];

    protected function casts(): array
    {
        return [
            'terakhir_diperbarui' => 'datetime',
        ];
    }

    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_id', 'warga_id');
    }
}
