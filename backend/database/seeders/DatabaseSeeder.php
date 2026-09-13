<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            JenisSampahSeeder::class,
            HargaSampahSeeder::class,
            //belum cek
            VoucherSeeder::class,
            AdminSeeder::class,
            PetugasSeeder::class,
            WargaSeeder::class,
            PengepulSeeder::class,


        ]);
    }
}
