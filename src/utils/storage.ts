import type { Album } from "@/types";

const STORAGE_KEY = "memoria_albums";
const LEGACY_STORAGE_KEY = "kisahkita_albums";

function readStoredAlbums(key: string): Album[] {
  const data = localStorage.getItem(key);
  if (!data) return [];

  const albums: unknown = JSON.parse(data);
  if (!Array.isArray(albums)) {
    throw new Error(`Data album di ${key} bukan daftar yang valid.`);
  }
  return albums as Album[];
}

async function readLegacyIndexedDb(): Promise<Album[]> {
  if (!("indexedDB" in window)) return [];

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("kisahkita_db");
    request.onerror = () =>
      reject(
        request.error ??
          new Error("Tidak dapat membuka penyimpanan album lama."),
      );
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("albums")) {
        db.close();
        resolve([]);
        return;
      }

      const transaction = db.transaction("albums", "readonly");
      const getAll = transaction.objectStore("albums").getAll();
      getAll.onsuccess = () => {
        db.close();
        resolve((getAll.result as Album[] | undefined) ?? []);
      };
      getAll.onerror = () => {
        db.close();
        reject(getAll.error ?? new Error("Tidak dapat membaca album lama."));
      };
    };
  });
}

export async function getAllAlbums(): Promise<Album[]> {
  if (localStorage.getItem(STORAGE_KEY) !== null) {
    return readStoredAlbums(STORAGE_KEY);
  }

  const legacyLocal = readStoredAlbums(LEGACY_STORAGE_KEY);
  if (legacyLocal.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyLocal));
    return legacyLocal;
  }

  try {
    const legacyIndexedDb = await readLegacyIndexedDb();
    if (legacyIndexedDb.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyIndexedDb));
      return legacyIndexedDb;
    }
  } catch (error) {
    console.warn("Migrasi album lama dari IndexedDB gagal:", error);
  }

  return [];
}

export async function saveAlbum(album: Album): Promise<void> {
  const albums = await getAllAlbums();
  const index = albums.findIndex((item) => item.id === album.id);
  if (index >= 0) albums[index] = album;
  else albums.unshift(album);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

export async function deleteAlbum(id: string): Promise<void> {
  const albums = await getAllAlbums();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(albums.filter((album) => album.id !== id)),
  );
}
