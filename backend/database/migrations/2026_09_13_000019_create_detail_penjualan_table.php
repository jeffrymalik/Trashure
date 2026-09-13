<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detail_penjualan', function (Blueprint $table) {
            $table->id('detail_penjualan_id');
            $table->foreignId('penjualan_id')->constrained('transaksi_penjualan', 'penjualan_id')->cascadeOnDelete();
            $table->foreignId('jenis_sampah_id')->constrained('jenis_sampah', 'jenis_sampah_id')->restrictOnDelete();
            $table->decimal('jumlah_terjual', 12, 2);
            $table->decimal('harga_satuan', 12, 2);
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->timestamps();

            $table->index('penjualan_id');
            $table->index('jenis_sampah_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_penjualan');
    }
};
