import { getSupabaseClient } from "./supabase";
import type { Album } from "@/types";

export const albumService = {
  /**
   * Mengambil semua album dari Supabase
   */
  async fetchAlbums(): Promise<{ data: Album[] | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: "Klien Supabase belum dikonfigurasi." };
    }

    try {
      const { data, error } = await client
        .from("albums")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const albums: Album[] = (data || []).map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        author: r.author,
        coverColor: r.cover_color,
        coverTexture: r.cover_texture,
        coverImage: r.cover_image,
        isFavorite: r.is_favorite,
        pages: r.pages || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return { data: albums, error: null };
    } catch (err: any) {
      console.error("Gagal mengambil daftar album:", err.message);
      return { data: null, error: err.message };
    }
  },

  /**
   * Mengambil satu album berdasarkan ID
   */
  async fetchAlbumById(albumId: string): Promise<{ data: Album | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: "Klien Supabase belum dikonfigurasi." };
    }

    try {
      const { data: r, error } = await client
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();

      if (error) throw error;
      if (!r) return { data: null, error: "Album tidak ditemukan" };

      const album: Album = {
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        author: r.author,
        coverColor: r.cover_color,
        coverTexture: r.cover_texture,
        coverImage: r.cover_image,
        isFavorite: r.is_favorite,
        pages: r.pages || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };

      return { data: album, error: null };
    } catch (err: any) {
      console.error("Gagal mengambil album:", err.message);
      return { data: null, error: err.message };
    }
  },

  /**
   * Menyimpan / memperbarui album ke Supabase (tabel albums dengan kolom JSONB pages)
   */
  async saveFullAlbum(albumData: Album): Promise<{ data: Album | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: "Klien Supabase belum dikonfigurasi." };
    }

    try {
      const payload = {
        id: albumData.id,
        title: albumData.title,
        subtitle: albumData.subtitle,
        author: albumData.author,
        cover_color: albumData.coverColor,
        cover_texture: albumData.coverTexture,
        cover_image: albumData.coverImage,
        is_favorite: albumData.isFavorite ?? false,
        pages: albumData.pages ?? [],
        updated_at: albumData.updatedAt || new Date().toISOString(),
      };

      const { data, error } = await client
        .from("albums")
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;

      return { data: albumData, error: null };
    } catch (err: any) {
      console.error("Gagal menyimpan album:", err.message);
      return { data: null, error: err.message };
    }
  },

  /**
   * Memperbarui album yang sudah ada
   */
  async updateFullAlbum(albumId: string, albumData: Album): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: "Klien Supabase belum dikonfigurasi." };
    }

    try {
      const { error } = await client
        .from("albums")
        .update({
          title: albumData.title,
          subtitle: albumData.subtitle,
          author: albumData.author,
          cover_color: albumData.coverColor,
          cover_texture: albumData.coverTexture,
          cover_image: albumData.coverImage,
          is_favorite: albumData.isFavorite,
          pages: albumData.pages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", albumId);

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error("Gagal update album:", err.message);
      return { error: err.message };
    }
  },

  /**
   * Menghapus album dari Supabase
   */
  async deleteAlbum(albumId: string): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: "Klien Supabase belum dikonfigurasi." };
    }

    try {
      const { error } = await client
        .from("albums")
        .delete()
        .eq("id", albumId);

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error("Gagal menghapus album:", err.message);
      return { error: err.message };
    }
  },
};

