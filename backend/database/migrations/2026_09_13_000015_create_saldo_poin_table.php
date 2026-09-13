<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('saldo_poin', function (Blueprint $table) {
            $table->id('saldo_poin_id');
            $table->foreignId('warga_id')->unique()->constrained('warga', 'warga_id')->cascadeOnDelete();
            $table->integer('saldo_poin')->default(0);
            $table->dateTime('terakhir_diperbarui')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saldo_poin');
    }
};
