<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { BookOpen, Database, Sparkles } from "lucide-vue-next";
import { useConfigStore } from "@/stores/configStore";
import SupabaseModal from "./SupabaseModal.vue";

const route = useRoute();
const configStore = useConfigStore();

const showSupabaseModal = ref(false);
</script>

<template>
  <header
    class="sticky top-0 z-40 bg-[#FFF9FC]/90 backdrop-blur-md border-b border-pink-200/80 px-4 md:px-8 py-3.5 transition-all"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo & Brand -->
      <router-link to="/" class="flex items-center gap-3 group">
        <div
          class="w-10 h-10 rounded-xl bg-pink-200 text-pink-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
        >
          <BookOpen class="w-5 h-5 text-pink-700" />
        </div>
        <div>
          <span
            class="text-2xl font-bold font-serif-book tracking-tight text-[#6F4560] group-hover:text-pink-700 transition-colors flex items-center gap-1.5"
          >
            Memoria
            <span
              class="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-sans font-medium tracking-normal"
              >Scrapbook</span
            >
          </span>
          <p class="text-[11px] text-[#8D7280] hidden sm:block">
            Album kecil untuk kenangan besar
          </p>
        </div>
      </router-link>

      <!-- Center Nav Links -->
      <nav
        class="hidden md:flex items-center gap-1 bg-pink-100/70 p-1 rounded-xl border border-pink-200/80 text-sm font-medium"
      >
        <router-link
          to="/"
          :class="[
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all',
            route.path === '/'
              ? 'bg-white text-[#6F4560] shadow-sm font-semibold'
              : 'text-[#806A78] hover:text-pink-800',
          ]"
        >
          <Sparkles class="w-4 h-4 text-pink-600" />
          <span>Album</span>
        </router-link>

        <router-link
          to="/editor"
          :class="[
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all',
            route.name === 'editor'
              ? 'bg-white text-[#6F4560] shadow-sm font-semibold'
              : 'text-[#806A78] hover:text-pink-800',
          ]"
        >
          <BookOpen class="w-4 h-4 text-pink-700" />
          <span>Editor</span>
        </router-link>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Supabase Cloud Sync Modal Trigger -->
        <!-- <button
          @click="showSupabaseModal = true"
          :title="
            configStore.isConnectedToSupabase
              ? 'Tersambung ke Supabase'
              : 'Penyimpanan Offline (Klik untuk Supabase)'
          "
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm opacity-10',
            configStore.isConnectedToSupabase
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-[#FFFDF8]/80 border-pink-200 text-[#806A78] hover:bg-white',
          ]"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="
              configStore.isConnectedToSupabase
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-stone-400'
            "
          ></span>
          <Database class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{
            configStore.isConnectedToSupabase ? "Supabase Sync" : "Cloud Sync"
          }}</span>
        </button> -->
      </div>
    </div>

    <!-- Modals -->
    <SupabaseModal
      :is-open="showSupabaseModal"
      @close="showSupabaseModal = false"
    />
  </header>
</template>
