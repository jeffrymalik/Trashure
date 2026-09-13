<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transaksi_setoran', function (Blueprint $table) {
            $table->id('setoran_id');
            $table->foreignId('pengajuan_id')->unique()->constrained('pengajuan_penjemputan', 'pengajuan_id')->restrictOnDelete();
            $table->foreignId('jadwal_id')->unique()->constrained('jadwal_penjemputan', 'jadwal_id')->restrictOnDelete();
            $table->foreignId('warga_id')->constrained('warga', 'warga_id')->restrictOnDelete();
            $table->foreignId('petugas_id')->constrained('petugas', 'petugas_id')->restrictOnDelete();
            $table->foreignId('validator_petugas_id')->nullable()->constrained('petugas', 'petugas_id')->nullOnDelete();
            $table->dateTime('tanggal_setoran');
            $table->string('konfirmasi_pengambilan', 20);
            $table->string('status_validasi', 30)->default('menunggu');
            $table->text('catatan_validasi')->nullable();
            $table->dateTime('tanggal_validasi')->nullable();
            $table->decimal('total_berat_aktual', 12, 2);
            $table->integer('total_poin_sementara')->default(0);
            $table->timestamps();

            $table->index('warga_id');
            $table->index('petugas_id');
            $table->index('validator_petugas_id');
            $table->index('status_validasi');
            $table->index('tanggal_setoran');
            $table->index(['warga_id', 'status_validasi']);
            $table->index(['petugas_id', 'status_validasi']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_setoran');
    }
};
