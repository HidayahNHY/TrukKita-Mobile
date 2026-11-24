# TrukKita-Mobile 🚚

Aplikasi mobile berbasis **React Native & Expo Router** untuk layanan pemesanan dan pemantauan armada truk logistik terintegrasi dengan basis data cloud dan autentikasi aman.

---

## 👥 Tim Pengembang

| Nama Anggota | GitHub Username | Email |
| :--- | :--- | :--- |
| **Muhammad Yoga Adra Assajad** | [`clownr007`](https://github.com/clownr007) | `muhammadyogaadraassajad@gmail.com` |
| **Hidayah Nurul Yakin** | [`HidayahNHY`](https://github.com/HidayahNHY) | `hidayahyamlean902@gmail.com` |

---

## ✨ Fitur Utama

- **Penyimpanan Kredensial Aman**: Enkripsi token sesi menggunakan `expo-secure-store` pada penyimpanan perangkat keras (*Keychain* di iOS dan *Keystore* di Android) dengan fallback web.
- **Autentikasi Pengguna**: Alur masuk (Sign In), pendaftaran (Sign Up), dan keluar akun (Sign Out) terintegrasi dengan Supabase Auth.
- **Status Sesi Global**: Pengelolaan sesi terpusat dengan pemulihan otomatis saat aplikasi dibuka dan sinkronisasi status secara *real-time*.
- **Proteksi Rute Navigasi**: Perlindungan rute menggunakan Expo Router sehingga area pemesanan dan riwayat hanya dapat diakses oleh pengguna terautentikasi.
- **Basis Data Cloud & Isolasi Data**: Pemesanan armada tersimpan di PostgreSQL Supabase dengan Row Level Security (RLS), dilengkapi *pull-to-refresh* dan *optimistic UI*.
- **Pemantauan Rute & Pengiriman**: Estimasi waktu dan jarak tempuh armada logistik secara interaktif.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (.env)

EXPO_PUBLIC_SUPABASE_URL= url key
EXPO_PUBLIC_SUPABASE_ANON_KEY= anon key

### 3. Deploy Skema Database & RLS
Buka **SQL Editor** pada Dashboard Supabase Anda, salin skrip yang ada pada berkas `supabase/schema.sql`, lalu klik **Run**.

### 4. Menjalankan Aplikasi via Expo Go
```bash
npx expo start --go
```
Pindai kode QR menggunakan aplikasi **Expo Go** pada perangkat Android atau iOS Anda.

---

## 🧪 Skenario Pengujian Multi-Akun (Verifikasi Isolasi Data)

Untuk memastikan isolasi data antar pengguna berjalan dengan benar:

1. **Uji Akun Pertama (User A):**
   - Buka aplikasi, daftar akun baru (misal: `driver1@trukkita.com`).
   - Pesan armada truk (misal: *Colt Diesel*).
   - Buka halaman **Riwayat Pesanan**, amati pesanan muncul di daftar.
2. **Uji Pengalihan & Logout:**
   - Buka menu Pengaturan (ikon ⚙️ di pojok kanan atas).
   - Ketuk **Keluar dari akun**. Aplikasi otomatis mengunci kembali dan mengarahkan ke layar masuk.
3. **Uji Isolasi Akun Kedua (User B):**
   - Daftar akun baru kedua (misal: `driver2@trukkita.com`).
   - Masuk ke aplikasi dan periksa halaman **Riwayat Pesanan**.
   - **Hasil**: Daftar pesanan kosong (*Array nol*)! Data milik User A tidak bocor ke User B.
   - Buat pesanan baru untuk User B (misal: *Tronton*).
4. **Verifikasi Silang:**
   - Logout dari User B dan login kembali ke User A (`driver1@trukkita.com`).
   - Daftar pesanan User A tetap utuh dan terisolasi.
