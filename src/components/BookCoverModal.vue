<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { X, Book, Sparkles, Palette } from 'lucide-vue-next';
import type { Album, CoverColor } from '@/types';
import { COVER_COLORS } from '@/data/coverColors';
import { useAlbumStore } from '@/stores/albumStore';

const props = defineProps<{ isOpen: boolean; albumToEdit?: Album | null }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'updated', id: string): void }>();

const albumStore = useAlbumStore();
const title = ref('');
const subtitle = ref('');
const author = ref('');
const coverColor = ref<CoverColor>('burgundy');
const errorMessage = ref('');
const isSaving = ref(false);
const titleInput = ref<HTMLInputElement | null>(null);

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen || !props.albumToEdit) return;
  title.value = props.albumToEdit.title;
  subtitle.value = props.albumToEdit.subtitle || '';
  author.value = props.albumToEdit.author || '';
  coverColor.value = props.albumToEdit.coverColor;
  errorMessage.value = '';
  nextTick(() => titleInput.value?.focus());
}, { immediate: true });

const currentColor = computed(() => COVER_COLORS.find(c => c.id === coverColor.value) || COVER_COLORS[0]);

const handleSave = async () => {
  if (isSaving.value || !props.albumToEdit) return;
  if (!title.value.trim()) {
    errorMessage.value = 'Judul album tidak boleh kosong.';
    return;
  }
  errorMessage.value = '';
  isSaving.value = true;
  try {
    await albumStore.updateAlbum({
      ...props.albumToEdit,
      title: title.value.trim(),
      subtitle: subtitle.value.trim(),
      author: author.value.trim(),
      coverColor: coverColor.value,
    }, true);
    emit('updated', props.albumToEdit.id);
  } catch (error) {
    console.error('Gagal menyimpan sampul:', error);
    errorMessage.value = 'Sampul belum tersimpan. Periksa penyimpanan browser, lalu coba lagi.';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4654]/45 backdrop-blur-sm" @keydown.esc="!isSaving && emit('close')">
    <form role="dialog" aria-modal="true" aria-labelledby="cover-modal-title" class="bg-[#FFFDF8] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-200 flex flex-col" @submit.prevent="handleSave">
      <div class="px-5 py-3 border-b border-pink-100 flex items-center justify-between bg-pink-50/70">
        <div class="flex items-center gap-2">
          <Book class="w-4 h-4 text-pink-600" />
          <h3 id="cover-modal-title" class="font-serif-book font-bold text-xl text-[#704B61]">Edit Sampul</h3>
        </div>
        <button type="button" :disabled="isSaving" aria-label="Tutup" @click="emit('close')" class="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-50"><X class="w-4 h-4" /></button>
      </div>

      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center text-xs">
        <div class="space-y-2.5">
          <div>
            <label for="cover-title" class="block font-semibold text-stone-700 mb-1">Judul Album</label>
            <input id="cover-title" ref="titleInput" v-model="title" type="text" required class="w-full px-3 py-1.5 rounded-xl border border-pink-200 focus:border-pink-400 focus:outline-none" />
          </div>
          <div>
            <label for="cover-subtitle" class="block font-semibold text-stone-700 mb-1">Subjudul / Deskripsi</label>
            <input id="cover-subtitle" v-model="subtitle" type="text" class="w-full px-3 py-1.5 rounded-xl border border-pink-200 focus:border-pink-400 focus:outline-none" />
          </div>
          <div>
            <label for="cover-author" class="block font-semibold text-stone-700 mb-1">Pembuat</label>
            <input id="cover-author" v-model="author" type="text" class="w-full px-3 py-1.5 rounded-xl border border-pink-200 focus:border-pink-400 focus:outline-none" />
          </div>
          <div>
            <label class="block font-semibold text-[#704B61] mb-1 flex items-center gap-1"><Palette class="w-3.5 h-3.5 text-pink-600" /> Warna Sampul</label>
            <div class="grid grid-cols-4 gap-1.5">
              <button v-for="c in COVER_COLORS" :key="c.id" @click="coverColor = c.id" type="button" :aria-label="`Warna ${c.name}`" :aria-pressed="coverColor === c.id" :title="c.name" :class="['h-8 rounded-lg flex items-center justify-center border border-white shadow-sm', coverColor === c.id ? 'ring-2 ring-pink-400 scale-105' : '']" :style="{ backgroundColor: c.bg }">
                <Sparkles v-if="coverColor === c.id" class="w-3 h-3 text-[#704B61]" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center p-3 bg-pink-50 rounded-xl">
          <div class="relative w-36 h-52 rounded-r-lg rounded-l-xs book-shadow flex flex-col justify-between p-3 text-center select-none" :style="{ backgroundColor: currentColor.bg }">
            <div class="absolute left-0 top-0 bottom-0 w-2.5 bg-pink-900/15"></div>
            <div class="pt-1">
              <p class="text-[9px] uppercase font-serif-book tracking-widest text-[#8D667B]">Photo Album</p>
            </div>
            <div class="my-auto px-1">
              <h4 class="font-serif-book font-bold text-lg text-[#704B61] leading-tight line-clamp-3">{{ title || 'Judul' }}</h4>
              <p v-if="subtitle" class="text-xs mt-1 text-[#806A78] line-clamp-2 italic">{{ subtitle }}</p>
            </div>
            <p class="text-[8px] text-[#8D667B] font-handwriting">{{ author ? `Oleh: ${author}` : '' }}</p>
          </div>
        </div>
      </div>

      <p v-if="errorMessage" role="alert" class="px-5 pb-3 text-xs text-rose-700">{{ errorMessage }}</p>
      <div class="px-5 py-2.5 bg-pink-50/70 border-t border-pink-100 flex justify-end gap-2">
        <button type="button" :disabled="isSaving" @click="emit('close')" class="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 disabled:opacity-50">Batal</button>
        <button type="submit" :disabled="isSaving" class="px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">{{ isSaving ? 'Menyimpan...' : 'Simpan' }}</button>
      </div>
    </form>
  </div>
</template>
