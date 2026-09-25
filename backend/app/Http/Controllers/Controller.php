<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Trashure API Documentation",
    description: "Dokumentasi RESTful API untuk Sistem Pengelolaan Sampah dan Penjemputan Trashure."
)]
#[OA\Server(
    url: "/api",
    description: "Trashure API Base URL"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Gunakan token Bearer dari endpoint /api/login untuk mengakses endpoint yang dilindungi."
)]
#[OA\Tag(name: "Auth", description: "Otentikasi & Profil Pengguna")]
#[OA\Tag(name: "Admin - Pengajuan", description: "Pengelolaan Pengajuan Penjemputan oleh Admin")]
#[OA\Tag(name: "Admin - Harga Sampah", description: "Pengelolaan Harga & Poin Sampah oleh Admin")]
#[OA\Tag(name: "Admin - Jadwal", description: "Monitoring Jadwal Penjemputan oleh Admin")]
#[OA\Tag(name: "Petugas - Jadwal", description: "Operasional Jadwal Penjemputan oleh Petugas")]
#[OA\Tag(name: "Petugas - Setoran", description: "Pencatatan & Validasi Setoran Sampah oleh Petugas")]
#[OA\Tag(name: "Warga - Jenis Sampah", description: "Informasi Katalog Jenis Sampah untuk Warga")]
#[OA\Tag(name: "Warga - Pengajuan", description: "Pengajuan Penjemputan Sampah oleh Warga")]
#[OA\Tag(name: "Warga - Setoran", description: "Riwayat & Detail Setoran Sampah oleh Warga")]
#[OA\Tag(name: "Pengepul - Stok Sampah", description: "Katalog & Detail Stok Sampah Tersedia untuk Pengepul")]
#[OA\Tag(name: "Admin - Warga", description: "CRUD Data Warga oleh Admin")]
abstract class Controller
{
    //
}
