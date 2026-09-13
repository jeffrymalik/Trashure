<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transaksi_penjualan', function (Blueprint $table) {
            $table->id('penjualan_id');
            $table->foreignId('pengepul_id')->constrained('pengepul', 'pengepul_id')->restrictOnDelete();
            $table->foreignId('admin_id')->constrained('admin', 'admin_id')->restrictOnDelete();
            $table->dateTime('tanggal_transaksi');
            $table->decimal('total_penjualan', 14, 2)->default(0);
            $table->string('status_transaksi', 30)->default('diajukan');
            $table->string('media_konfirmasi', 30)->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('pengepul_id');
            $table->index('admin_id');
            $table->index('status_transaksi');
            $table->index('tanggal_transaksi');
            $table->index(['pengepul_id', 'status_transaksi']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_penjualan');
    }
};
