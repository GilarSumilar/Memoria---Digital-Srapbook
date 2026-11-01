<script setup lang="ts">
import { ref, watch } from "vue";
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
} from "lucide-vue-next";
import { useConfigStore } from "@/stores/configStore";
import { SUPABASE_SCHEMA_SQL } from "@/utils/supabase";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const configStore = useConfigStore();
const urlInput = ref(configStore.supabaseUrl);
const keyInput = ref(configStore.supabaseKey);
const copied = ref(false);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      urlInput.value = configStore.supabaseUrl;
      keyInput.value = configStore.supabaseKey;
    }
  }
);

const handleConnect = async () => {
  await configStore.testConnection(urlInput.value, keyInput.value);
};

const handleDisconnect = () => {
  configStore.disconnectSupabase();
  urlInput.value = "";
  keyInput.value = "";
};

const copySchema = () => {
  navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2500);
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#5D4654]/45 backdrop-blur-sm"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
    >
      <div
        class="bg-[#FFFDF8] rounded-3xl max-w-lg w-full shadow-2xl border border-pink-200 overflow-hidden flex flex-col max-h-[88vh] my-auto"
      >
      <div
        class="px-5 py-3.5 border-b border-pink-100 flex items-center justify-between bg-pink-50/70"
      >
        <div class="flex items-center gap-2">
          <div class="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Database class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-serif-book font-bold text-xl text-[#704B61]">
              Konfigurasi Supabase
            </h3>
            <p class="text-[11px] text-stone-500">
              PostgreSQL + Storage Cloud Sync
            </p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="p-5 overflow-y-auto space-y-4 text-xs">
        <div
          :class="[
            'p-3 rounded-xl border flex items-start gap-2.5',
            configStore.isConnectedToSupabase
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900',
          ]"
        >
          <CheckCircle2
            v-if="configStore.isConnectedToSupabase"
            class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
          />
          <AlertCircle v-else class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-semibold">
              {{
                configStore.isConnectedToSupabase
                  ? "Cloud Supabase Aktif"
                  : "Penyimpanan Offline (IndexedDB)"
              }}
            </p>
            <p class="mt-0.5 opacity-90 leading-tight">
              {{
                configStore.connectionMessage ||
                "Data tersimpan lokal di browser. Hubungkan ke Supabase untuk cloud sync multi-device."
              }}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-semibold text-stone-700 mb-1"
              >Project URL Supabase</label
            >
            <input
              v-model="urlInput"
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>
          <div>
            <label class="block font-semibold text-stone-700 mb-1"
              >Anon / Public API Key</label
            >
            <input
              v-model="keyInput"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>
          <div class="flex items-center gap-2 pt-1">
            <button
              @click="handleConnect"
              :disabled="
                configStore.isTestingConnection || !urlInput || !keyInput
              "
              class="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow"
            >
              <RefreshCw
                v-if="configStore.isTestingConnection"
                class="w-3 h-3 animate-spin"
              />
              <ShieldCheck v-else class="w-3 h-3" />
              <span>{{
                configStore.isTestingConnection ? "Memeriksa..." : "Hubungkan"
              }}</span>
            </button>
            <button
              v-if="configStore.isConnectedToSupabase"
              @click="handleDisconnect"
              class="px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg"
            >
              Putuskan
            </button>
          </div>
        </div>

        <div class="pt-3 border-t border-stone-200">
          <p class="mb-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-amber-900">
            Mode bersama tanpa login: semua pengguna dapat melihat, mengubah,
            atau menghapus semua album dan foto. Jangan simpan data pribadi.
          </p>
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-semibold text-stone-700">Skrip SQL Supabase</span>
            <button
              @click="copySchema"
              class="flex items-center gap-1 text-amber-800 font-medium"
            >
              <Check v-if="copied" class="w-3 h-3 text-emerald-600" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ copied ? "Tersalin" : "Salin SQL" }}</span>
            </button>
          </div>
          <pre
            class="bg-stone-900 text-stone-200 p-2.5 rounded-lg text-[10px] overflow-x-auto max-h-28 font-mono leading-tight"
            >{{ SUPABASE_SCHEMA_SQL }}</pre
          >
        </div>
      </div>

      <div
        class="px-5 py-2.5 bg-pink-50/70 border-t border-pink-100 flex justify-end shrink-0"
      >
        <button
          @click="emit('close')"
          class="px-3.5 py-1.5 bg-pink-100 hover:bg-pink-200 text-[#704B61] font-semibold rounded-xl"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</Teleport>
</template>
