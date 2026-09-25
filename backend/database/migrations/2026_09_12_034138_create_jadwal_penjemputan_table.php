<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jadwal_penjemputan', function (Blueprint $table) {
            $table->id('jadwal_id');
            $table->foreignId('pengajuan_id')->unique()->constrained('pengajuan_penjemputan', 'pengajuan_id')->cascadeOnDelete();
            $table->foreignId('admin_id')->constrained('admin', 'admin_id')->restrictOnDelete();
            $table->foreignId('petugas_id')->constrained('petugas', 'petugas_id')->restrictOnDelete();
            $table->date('tanggal_penjemputan');
            $table->time('waktu_penjemputan');
            $table->string('status_jadwal', 30)->default('terjadwal');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('admin_id');
            $table->index('petugas_id');
            $table->index('tanggal_penjemputan');
            $table->index('status_jadwal');
            $table->index(['petugas_id', 'tanggal_penjemputan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_penjemputan');
    }
};
