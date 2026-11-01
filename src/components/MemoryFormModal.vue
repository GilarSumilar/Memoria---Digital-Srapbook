<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { BookPage, PhotoItem } from '@/types';
import { compressImage } from '@/utils/compression';
import { uploadImageToSupabase } from '@/utils/supabase';
import { countStoryWords, MAX_STORY_WORDS } from '@/utils/story';

const NEW_PAGE = '__new__';

const props = defineProps<{
  isOpen: boolean;
  pages: BookPage[];
  initialPageId?: string;
  albumId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: { pageId: string; photo: PhotoItem }): void;
}>();

const title = ref('');
const date = ref('');
const story = ref('');
const imageUrl = ref('');
const imageFile = ref<File | null>(null);
const targetPageId = ref(NEW_PAGE);
const isSaving = ref(false);
const errorMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const availablePages = computed(() => props.pages.filter(page => page.photos.length === 0));
const storyWordCount = computed(() => countStoryWords(story.value));

watch(() => props.isOpen, isOpen => {
  if (!isOpen) return;
  title.value = '';
  date.value = '';
  story.value = '';
  imageUrl.value = '';
  imageFile.value = null;
  errorMessage.value = '';
  targetPageId.value = props.initialPageId && (props.initialPageId === NEW_PAGE || availablePages.value.some(page => page.id === props.initialPageId))
    ? props.initialPageId
    : availablePages.value[0]?.id ?? NEW_PAGE;
});

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  imageFile.value = input.files?.[0] ?? null;
  if (imageFile.value) imageUrl.value = '';
  errorMessage.value = '';
};

const handleUrlInput = () => {
  if (imageUrl.value.trim()) imageFile.value = null;
  errorMessage.value = '';
};

const save = async () => {
  if (storyWordCount.value > MAX_STORY_WORDS) {
    errorMessage.value = `Cerita maksimal ${MAX_STORY_WORDS} kata.`;
    return;
  }
  if (!title.value.trim()) {
    errorMessage.value = 'Judul momen wajib diisi.';
    return;
  }
  if (!imageFile.value && !imageUrl.value.trim()) {
    errorMessage.value = 'Pilih foto atau masukkan tautan gambar.';
    return;
  }
  if (imageUrl.value.trim()) {
    try {
      const url = new URL(imageUrl.value.trim());
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error();
    } catch {
      errorMessage.value = 'Masukkan tautan gambar yang valid (http atau https).';
      return;
    }
  }

  isSaving.value = true;
  errorMessage.value = '';
  try {
    let url = imageUrl.value.trim();
    if (imageFile.value) {
      const compressed = await compressImage(imageFile.value, { maxWidth: 1600, quality: 0.82 });
      url = compressed.dataUrl;

      if (props.albumId) {
        const cloudUrl = await uploadImageToSupabase(compressed.dataUrl, props.albumId);
        if (cloudUrl) {
          url = cloudUrl;
        }
      }
    }

    emit('save', {
      pageId: targetPageId.value,
      photo: {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url,
        caption: title.value.trim(),
        date: date.value,
        story: story.value.trim(),
        filter: 'normal',
        rotation: Math.random() * 4 - 2,
      },
    });
    emit('close');
  } catch (error) {
    console.error('Gagal menyiapkan foto:', error);
    errorMessage.value = 'Foto tidak dapat diproses atau dikompres hingga 1 MB. Coba pilih foto lain.';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-[#3A2E2B]/45 p-4 backdrop-blur-sm">
    <form class="memory-modal w-full max-w-lg rounded-3xl border border-pink-200 bg-[#FFFDF6] shadow-2xl" @submit.prevent="save">
      <header class="flex items-center justify-between border-b border-pink-100 px-6 py-4 bg-pink-50/40">
        <div>
          <p class="font-handwriting text-sm text-pink-500">Satu cerita kecil...</p>
          <h2 class="font-serif-book text-2xl font-bold text-[#704B61]">Tambahkan Kenangan</h2>
        </div>
        <button type="button" class="rounded-full p-2 text-stone-500 hover:bg-pink-50" aria-label="Tutup" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </header>

      <div class="space-y-4 px-6 py-5">
        <div>
          <label for="memory-title" class="mb-1 block text-xs font-semibold text-[#3A2E2B]">Judul momen <span class="text-pink-500">*</span></label>
          <input id="memory-title" v-model="title" required maxlength="100" placeholder="Contoh: Senja pertama di Bali" class="memory-input" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="memory-date" class="mb-1 block text-xs font-semibold text-[#3A2E2B]">Tanggal</label>
            <input id="memory-date" v-model="date" type="date" class="memory-input" />
          </div>
          <div>
            <label for="memory-page" class="mb-1 block text-xs font-semibold text-[#3A2E2B]">Lembar tujuan</label>
            <select id="memory-page" v-model="targetPageId" class="memory-input">
              <option v-for="page in availablePages" :key="page.id" :value="page.id">Halaman {{ page.pageNumber }}{{ page.title ? ` · ${page.title}` : '' }}</option>
              <option :value="NEW_PAGE">Buat lembar baru</option>
            </select>
          </div>
        </div>

        <div>
          <label for="memory-story" class="mb-1 block text-xs font-semibold text-[#3A2E2B]">Cerita di balik foto</label>
          <textarea id="memory-story" v-model="story" rows="3" aria-describedby="memory-story-count" :aria-invalid="storyWordCount > MAX_STORY_WORDS" placeholder="Tuliskan cerita yang ingin selalu kamu ingat..." class="memory-input resize-y"></textarea>
          <p id="memory-story-count" :class="['mt-1 text-[11px]', storyWordCount > MAX_STORY_WORDS ? 'text-rose-700' : 'text-stone-500']" aria-live="polite">
            {{ storyWordCount }} / {{ MAX_STORY_WORDS }} kata<span v-if="storyWordCount > MAX_STORY_WORDS"> — kurangi cerita hingga maksimal {{ MAX_STORY_WORDS }} kata.</span>
          </p>
        </div>

        <div>
          <span class="mb-1 block text-xs font-semibold text-[#3A2E2B]">Foto <span class="text-pink-500">*</span></span>
          <div class="grid gap-2 sm:grid-cols-2">
            <button type="button" class="rounded-xl border border-dashed border-pink-300 bg-pink-50/60 px-3 py-3 text-xs font-semibold text-pink-700 hover:bg-pink-100" @click="fileInput?.click()">
              {{ imageFile?.name || 'Pilih foto dari perangkat' }}
            </button>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            <input v-model="imageUrl" type="url" placeholder="Atau tempel tautan gambar" class="memory-input" @input="handleUrlInput" />
          </div>
          <p v-if="imageFile" class="mt-1 text-[11px] text-stone-500">File dipilih: {{ imageFile.name }}</p>
          <p class="mt-1 text-[11px] text-stone-500">Foto dari perangkat dikompres hingga maksimal 1 MB. Tautan gambar tidak dikompres.</p>
        </div>

        <p v-if="errorMessage" role="alert" class="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ errorMessage }}</p>
      </div>

      <footer class="flex justify-end gap-2 border-t border-pink-100 px-6 py-4 bg-pink-50/40">
        <button type="button" class="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100" @click="emit('close')">Batal</button>
        <button type="submit" :disabled="isSaving" class="rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-60">
          {{ isSaving ? 'Menyimpan...' : 'Simpan kenangan' }}
        </button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
.memory-input {
  width: 100%;
  border: 1px solid #f1d8dd;
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.65rem 0.75rem;
  color: #3a2e2b;
  font-size: 0.75rem;
  outline: none;
}

.memory-input:focus {
  border-color: #f472b6;
  box-shadow: 0 0 0 3px rgb(244 114 182 / 15%);
}
</style>
