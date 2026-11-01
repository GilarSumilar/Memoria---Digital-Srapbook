import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Album } from "@/types";

let supabaseInstance: SupabaseClient | null = null;

const STORAGE_KEY_URL = "kisahkita_supabase_url";
const STORAGE_KEY_ANON = "kisahkita_supabase_anon";

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";
  const envKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  const savedUrl =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEY_URL) || ""
      : "";
  const savedKey =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEY_ANON) || ""
      : "";

  return {
    url: savedUrl || envUrl,
    anonKey: savedKey || envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof localStorage !== "undefined") {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON);
  }
  supabaseInstance = null; // Reset cached instance
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    supabaseInstance = createClient(url, anonKey);
    return supabaseInstance;
  } catch (err) {
    console.error("Failed to init Supabase client:", err);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, anonKey);
    const { data, error } = await client.from("albums").select("id").limit(1);

    if (error && error.code !== "PGRST116") {
      if (error.code === "42501") {
        return {
          success: true,
          message: "Koneksi berhasil. Masuk dengan akun Supabase Auth untuk sinkronisasi.",
        };
      }
      // Table might not exist yet, but auth worked
      if (error.message.includes('relation "albums" does not exist')) {
        return {
          success: true,
          message:
              "Koneksi berhasil. Jalankan skrip SQL, lalu masuk dengan akun Supabase Auth.",
        };
      }
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Koneksi berhasil. Masuk dengan akun Supabase Auth untuk sinkronisasi.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Gagal menyambung ke server Supabase",
    };
  }
}

/**
 * Upload gambar base64 atau File ke Supabase Storage bucket 'photos'
 */
export async function uploadImageToSupabase(
  fileOrDataUrl: string | File,
  albumId: string,
): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn("Upload dibatalkan: Supabase belum terhubung.");
    return null;
  }

  try {
    let fileBlob: Blob;
    let extension = "jpg";

    if (typeof fileOrDataUrl === "string") {
      // Data URL to blob
      const res = await fetch(fileOrDataUrl);
      fileBlob = await res.blob();
    } else {
      fileBlob = fileOrDataUrl;
      extension = fileOrDataUrl.name.split(".").pop() || "jpg";
    }

    const cleanAlbumId = (albumId || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${cleanAlbumId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const { data, error } = await client.storage
      .from("photos")
      .upload(fileName, fileBlob, {
        contentType: fileBlob.type || "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Gagal upload ke Supabase Storage 'photos':", error.message);
      return null;
    }

    const { data: publicData } = client.storage
      .from("photos")
      .getPublicUrl(data.path);
    return publicData.publicUrl;
  } catch (err) {
    console.error("Upload to Supabase failed:", err);
    return null;
  }
}

/**
 * Hapus gambar dari Supabase Storage bucket 'photos'
 */
export async function deleteImageFromSupabase(urlOrPath: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !urlOrPath) return false;

  try {
    let filePath = urlOrPath.startsWith("storage://")
      ? urlOrPath.slice("storage://".length)
      : urlOrPath;

    // Jika berupa URL lengkap dari Supabase Storage
    if (urlOrPath.includes("/storage/v1/object/public/photos/")) {
      filePath = urlOrPath.split("/storage/v1/object/public/photos/")[1];
    } else if (urlOrPath.includes("/photos/")) {
      const parts = urlOrPath.split("/photos/");
      filePath = parts[parts.length - 1];
    }

    // Jika bukan path file cloud (misal base64 data:), lewati
    if (!filePath || filePath.startsWith("data:") || filePath.startsWith("blob:")) {
      return false;
    }

    // Bersihkan parameter query (misal ?t=...)
    filePath = filePath.split("?")[0];
    filePath = decodeURIComponent(filePath);

    const { error } = await client.storage.from("photos").remove([filePath]);
    if (error) {
      console.warn("Gagal menghapus file dari storage 'photos':", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Error saat menghapus file storage Supabase:", err);
    return false;
  }
}

export async function resolveSupabaseImageUrl(url: string): Promise<string> {
  if (!url.startsWith("storage://")) return url;

  const client = getSupabaseClient();
  if (!client) return "";

  const path = url.slice("storage://".length);
  const { data } = client.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

export const SUPABASE_SCHEMA_SQL = `-- Skema Database & Storage KisahKita / Memoria
-- Jalankan skrip ini di SQL Editor Supabase Anda:
-- Mode cloud bersama tanpa login: semua pengunjung dapat mengakses semua data.
-- Jangan gunakan untuk album pribadi atau foto sensitif.

-- 1. Buat Tabel Albums
CREATE TABLE IF NOT EXISTS public.albums (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    author TEXT,
    cover_color TEXT DEFAULT 'burgundy',
    cover_texture TEXT DEFAULT 'linen',
    cover_image TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    pages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kolom owner_id lama tidak dipakai dalam mode akses bersama.
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE public.albums ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.albums ALTER COLUMN owner_id DROP DEFAULT;

-- 2. RLS akses bersama untuk tabel Albums
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access" ON public.albums;
DROP POLICY IF EXISTS "Album owner access" ON public.albums;
DROP POLICY IF EXISTS "Shared public albums" ON public.albums;
REVOKE ALL ON TABLE public.albums FROM anon, PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.albums TO anon, authenticated;
CREATE POLICY "Shared public albums" ON public.albums
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Bucket Storage public untuk URL foto yang digunakan aplikasi
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage akses bersama tanpa autentikasi
DROP POLICY IF EXISTS "Public Upload Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public View Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Photos" ON storage.objects;
DROP POLICY IF EXISTS "Album owner photos insert" ON storage.objects;
DROP POLICY IF EXISTS "Album owner photos select" ON storage.objects;
DROP POLICY IF EXISTS "Album owner photos update" ON storage.objects;
DROP POLICY IF EXISTS "Album owner photos delete" ON storage.objects;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO anon, authenticated;
CREATE POLICY "Public Upload Photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Public View Photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'photos');
CREATE POLICY "Public Update Photos"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'photos')
WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Public Delete Photos"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'photos');
`;
