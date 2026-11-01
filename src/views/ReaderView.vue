<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Edit3 } from "lucide-vue-next";
import { useAlbumStore } from "@/stores/albumStore";
import FlipbookViewer from "@/components/FlipbookViewer.vue";
import BookLoader from "@/components/BookLoader.vue";

const router = useRouter();
const albumStore = useAlbumStore();

onMounted(async () => {
  await albumStore.loadCurrentAlbum();
});

const album = computed(() => albumStore.currentAlbum);
</script>

<template>
  <div v-if="album" class="w-full px-2 sm:px-4 py-2 sm:py-4 space-y-2 sm:space-y-4">
    <!-- Clean Minimalist Header for Read Mode -->
    <div class="flex items-center justify-between py-1 sm:py-2 text-stone-700">
      <div class="flex items-center gap-3"></div>

      <div class="flex items-center gap-2">
        <button
          @click="router.push('/editor')"
          class="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Edit3 class="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          <span class="hidden sm:inline">Edit Album</span>
          <span class="sm:hidden">Edit</span>
        </button>
      </div>
    </div>

    <!-- The Flipbook -->
    <FlipbookViewer :album="album" />
  </div>

  <BookLoader v-else-if="albumStore.isLoading" />

  <div
    v-else
    class="min-h-[500px] flex items-center justify-center text-stone-500 text-xs sm:text-sm px-4"
  >
    Album tidak dapat dimuat. Muat ulang halaman untuk mencoba lagi.
  </div>
</template>
