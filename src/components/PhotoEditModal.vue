<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { X, Calendar, Type, Wand2, Trash2 } from 'lucide-vue-next';
import type { PhotoItem, PhotoFilter } from '@/types';
import { countStoryWords, MAX_STORY_WORDS } from '@/utils/story';
import ImageSource from '@/components/ImageSource.vue';

const props = defineProps<{
  isOpen: boolean;
  photo: PhotoItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', patch: Partial<PhotoItem>): void;
  (e: 'delete'): void;
}>();

const caption = ref('');
const date = ref('');
const story = ref('');
const filter = ref<PhotoFilter>('normal');
const storyWordCount = computed(() => countStoryWords(story.value));
const storyTooLong = computed(() => storyWordCount.value > MAX_STORY_WORDS && story.value.trim() !== (props.photo?.story || '').trim());

watch(() => props.photo, (val) => {
  if (val) {
    caption.value = val.caption || '';
    date.value = val.date || '';
    story.value = val.story || '';
    filter.value = val.filter || 'normal';
  }
}, { immediate: true });

const filters: { id: PhotoFilter; label: string }[] = [
  { id: 'normal', label: 'Asli' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'warm', label: 'Hangat' },
  { id: 'cool', label: 'Sejuk' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'grayscale', label: 'B&W' },
];

const handleSave = () => {
  if (storyTooLong.value) return;
  emit('save', {
    caption: caption.value.trim(),
    date: date.value.trim(),
    story: story.value.trim(),
    filter: filter.value,
  });
  emit('close');
};
</script>

<template>
  <div v-if="isOpen && photo" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4654]/45 backdrop-blur-sm">
    <div class="bg-[#FFFDF8] rounded-3xl max-w-lg w-full shadow-2xl border border-pink-200 overflow-hidden flex flex-col">
      <div class="px-5 py-3 border-b border-pink-100 flex items-center justify-between bg-pink-50/70">
        <h3 class="font-serif-book font-bold text-xl text-[#704B61]">Detail Foto & Keterangan</h3>
        <button @click="emit('close')" class="p-1 text-stone-400 hover:text-stone-700"><X class="w-4 h-4" /></button>
      </div>

      <div class="p-5 space-y-4 text-xs">
        <div class="relative w-full h-48 bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center border">
          <ImageSource :src="photo.url" :alt="caption" :class="['max-h-full max-w-full object-contain', `filter-${filter}`]" />
        </div>

        <div>
          <label class="block font-semibold text-stone-700 mb-1 flex items-center gap-1"><Type class="w-3.5 h-3.5" /> Keterangan (Caption)</label>
          <input v-model="caption" type="text" placeholder="Tuliskan cerita singkat tentang foto ini..." class="w-full px-3 py-2 rounded-lg border border-stone-300 focus:border-amber-800 focus:outline-none" />
        </div>

        <div>
          <label class="block font-semibold text-stone-700 mb-1 flex items-center gap-1"><Calendar class="w-3.5 h-3.5" /> Tanggal / Tempat</label>
          <input v-model="date" type="text" placeholder="Contoh: 15 Juli 2024 atau Ubud, Bali" class="w-full px-3 py-2 rounded-lg border border-stone-300 focus:border-amber-800 focus:outline-none" />
        </div>

        <div>
          <label for="photo-story" class="block font-semibold text-stone-700 mb-1">Cerita di balik foto</label>
          <textarea id="photo-story" v-model="story" rows="3" aria-describedby="photo-story-count" :aria-invalid="storyTooLong" placeholder="Tuliskan cerita kenangan..." class="w-full px-3 py-2 rounded-lg border border-stone-300 focus:border-pink-400 focus:outline-none"></textarea>
          <p id="photo-story-count" :class="['mt-1 text-[11px]', storyWordCount > MAX_STORY_WORDS ? 'text-rose-700' : 'text-stone-500']" aria-live="polite">
            {{ storyWordCount }} / {{ MAX_STORY_WORDS }} kata<span v-if="storyTooLong"> — kurangi cerita hingga maksimal {{ MAX_STORY_WORDS }} kata.</span><span v-else-if="storyWordCount > MAX_STORY_WORDS"> — cerita lama tetap tersimpan; jika diubah, maksimal {{ MAX_STORY_WORDS }} kata.</span>
          </p>
        </div>

        <div>
          <label class="block font-semibold text-stone-700 mb-1 flex items-center gap-1"><Wand2 class="w-3.5 h-3.5" /> Filter Warna</label>
          <div class="flex flex-wrap gap-1.5">
            <button v-for="f in filters" :key="f.id" @click="filter = f.id" type="button" :class="['px-3 py-1.5 rounded-xl border text-xs font-medium transition-all', filter === f.id ? 'bg-pink-500 text-white border-pink-500' : 'bg-pink-50 border-pink-200 text-[#806A78] hover:bg-pink-100']">
              {{ f.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
        <button @click="emit('delete')" class="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium">
          <Trash2 class="w-3.5 h-3.5" /> Hapus Foto
        </button>
        <div class="flex gap-2">
          <button @click="emit('close')" class="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800">Batal</button>
          <button @click="handleSave" :disabled="storyTooLong" class="px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>
