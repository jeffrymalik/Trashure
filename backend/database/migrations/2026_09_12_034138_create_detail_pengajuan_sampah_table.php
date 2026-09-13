<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detail_pengajuan_sampah', function (Blueprint $table) {
            $table->id('detail_pengajuan_id');
            $table->foreignId('pengajuan_id')->constrained('pengajuan_penjemputan', 'pengajuan_id')->cascadeOnDelete();
            $table->foreignId('jenis_sampah_id')->constrained('jenis_sampah', 'jenis_sampah_id')->restrictOnDelete();
            $table->decimal('perkiraan_berat', 12, 2);
            $table->timestamps();

            $table->index('pengajuan_id');
            $table->index('jenis_sampah_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_pengajuan_sampah');
    }
};
