# 🔧 Troubleshooting Guide - Supabase Connection Issues

Panduan ini membantu Anda mengatasi masalah koneksi Supabase di development dan production.

---

## 🆘 Masalah Umum & Solusi

### 1. ❌ "Supabase connection failed" di Production (Vercel)

**Penyebab:** Environment variables tidak ter-set di Vercel

**Solusi:**
1. Buka Vercel Dashboard → Project Settings → Environment Variables
2. Pastikan 2 variables sudah ada:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Klik **Redeploy** di Deployments tab
4. Clear browser cache (Ctrl+Shift+Delete)
5. Refresh halaman

**Lihat:** `VERCEL_DEPLOYMENT_GUIDE.md` untuk langkah detail

---

### 2. ❌ "Cannot read properties of undefined"

**Penyebab:** Environment variables undefined di build time atau runtime

**Cek:**

**Development (Local):**
```bash
# 1. Buka file .env
cat .env

# 2. Verifikasi tidak ada space di awal/akhir
# BENAR:
# NEXT_PUBLIC_SUPABASE_URL=https://...

# SALAH:
# NEXT_PUBLIC_SUPABASE_URL= https://...  (ada space)
```

**Production (Vercel):**
```bash
# 1. Buka Vercel Dashboard
# 2. Settings → Environment Variables
# 3. Klik setiap variable dan copy-paste ulang value
# 4. Pastikan tidak ada invisible characters
# 5. Redeploy
```

---

### 3. ❌ Database tidak bisa save/read data

**Penyebab:** Supabase connection berhasil, tapi Row Level Security (RLS) blocking access

**Solusi:**

1. Buka Supabase Dashboard → https://supabase.com
2. Login ke project Anda
3. Klik **SQL Editor** → buat query baru
4. Jalankan untuk cek RLS:

```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public';
```

**Jika ada masalah RLS:**
- Temporary: Disable RLS untuk testing (⚠️ hanya dev!)
- Proper: Setup RLS policies yang benar
- Lihat: https://supabase.com/docs/guides/auth/row-level-security

---

### 4. ❌ Error 401 atau 403 (Unauthorized)

**Penyebab:** API key expired atau tidak punya permission

**Solusi:**

1. Buka Supabase Dashboard
2. Project Settings → API
3. Copy ulang:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Update `.env` (local) atau Vercel Env Vars (production)
5. Restart/redeploy

---

### 5. ❌ CORS Error (Access-Control-Allow-Origin)

**Penyebab:** Supabase tidak recognize domain Vercel Anda

**Solusi:**

1. Buka Supabase Dashboard
2. Project Settings → API → CORS Settings
3. Tambahkan domain Vercel: `https://your-project.vercel.app`
4. Save dan redeploy

---

## 🔍 Debug Checklist

```
✅ Development Mode Checklist:
  [ ] File .env exist dan sudah isi nilai
  [ ] Tidak ada space di awal/akhir value
  [ ] npm run dev sudah di-restart setelah edit .env
  [ ] Browser DevTools Console tidak show error
  [ ] Network tab menunjukkan request ke Supabase
  [ ] Supabase Dashboard bisa diakses

✅ Production Mode Checklist (Vercel):
  [ ] Settings → Environment Variables ada 2 variables
  [ ] Environment sudah select Production + Preview + Development
  [ ] Klik Redeploy di tab Deployments
  [ ] Build status = Success
  [ ] Clear browser cache (Ctrl+Shift+Delete)
  [ ] Cek di incognito window
  [ ] Network tab ada request ke Supabase
  [ ] Console error atau warning?
```

---

## 🖨️ Cara Check Environment Variables

### Local (Development):
```bash
notepad .env
```

### Vercel (Production):
```bash
# 1. Vercel Dashboard → Settings → Environment Variables
# 2. Atau via CLI:
vercel env list
```

### Browser (Frontend):
```javascript
// DevTools Console (F12):
console.log(import.meta.env.NEXT_PUBLIC_SUPABASE_URL)
```

---

## 🧪 Test Supabase Connection

Buat file `test-supabase.ts` di `src/utils/`:

```typescript
import { createClient } from '@supabase/supabase-js'

async function testConnection() {
  const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  const key = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  console.log('URL:', url ? '✅ SET' : '❌ NOT SET')
  console.log('Key:', key ? '✅ SET' : '❌ NOT SET')

  if (!url || !key) {
    console.error('❌ Environment variables missing!')
    return
  }

  try {
    const supabase = createClient(url, key)
    
    // Test connection
    const { data, error } = await supabase
      .from('albums')
      .select('count(*)', { count: 'exact' })
      .limit(1)

    if (error) {
      console.error('❌ Database error:', error)
    } else {
      console.log('✅ Supabase connected!')
    }
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

testConnection()
```

---

## 💡 Best Practices

### Do's ✅
- ✅ Gunakan `.env.example` sebagai template
- ✅ Keep `.env` di `.gitignore`
- ✅ Use environment variables untuk semua secrets
- ✅ Test di staging sebelum production

### Don'ts ❌
- ❌ Jangan commit `.env` ke git
- ❌ Jangan hardcode API keys di kode
- ❌ Jangan share `.env` dengan orang
- ❌ Jangan disable CORS sepenuhnya

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Vue 3 Docs:** https://vuejs.org

**Sukses! 🎉**

