# Trashure Backend

API RESTful untuk aplikasi Trashure, dibangun dengan Laravel 12.

## Persiapan

- PHP 8.2+
- Composer
- Database (MySQL/SQLite)

## Instalasi

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install && npm run build
```

## Menjalankan

```bash
composer dev
```

Jalankan server, queue worker, logs, dan Vite secara bersamaan.

## API Documentation

Dokumentasi API tersedia melalui Swagger UI setelah server berjalan:

```
http://localhost:8000/api/documentation
```

Menggunakan paket `darkaonline/l5-swagger`.

## Testing

```bash
composer test
```

## Tech Stack

- Laravel 12
- Laravel Sanctum (autentikasi)
- L5 Swagger (dokumentasi API)
