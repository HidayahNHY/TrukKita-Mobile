# TrukKita-Mobile 🚚

Aplikasi mobile berbasis **React Native & Expo Router** untuk layanan pemesanan dan pemantauan armada truk logistik. Proyek ini mengimplementasikan seluruh standar pembelajaran **Modul 4: Database & Autentikasi** (Praktikum Pemrograman Mobile).

---

## 👥 Tim Pengembang & Distribusi Kontribusi

| Nama Anggota | GitHub Username | Email | Bagian Tugas Modul 4 |
| :--- | :--- | :--- | :--- |
| **Muhammad Yoga Adra Assajad** | [`clownr007`](https://github.com/clownr007) | `muhammadyogaadraassajad@gmail.com` | Global `AuthContext`, Antarmuka Autentikasi (`auth.tsx`), CRUD Riwayat Cloud & Optimistic UI (`riwayat.tsx`), Dokumentasi |
| **Hidayah Nurul Yakin** | [`HidayahNHY`](https://github.com/HidayahNHY) | `hidayahyamlean902@gmail.com` | Client Singleton Supabase (`supabase.ts`), Secure Storage Adapter (`authStorage.ts`), Skema Database & Kebijakan RLS (`schema.sql`), Route Protection Guard (`_layout.tsx`), Integrasi Pemesanan Cloud (`detail.tsx`) |

---

## 🎯 Kriteria Penilaian Modul 4

Aplikasi ini telah memenuhi seluruh kriteria penilaian tugas demo Modul 4:

1. **Secure Token Storage (5%)**
   - Menggunakan `expo-secure-store` pada Android/iOS untuk enkripsi token JWT di tingkat perangkat keras (*Keychain* di iOS dan *Keystore* di Android).
   - Dilengkapi fallback `localStorage` untuk lingkungan web.
   - Tersedia komponen demo interaktif Codelab 1 di menu Pengaturan (*Secure Vault Demo*).

2. **Supabase Auth Flow (10%)**
   - Alur autentikasi ganda: **Daftar Akun Baru (Sign Up)** dan **Masuk Akun (Sign In)**.
   - Pembersihan input formulir dengan `.trim()` untuk mencegah spasi tak terlihat.
   - Optimasi keyboard seluler: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoCorrect={false}`.
   - Penanganan status pemuatan (`ActivityIndicator`) dan penonaktifan tombol submit untuk mencegah *multiple submission*.
   - Notifikasi kesalahan (*error handling*) ramah pengguna tanpa *crash*.

3. **Global AuthContext & Real-Time Session (5%)**
   - Dikelola secara terpusat melalui `src/contexts/AuthContext.tsx`.
   - Rehidrasi sesi otomatis saat *startup* menggunakan `supabase.auth.getSession()`.
   - Berlangganan status perubahan sesi *real-time* via `supabase.auth.onAuthStateChange()`.

4. **Route Protection Guards (5%)**
   - Perimeter keamanan rute pada `src/app/_layout.tsx` menggunakan `Stack.Protected`.
   - Tamu belum terautentikasi otomatis dicegah dan dialihkan ke `/auth`.
   - Pengguna aktif yang berhasil login otomatis dialihkan ke layar utama aplikasi.
   - *Loading Shield* mencegah *layout flicker* saat memulihkan sesi.
   - Fitur *Keluar dari Akun* (Sign Out) yang otomatis mengunci kembali aplikasi.

5. **Cloud Database CRUD & Row Level Security / RLS (Assignment & Codelab 5)**
   - Tabel `public.orders` terhubung ke PostgreSQL Cloud (Supabase).
   - **CREATE (INSERT)**: Membuat pesanan truk langsung dari halaman Detail (`detail.tsx`).
   - **READ (SELECT)**: Menampilkan riwayat pesanan aktif dan lampau (`riwayat.tsx`).
   - **UPDATE**: Membatalkan pesanan dengan pembaruan instan (*Optimistic UI*).
   - **DELETE**: Menghapus riwayat pesanan dengan *Optimistic UI* dan *rollback handling*.
   - **Pull-to-Refresh**: Sinkronisasi data terkini dari server awan secara mulus.
   - **Row Level Security (RLS)**: Data pesanan diisolasi ketat menggunakan kebijakan `auth.uid() = user_id`. Pengguna A tidak dapat melihat, mengubah, atau menghapus pesanan milik Pengguna B.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (.env)
Salin berkas template lingkungan:
```bash
cp .env.example .env
```
Isi konfigurasi proyek Supabase Anda pada `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Catatan: Jika Supabase belum dikonfigurasi, aplikasi tetap dapat dijalankan dalam mode demo lokal tanpa error).*

### 3. Deploy Skema Database & RLS
Buka **SQL Editor** pada Dashboard Supabase Anda, salin skrip yang ada pada berkas `supabase/schema.sql`, lalu klik **Run**.

### 4. Menjalankan Aplikasi via Expo Go
```bash
npx expo start --go
```
Pindai kode QR menggunakan aplikasi **Expo Go** pada perangkat Android atau iOS Anda.

---

## 🧪 Skenario Pengujian Multi-Akun (Verifikasi Isolasi RLS)

Untuk membuktikan bahwa Keamanan Tingkat Baris (RLS) bekerja 100%:

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
