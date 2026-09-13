<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stok_sementara', function (Blueprint $table) {
            $table->id('stok_sementara_id');
            $table->foreignId('setoran_id')->constrained('transaksi_setoran', 'setoran_id')->cascadeOnDelete();
            $table->foreignId('jenis_sampah_id')->constrained('jenis_sampah', 'jenis_sampah_id')->restrictOnDelete();
            $table->decimal('jumlah_stok', 12, 2);
            $table->string('satuan', 20)->default('kg');
            $table->string('status_stok', 30)->default('menunggu');
            $table->foreignId('validator_admin_id')->nullable()->constrained('admin', 'admin_id')->nullOnDelete();
            $table->dateTime('tanggal_validasi')->nullable();
            $table->text('catatan_validasi')->nullable();
            $table->timestamps();

            $table->index('setoran_id');
            $table->index('jenis_sampah_id');
            $table->index('validator_admin_id');
            $table->index('status_stok');
            $table->index(['jenis_sampah_id', 'status_stok']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stok_sementara');
    }
};
