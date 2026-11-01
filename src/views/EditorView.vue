<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Sparkles, Plus, ChevronLeft, ChevronRight, Edit3, Check } from 'lucide-vue-next';
import confetti from 'canvas-confetti';
import { useAlbumStore } from '@/stores/albumStore';
import type { BookPage } from '@/types';
import PageSpreadEditor from '@/components/PageSpreadEditor.vue';
import BookCoverModal from '@/components/BookCoverModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const albumStore = useAlbumStore();

const currentSpreadIndex = ref(0);
const showCoverModal = ref(false);
const showSavedBadge = ref(false);
const pagePendingDeletion = ref<string | null>(null);

onMounted(async () => {
  await albumStore.loadCurrentAlbum();
});

const album = computed(() => albumStore.currentAlbum);

const totalSpreads = computed(() => {
  if (!album.value) return 1;
  return Math.ceil(album.value.pages.length / 2) || 1;
});

const leftPage = computed(() => album.value?.pages[currentSpreadIndex.value * 2]);
const rightPage = computed(() => album.value?.pages[currentSpreadIndex.value * 2 + 1]);

const prevSpread = () => { if (currentSpreadIndex.value > 0) currentSpreadIndex.value--; };
const nextSpread = () => { if (currentSpreadIndex.value < totalSpreads.value - 1) currentSpreadIndex.value++; };

const handleAddPage = async () => {
  if (!album.value) return;
  await albumStore.addPage(album.value.id, 'single');
  currentSpreadIndex.value = Math.floor((album.value.pages.length - 1) / 2);
  triggerSaved();
};

const handleUpdatePage = async (page: BookPage) => {
  if (!album.value) return;
  await albumStore.updatePage(album.value.id, page);
  triggerSaved();
};

const handleDeletePage = async (pageId: string) => {
  if (!album.value) return;
  pagePendingDeletion.value = pageId;
};

const confirmDeletePage = async () => {
  if (!album.value || !pagePendingDeletion.value) return;
  await albumStore.deletePage(album.value.id, pagePendingDeletion.value);
  pagePendingDeletion.value = null;
  if (currentSpreadIndex.value >= totalSpreads.value) {
    currentSpreadIndex.value = Math.max(0, totalSpreads.value - 1);
  }
  triggerSaved();
};

const triggerSaved = () => {
  showSavedBadge.value = true;
  setTimeout(() => (showSavedBadge.value = false), 2000);
};

const openReader = () => {
  confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  router.push('/');
};
</script>

<template>
  <div v-if="album" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div class="scrapbook-panel flex flex-col md:flex-row items-center justify-between gap-4 p-4">
      <div class="flex items-center gap-3 w-full md:w-auto">
        <button @click="router.push('/')" class="p-2 rounded-xl border border-pink-200 bg-white/70 text-[#806A78] hover:text-pink-700" title="Kembali ke album" aria-label="Kembali ke album">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-serif-book font-bold text-xl text-[#704B61] leading-tight">{{ album.title }}</h2>
            <button @click="showCoverModal = true" class="text-stone-400 hover:text-amber-800 p-1" title="Kustomisasi Sampul">
              <Edit3 class="w-3.5 h-3.5" />
            </button>
          </div>
          <p class="text-xs text-stone-500">{{ album.pages.length }} Halaman • {{ album.author || 'Pribadi' }}</p>
        </div>
        <span v-if="showSavedBadge" class="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium ml-2">
          <Check class="w-3 h-3 text-emerald-600" /> Tersimpan
        </span>
      </div>

      <div class="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
        <div class="flex items-center gap-1 bg-pink-50 px-2.5 py-1.5 rounded-xl border border-pink-200 text-xs">
          <button @click="prevSpread" :disabled="currentSpreadIndex === 0" class="p-1 disabled:opacity-40"><ChevronLeft class="w-4 h-4" /></button>
          <span class="font-mono px-1 font-medium">{{ currentSpreadIndex + 1 }} / {{ totalSpreads }}</span>
          <button @click="nextSpread" :disabled="currentSpreadIndex >= totalSpreads - 1" class="p-1 disabled:opacity-40"><ChevronRight class="w-4 h-4" /></button>
        </div>
        <button @click="handleAddPage" class="flex items-center gap-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold">
          <Plus class="w-3.5 h-3.5" /> Tambah Hal.
        </button>
        <button @click="openReader" class="flex items-center gap-1 px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow transition-all">
          <Sparkles class="w-3.5 h-3.5 text-pink-100" /> Mode Baca
        </button>
      </div>
    </div>

    <PageSpreadEditor :left-page="leftPage" :right-page="rightPage" :album-id="album.id" @update-page="handleUpdatePage" @delete-page="handleDeletePage" />

    <div class="flex items-center justify-center gap-1.5 overflow-x-auto py-2">
      <button v-for="idx in totalSpreads" :key="idx" @click="currentSpreadIndex = idx - 1" :class="['px-3 py-1 rounded-lg border text-xs font-mono transition-all', currentSpreadIndex === idx - 1 ? 'bg-pink-500 text-white border-pink-500 font-bold' : 'bg-white/80 border-pink-200 text-[#806A78]']">
        Lembar {{ idx }}
      </button>
    </div>

    <BookCoverModal :is-open="showCoverModal" :album-to-edit="album" @close="showCoverModal = false" @updated="showCoverModal = false" />
    <ConfirmDialog
      :is-open="pagePendingDeletion !== null"
      title="Hapus halaman?"
      message="Halaman ini beserta foto dan isinya akan dihapus dari album."
      confirm-label="Hapus halaman"
      @confirm="confirmDeletePage"
      @cancel="pagePendingDeletion = null"
    />
  </div>
  <div v-else class="min-h-[400px] flex items-center justify-center text-stone-500 text-sm">{{ albumStore.isLoading ? 'Memuat editor...' : 'Album tidak dapat dimuat. Muat ulang halaman untuk mencoba lagi.' }}</div>
</template>
