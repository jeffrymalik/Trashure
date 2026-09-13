<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('poin_sementara', function (Blueprint $table) {
            $table->id('poin_sementara_id');
            $table->foreignId('setoran_id')->unique()->constrained('transaksi_setoran', 'setoran_id')->cascadeOnDelete();
            $table->foreignId('warga_id')->constrained('warga', 'warga_id')->restrictOnDelete();
            $table->integer('jumlah_poin')->default(0);
            $table->string('status_poin', 30)->default('menunggu');
            $table->foreignId('validator_admin_id')->nullable()->constrained('admin', 'admin_id')->nullOnDelete();
            $table->dateTime('tanggal_validasi')->nullable();
            $table->text('catatan_validasi')->nullable();
            $table->timestamps();

            $table->index('warga_id');
            $table->index('validator_admin_id');
            $table->index('status_poin');
            $table->index(['warga_id', 'status_poin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('poin_sementara');
    }
};
