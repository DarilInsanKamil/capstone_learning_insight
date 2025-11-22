# 📋 Task List - Capstone Learning Insight Backend

Project ini dikerjakan oleh 2 orang. Pembagian tugas dibagi menjadi **Role A (Authentication & Core)** dan **Role B (AI & Insight)** agar pengerjaan bisa berjalan paralel.

## 🚀 Fase 1: Setup & Konfigurasi Awal (Joint / Bersama)
* [✔️] **Init Project**: Menjalankan `npm init` dan instalasi dependensi dasar (`@hapi/hapi`, `pg`, `dotenv`).
* [✔️] **Environment Variables**: Setup file `.env` (Database credentials, JWT Keys, Server Config).
* [✔️] **Server Setup**: Konfigurasi dasar Hapi server di `src/server.js`.
* [ ✔️] **Database Schema**: Pastikan koneksi PostgreSQL berjalan dan tabel raw data (`submissions`, `trackings`, `completions`, `users`) sudah tersedia.

---

## 👤 Role A: Authentication & User Management
**Fokus:** Mengamankan sistem, registrasi, dan login pengguna.

### 1. Service: Users & Auth
* [✔️] **Registration Logic**: Implementasi hashing password menggunakan `bcrypt` sebelum simpan ke DB.
* [✔️] **Login Logic**: Verifikasi email & password, lalu generate Access Token menggunakan `@hapi/jwt`.
* [✔️] **Validation**: Buat schema validasi `Joi` untuk payload Register dan Login.

### 2. Hapi Plugin: Authentication
* [✔️] **JWT Strategy**: Konfigurasi `server.auth.strategy` di `server.js` (validasi user dari token payload).
* [✔️] **Auth Routes**: Implementasi endpoint `POST /register` dan `POST /login`.

### 3. Security
* [ ] **Route Protection**: Pastikan endpoint sensitif (selain auth) dipasang konfigurasi `auth: 'jwt'`.

---

## 🧠 Role B: AI Integration & Insight Features
**Fokus:** Logika bisnis, pengolahan data, dan integrasi TensorFlow.

### 1. Database & Migration
* [ ] **Create Migration**: Buat file migrasi `create_table_user_ai_insights` menggunakan `node-pg-migrate`.
* [ ] **Run Migration**: Jalankan migrasi untuk membuat tabel di database lokal.

### 2. Service: Insight Logic
* [ ] **Data Fetching**: Implementasi SQL Query (CTE) untuk mengambil dan menghitung rata-rata data dari tabel `submissions`, `trackings`, dll.
* [ ] **Feature Extraction**: Buat fungsi helper untuk memformat raw data menjadi array fitur yang sesuai input model AI.

### 3. AI Model Integration
* [ ] **Model Loader**: Setup library `@tensorflow/tfjs-node` dan load file model (`model.json`) di service constructor.
* [ ] **Prediction Logic**: Implementasi fungsi `predict()` dan mapping hasil cluster (0, 1, 2) menjadi teks rekomendasi.

### 4. Insight API
* [ ] **Endpoints**: Implementasi route `POST /insight/generate` (Trigger AI) dan `GET /insight/{user_id}` (Read Result).

---

## 🔗 Fase 3: Integrasi & Finalisasi (Joint)
* [ ] **Error Handling**: Implementasi custom error handler (ClientError 4xx vs ServerError 5xx).
* [ ] **Integration Testing**: Test alur lengkap (Register -> Login -> Generate Insight -> Get Insight).
* [ ] **Deployment**: Deploy aplikasi ke Cloud Server (GCP/AWS) dan konfigurasi environment production.