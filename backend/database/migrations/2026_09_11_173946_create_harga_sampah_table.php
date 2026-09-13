<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('harga_sampah', function (Blueprint $table) {
            $table->id('harga_id');
            $table->foreignId('jenis_sampah_id')->constrained('jenis_sampah', 'jenis_sampah_id')->restrictOnDelete();
            $table->decimal('harga_per_satuan', 12, 2);
            $table->integer('nilai_poin_per_satuan');
            $table->date('berlaku_mulai');
            $table->date('berlaku_selesai')->nullable();
            $table->string('status', 20)->default('aktif');
            $table->timestamps();

            $table->index('status');
            $table->index(['jenis_sampah_id', 'berlaku_mulai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('harga_sampah');
    }
};
