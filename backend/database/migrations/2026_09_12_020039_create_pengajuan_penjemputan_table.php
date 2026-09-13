<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pengajuan_penjemputan', function (Blueprint $table) {
            $table->id('pengajuan_id');
            $table->foreignId('warga_id')->constrained('warga', 'warga_id')->restrictOnDelete();
            $table->dateTime('tanggal_pengajuan');
            $table->text('alamat_penjemputan');
            $table->decimal('perkiraan_total_berat', 12, 2);
            $table->text('catatan')->nullable();
            $table->string('status_pengajuan', 30)->default('diajukan');
            $table->timestamps();

            $table->index('warga_id');
            $table->index('status_pengajuan');
            $table->index('tanggal_pengajuan');
            $table->index(['warga_id', 'status_pengajuan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_penjemputan');
    }
};
