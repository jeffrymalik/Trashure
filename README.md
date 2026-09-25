# Trashure

Aplikasi pengelolaan sampah yang dibangun untuk APTIKOM Fest.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12, PHP 8.2+, Sanctum |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |

## Struktur Proyek

```
Trashure/
├── backend/   # API Laravel
├── frontend/  # Aplikasi Next.js
└── docs/      # Dokumentasi tambahan
```

## Persiapan

- PHP 8.2+
- Node.js 18+
- Composer

## Instalasi

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install && npm run build
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # jika ada
```

## Menjalankan

### Backend

```bash
cd backend
composer dev
```

### Frontend

```bash
cd frontend
npm run dev
```

Aplikasi frontend berjalan di http://localhost:3000 dan backend di http://localhost:8000.
