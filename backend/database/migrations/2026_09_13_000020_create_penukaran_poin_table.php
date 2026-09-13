<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('penukaran_poin', function (Blueprint $table) {
            $table->id('penukaran_id');
            $table->foreignId('warga_id')->constrained('warga', 'warga_id')->restrictOnDelete();
            $table->foreignId('voucher_id')->constrained('voucher', 'voucher_id')->restrictOnDelete();
            $table->dateTime('tanggal_pengajuan');
            $table->dateTime('tanggal_proses')->nullable();
            $table->integer('poin_digunakan');
            $table->integer('saldo_sebelum');
            $table->integer('saldo_sesudah')->nullable();
            $table->string('status_penukaran', 30)->default('diajukan');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->index('warga_id');
            $table->index('voucher_id');
            $table->index('status_penukaran');
            $table->index('tanggal_pengajuan');
            $table->index(['warga_id', 'status_penukaran']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penukaran_poin');
    }
};
