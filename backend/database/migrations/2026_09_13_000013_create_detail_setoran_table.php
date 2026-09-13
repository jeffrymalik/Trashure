<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detail_setoran', function (Blueprint $table) {
            $table->id('detail_setoran_id');
            $table->foreignId('setoran_id')->constrained('transaksi_setoran', 'setoran_id')->cascadeOnDelete();
            $table->foreignId('jenis_sampah_id')->constrained('jenis_sampah', 'jenis_sampah_id')->restrictOnDelete();
            $table->decimal('berat_aktual', 12, 2);
            $table->decimal('harga_satuan', 12, 2);
            $table->integer('nilai_poin_per_satuan');
            $table->integer('poin_sementara')->default(0);
            $table->timestamps();

            $table->index('setoran_id');
            $table->index('jenis_sampah_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_setoran');
    }
};
