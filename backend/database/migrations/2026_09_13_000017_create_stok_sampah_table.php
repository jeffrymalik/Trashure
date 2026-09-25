<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stok_sampah', function (Blueprint $table) {
            $table->id('stok_id');
            $table->foreignId('jenis_sampah_id')->unique()->constrained('jenis_sampah', 'jenis_sampah_id')->restrictOnDelete();
            $table->decimal('jumlah_stok', 12, 2)->default(0);
            $table->string('satuan', 20)->default('kg');
            $table->dateTime('terakhir_diperbarui')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stok_sampah');
    }
};
