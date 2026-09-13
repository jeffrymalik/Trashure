# Trashure Models v1.1

Model Eloquent dibuat mengikuti ERD Trashure FINAL v1.1.

## Isi
20 model:
User, Admin, Warga, Petugas, Pengepul,
JenisSampah, HargaSampah, Voucher,
PengajuanPenjemputan, DetailPengajuanSampah, JadwalPenjemputan,
TransaksiSetoran, DetailSetoran, PoinSementara, SaldoPoin,
StokSementara, StokSampah,
TransaksiPenjualan, DetailPenjualan, PenukaranPoin.

## Catatan
- Model memakai `$table` dan `$primaryKey` eksplisit karena nama tabel/PK mengikuti ERD.
- Relasi memakai FK yang sama dengan ERD.
- `users` memakai `email` dan `username` sebagai field akun.
- `role` saat ini bertipe ENUM di database. Model sengaja tidak memakai PHP Enum agar perubahan database role tidak memaksa perubahan model.
- `password` memakai cast `hashed` Laravel.
- Sanctum/HasApiTokens belum ditambahkan; itu masuk tahap authentication setelah model + seeder selesai.
