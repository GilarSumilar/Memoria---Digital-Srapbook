<script setup lang="ts">
import { onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import { useConfigStore } from '@/stores/configStore';

const configStore = useConfigStore();

onMounted(async () => {
  configStore.initSound();
  await configStore.initConnection();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-transparent text-[#584653]">
    <Navbar />

    <main class="flex-1 pb-12">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="border-t border-pink-200/70 bg-[#FFFDF8]/90 py-6 text-center text-xs text-stone-500">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="font-serif-book">
          <strong>Memoria</strong> · Simpan cerita kecil, kenang selamanya
        </p>
        <p class="text-[11px] text-stone-400">
          Album foto digital yang hangat dan personal
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
