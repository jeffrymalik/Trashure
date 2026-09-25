<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jenis_sampah', function (Blueprint $table) {
            $table->id('jenis_sampah_id');
            $table->string('nama_jenis_sampah', 100)->unique();
            $table->string('satuan', 20)->default('kg');
            $table->text('keterangan')->nullable();
            $table->string('status', 20)->default('aktif');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jenis_sampah');
    }
};
