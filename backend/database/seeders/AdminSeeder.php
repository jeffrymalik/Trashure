<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            [
                'email' => 'admin@trashure.test',
            ],
            [
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'aktif',
            ]
        );

        Admin::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'nama_admin' => 'Admin Trashure',
            ]
        );
    }
}