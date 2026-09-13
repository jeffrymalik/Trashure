<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('voucher', function (Blueprint $table) {
            $table->id('voucher_id');
            $table->string('nama_voucher', 100);
            $table->text('deskripsi')->nullable();
            $table->integer('poin_dibutuhkan');
            $table->integer('jumlah_tersedia')->default(0);
            $table->string('status', 20)->default('tersedia');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher');
    }
};
