import { defineStore } from 'pinia';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '@/utils/supabase';
import { useAlbumStore } from '@/stores/albumStore';

export const useConfigStore = defineStore('config', {
  state: () => {
    const config = getSupabaseConfig();
    const hasCredentials = Boolean(config.url && config.anonKey);
    return {
      soundEnabled: true,
      supabaseUrl: config.url,
      supabaseKey: config.anonKey,
      isConnectedToSupabase: hasCredentials,
      isTestingConnection: false,
      connectionMessage: hasCredentials ? 'Tersambung ke Supabase' : '',
    };
  },

  actions: {
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('kisahkita_sound', this.soundEnabled ? '1' : '0');
    },

    initSound() {
      const saved = localStorage.getItem('kisahkita_sound');
      if (saved !== null) {
        this.soundEnabled = saved === '1';
      }
    },

    async initConnection() {
      const config = getSupabaseConfig();
      this.supabaseUrl = config.url;
      this.supabaseKey = config.anonKey;

      if (!this.supabaseUrl || !this.supabaseKey) {
        this.isConnectedToSupabase = false;
        this.connectionMessage = '';
        return false;
      }

      this.isTestingConnection = true;
      try {
        const res = await testSupabaseConnection(this.supabaseUrl, this.supabaseKey);
        this.isConnectedToSupabase = res.success;
        this.connectionMessage = res.message;
        if (res.success) {
          const albumStore = useAlbumStore();
          await albumStore.loadAlbums();
        }
        return res.success;
      } catch (e: any) {
        this.isConnectedToSupabase = false;
        this.connectionMessage = e?.message || 'Gagal tersambung otomatis ke Supabase';
        return false;
      } finally {
        this.isTestingConnection = false;
      }
    },

    async testConnection(url: string, key: string) {
      this.isTestingConnection = true;
      this.connectionMessage = '';
      try {
        const res = await testSupabaseConnection(url, key);
        if (res.success) {
          saveSupabaseConfig(url, key);
          this.supabaseUrl = url;
          this.supabaseKey = key;
          this.isConnectedToSupabase = true;
          this.connectionMessage = res.message;
          const albumStore = useAlbumStore();
          await albumStore.loadAlbums();
        } else {
          this.isConnectedToSupabase = false;
          this.connectionMessage = res.message;
        }
        return res.success;
      } catch (e: any) {
        this.isConnectedToSupabase = false;
        this.connectionMessage = e.message || 'Koneksi gagal';
        return false;
      } finally {
        this.isTestingConnection = false;
      }
    },

    disconnectSupabase() {
      saveSupabaseConfig('', '');
      this.supabaseUrl = '';
      this.supabaseKey = '';
      this.isConnectedToSupabase = false;
      this.connectionMessage = 'Koneksi Supabase diputuskan. Menggunakan penyimpanan offline.';
    }
  }
});
