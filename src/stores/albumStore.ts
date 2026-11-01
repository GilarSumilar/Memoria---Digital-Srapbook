import { defineStore } from "pinia";
import type { Album, BookPage, PageLayout, PhotoItem } from "@/types";
import { SAMPLE_ALBUM } from "@/data/sampleAlbum";
import {
  getAllAlbums,
  saveAlbum,
  deleteAlbum as deleteLocalAlbum,
} from "@/utils/storage";
import { getSupabaseClient, deleteImageFromSupabase } from "@/utils/supabase";

const ACTIVE_ALBUM_KEY = "memoria_active_album_id";

export const useAlbumStore = defineStore("album", {
  state: () => ({
    albums: [] as Album[],
    isLoading: true,
    currentAlbum: null as Album | null,
  }),

  actions: {
    async loadAlbums() {
      this.isLoading = true;
      try {
        const local = await getAllAlbums();
        this.albums = local && local.length > 0 ? local : [SAMPLE_ALBUM];
        if (!local || local.length === 0) await saveAlbum(SAMPLE_ALBUM);

        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb
            .from("albums")
            .select("*")
            .order("updated_at", { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) {
            const cloudAlbums: Album[] = data.map((r) => ({
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
            for (const cloudAlbum of cloudAlbums) {
              const index = this.albums.findIndex(
                (a) => a.id === cloudAlbum.id,
              );
              if (index === -1) {
                this.albums.push(cloudAlbum);
                await saveAlbum(cloudAlbum);
              } else if (
                new Date(cloudAlbum.updatedAt).getTime() >=
                new Date(this.albums[index].updatedAt).getTime()
              ) {
                this.albums[index] = cloudAlbum;
                await saveAlbum(cloudAlbum);
              }
            }

            if (cloudAlbums.some((c) => c.id !== SAMPLE_ALBUM.id)) {
              this.albums = this.albums.filter((a) => a.id !== SAMPLE_ALBUM.id);
            }

            if (this.currentAlbum) {
              const fresh = this.albums.find(
                (a) => a.id === this.currentAlbum?.id,
              );
              if (fresh) this.currentAlbum = { ...fresh };
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat album:", err);
        if (this.albums.length === 0) this.albums = [SAMPLE_ALBUM];
      } finally {
        this.isLoading = false;
      }
    },
    async loadCurrentAlbum() {
      await this.loadAlbums();
      const activeId = localStorage.getItem(ACTIVE_ALBUM_KEY);
      const saved = this.albums.find((album) => album.id === activeId);
      const candidates = this.albums.filter(
        (album) => album.id !== SAMPLE_ALBUM.id,
      );
      candidates.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      const album = saved ?? candidates[0] ?? this.albums[0];
      this.currentAlbum = album ? { ...album } : null;
      if (album) localStorage.setItem(ACTIVE_ALBUM_KEY, album.id);
      return this.currentAlbum;
    },

    async updateAlbum(updated: Album, persistFirst = false) {
      updated.updatedAt = new Date().toISOString();
      if (persistFirst) await this.persistAlbum(updated);
      const idx = this.albums.findIndex((a) => a.id === updated.id);
      if (idx !== -1) this.albums[idx] = { ...updated };
      if (this.currentAlbum?.id === updated.id)
        this.currentAlbum = { ...updated };
      if (!persistFirst) await this.persistAlbum(updated);
    },

    getAlbumById(id: string) {
      return this.albums.find((a) => a.id === id);
    },

    async addPage(albumId: string, layout: PageLayout = "single") {
      const a = this.getAlbumById(albumId);
      if (!a) return;
      const num = a.pages.length + 1;
      const newPage: BookPage = {
        id: "page-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        pageNumber: num,
        layout,
        title: `Halaman ${num}`,
        photos: [],
        backgroundColor: "#FAF8F5",
      };
      a.pages.push(newPage);
      await this.updateAlbum(a);
      return newPage;
    },

    async deletePage(albumId: string, pageId: string) {
      const a = this.getAlbumById(albumId);
      if (!a) return;
      const page = a.pages.find((p) => p.id === pageId);
      if (page) {
        for (const ph of page.photos) {
          if (ph.url) await deleteImageFromSupabase(ph.url);
        }
      }
      a.pages = a.pages.filter((p) => p.id !== pageId);
      a.pages.forEach((p, i) => {
        p.pageNumber = i + 1;
      });
      await this.updateAlbum(a);
    },

    async updatePage(albumId: string, page: BookPage) {
      const a = this.getAlbumById(albumId);
      if (!a) return;
      const idx = a.pages.findIndex((p) => p.id === page.id);
      if (idx !== -1) {
        const oldPage = a.pages[idx];
        const removedPhotos = oldPage.photos.filter(
          (oldP) => !page.photos.some((newP) => newP.id === oldP.id),
        );
        for (const rem of removedPhotos) {
          if (rem.url) await deleteImageFromSupabase(rem.url);
        }
        a.pages[idx] = { ...page };
        await this.updateAlbum(a);
      }
    },

    async addPhotoToPage(albumId: string, pageId: string, photo: PhotoItem) {
      const a = this.getAlbumById(albumId);
      if (!a) return;
      const page = a.pages.find((p) => p.id === pageId);
      if (!page) return;
      if (page.photos.length >= 1) {
        throw new Error("Setiap halaman hanya dapat memuat satu foto.");
      }
      page.photos.push(photo);
      await this.updateAlbum(a);
    },

    async updatePhoto(
      albumId: string,
      pageId: string,
      photoId: string,
      patch: Partial<PhotoItem>,
    ) {
      const a = this.getAlbumById(albumId);
      if (!a) return;
      const page = a.pages.find((p) => p.id === pageId);
      if (!page) return;
      const pIdx = page.photos.findIndex((ph) => ph.id === photoId);
      if (pIdx !== -1) {
        page.photos[pIdx] = { ...page.photos[pIdx], ...patch };
        await this.updateAlbum(a);
      }
    },

    async deletePhoto(albumId: string, pageId: string, photoId: string) {
      const a = this.getAlbumById(albumId);
      if (!a) return;
      const page = a.pages.find((p) => p.id === pageId);
      if (!page) return;
      const targetPhoto = page.photos.find((ph) => ph.id === photoId);
      if (targetPhoto?.url) {
        await deleteImageFromSupabase(targetPhoto.url);
      }
      page.photos = page.photos.filter((ph) => ph.id !== photoId);
      await this.updateAlbum(a);
    },

    async deleteAlbum(id: string) {
      const a = this.getAlbumById(id);
      if (a) {
        for (const page of a.pages) {
          for (const ph of page.photos) {
            if (ph.url) await deleteImageFromSupabase(ph.url);
          }
        }
      }
      const idx = this.albums.findIndex((alb) => alb.id === id);
      if (idx !== -1) {
        this.albums.splice(idx, 1);
      }
      if (this.currentAlbum?.id === id) {
        this.currentAlbum = this.albums[0] ?? null;
      }
      await deleteLocalAlbum(id);
      const sb = getSupabaseClient();
      if (sb) {
        try {
          const { error } = await sb.from("albums").delete().eq("id", id);
          if (error)
            console.error("Gagal delete album di Supabase:", error.message);
        } catch (e) {
          console.warn("Sync delete note:", e);
        }
      }
    },

    async persistAlbum(a: Album) {
      await saveAlbum(a);
      const sb = getSupabaseClient();
      if (sb) {
        try {
          const { error } = await sb.from("albums").upsert({
            id: a.id,
            title: a.title,
            subtitle: a.subtitle,
            author: a.author,
            cover_color: a.coverColor,
            cover_texture: a.coverTexture,
            cover_image: a.coverImage,
            is_favorite: a.isFavorite,
            pages: a.pages,
            updated_at: a.updatedAt,
          });
          if (error) {
            console.error(
              "Gagal menyimpan ke tabel Supabase 'albums':",
              error.message,
            );
          }
        } catch (e) {
          console.warn("Sync note:", e);
        }
      } else {
        await saveAlbum(a);
      }
    },
  },
});
