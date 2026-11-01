# 🚀 Panduan Setup Environment Variables di Vercel

Jika Anda sudah deploy ke Vercel tapi database Supabase tidak berfungsi, ikuti panduan ini.

## ❓ Masalah

- File `.env` tidak ter-upload ke repository (aman untuk security ✅)
- Vercel tidak tahu nilai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Aplikasi tidak bisa connect ke Supabase database
- Error: "Supabase connection failed" atau console menunjukkan undefined values

## ✅ Solusi: Setup di Vercel Dashboard

### Langkah 1: Buka Vercel Project Settings

1. Masuk ke https://vercel.com
2. Klik project **Memoria** (atau nama project Anda)
3. Klik tab **Settings** di sidebar kiri

![Vercel Settings Tab]

### Langkah 2: Navigasi ke Environment Variables

Cari dan klik **Environment Variables** di menu Settings

![Environment Variables Menu]

### Langkah 3: Tambahkan Variable Pertama

Klik tombol **Add New** (atau **Add Environment Variable**)

**Isi form pertama:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://wiqzvucwaqzetweqveqq.supabase.co
Environment: Production, Preview, Development (pilih semua 3)
```

Klik **Save**

### Langkah 4: Tambahkan Variable Kedua

Klik **Add New** lagi

**Isi form kedua:**
```
Name: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcXp2dWN3YXF6ZXR3ZXF2ZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTg0MTgsImV4cCI6MjEwODkzNDQxOH0.fq354YwS7AJ5NLCIrmRnHkxKEXDMNnXrlmXRE_cqYMs
Environment: Production, Preview, Development (pilih semua 3)
```

Klik **Save**

### Langkah 5: Redeploy Project

1. Klik tab **Deployments** di sidebar
2. Cari deployment terakhir (paling atas dalam list)
3. Klik **...** (menu tiga titik) di sebelah deployment
4. Pilih **Redeploy**
5. Di popup, klik **Redeploy** lagi untuk confirm

**ATAU** push commit baru ke git:
```bash
git add .
git commit -m "chore: trigger redeployment"
git push
```

### Langkah 6: Tunggu Deploy Selesai

Tunggu sampai status deployment berubah dari "Building" → "Ready"

Biasanya memakan waktu 1-2 menit.

### Langkah 7: Test Website

1. Buka URL Vercel project Anda
2. Buka Browser Developer Console (F12)
3. Cek apakah error Supabase masih ada
4. Coba buat atau edit album baru

Jika berhasil, database Supabase sekarang sudah terhubung! 🎉

---

## 🖥️ Alternatif: Menggunakan Vercel CLI

Jika lebih prefer command line:

```bash
# 1. Install Vercel CLI (kalau belum)
npm install -g vercel

# 2. Login ke Vercel
vercel login

# 3. Masuk ke project directory
cd "c:\Users\Lenovo\Documents\Project"

# 4. Set environment variable pertama
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Akan muncul prompt, masukkan:
# https://wiqzvucwaqzetweqveqq.supabase.co

# 5. Set environment variable kedua
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# Akan muncul prompt, masukkan:
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcXp2dWN3YXF6ZXR3ZXF2ZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTg0MTgsImV4cCI6MjEwODkzNDQxOH0.fq354YwS7AJ5NLCIrmRnHkxKEXDMNnXrlmXRE_cqYMs

# 6. Deploy ulang dengan environment variables
vercel --prod

# 7. Tunggu hingga selesai
```

---

## 🔍 Debugging: Verifikasi Variables Sudah Ter-set

Setelah redeploy, verifikasi bahwa variables sudah benar:

1. Klik deployment di Vercel → tab **Logs**
2. Cari log yang menunjukkan environment variables
3. Atau buka DevTools → Console di website yang sudah live
4. Cek apakah `window.location` atau network request sudah ke Supabase dengan benar

Jika masih error, cek:
- ✅ Apakah value sudah benar (tidak ada space di awal/akhir)?
- ✅ Apakah sudah pilih "Production" environment?
- ✅ Apakah sudah klik **Redeploy**?
- ✅ Apakah sudah clear browser cache (Ctrl+Shift+Delete)?

---

## 📌 Tips Penting

### Jangan Commit .env ke Git
```bash
# File .env sudah di .gitignore - ini BENAR!
# Jangan hapus .gitignore entry untuk .env
```

### Jangan Share Public Key di Public Repository
```bash
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY adalah "public" key
# Tapi masih harus protect di environment variables
# Ini berbeda dengan private key/service role key
```

### Untuk Private Keys (Service Role)
```bash
# Jika butuh private key (service role) di future:
# JANGAN prefix dengan NEXT_PUBLIC_
# Contoh: SUPABASE_SERVICE_ROLE_KEY=...
# Ini hanya bisa diakses di backend, tidak expose ke client
```

---

## ✨ Selesai!

Sekarang website Anda di Vercel sudah bisa connect ke Supabase database! 🎉

Jika ada masalah, cek:
- Browser DevTools Console untuk error messages
- Vercel Project Logs untuk build errors
- Supabase Project → Logs untuk database errors
