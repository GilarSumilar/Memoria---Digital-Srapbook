<script setup lang="ts">
import { ref } from 'vue';
import { UploadCloud, Edit3, Trash2, Calendar, Image as ImageIcon } from 'lucide-vue-next';
import type { PhotoItem } from '@/types';
import { compressImage } from '@/utils/compression';
import { uploadImageToSupabase } from '@/utils/supabase';
import ImageSource from '@/components/ImageSource.vue';

const props = defineProps<{
  photo?: PhotoItem;
  albumId: string;
  isPolaroid?: boolean;
}>();

const emit = defineEmits<{
  (e: 'photo-added', photo: PhotoItem): void;
  (e: 'photo-edit', photo: PhotoItem): void;
  (e: 'photo-delete', photoId: string): void;
}>();

const isDragging = ref(false);
const isProcessing = ref(false);
const errorMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Pilih file gambar yang valid.';
    return;
  }
  errorMessage.value = '';
  isProcessing.value = true;
  try {
    const { dataUrl } = await compressImage(file, { maxWidth: 1600, quality: 0.82 });
    let finalUrl = dataUrl;

    const cloudUrl = await uploadImageToSupabase(dataUrl, props.albumId);
    if (cloudUrl) finalUrl = cloudUrl;

    const newPhoto: PhotoItem = {
      id: 'photo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      url: finalUrl,
      caption: '',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      filter: 'normal',
      rotation: props.isPolaroid ? (Math.random() * 4 - 2) : 0,
    };
    emit('photo-added', newPhoto);
  } catch (err) {
    console.error('Image compression failed:', err);
    errorMessage.value = 'Foto tidak dapat dikompres hingga maksimal 1 MB. Coba pilih foto lain.';
  } finally {
    isProcessing.value = false;
  }
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files[0]) processFile(files[0]);
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
    target.value = '';
  }
};
</script>

<template>
  <div class="relative w-full h-full min-h-[140px] flex flex-col group">
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

    <!-- If Photo Exists -->
    <template v-if="photo">
      <!-- Polaroid Design -->
      <div 
        v-if="isPolaroid"
        class="polaroid-card editor-polaroid p-2.5 pb-4 rounded bg-[#FFFEFA] border border-pink-100 flex flex-col h-full cursor-pointer"
        :style="{ transform: `rotate(${photo.rotation || 0}deg)` }"
        @click="emit('photo-edit', photo)"
      >
        <div class="relative w-full flex-1 bg-stone-100 overflow-hidden rounded-xs min-h-[100px]">
          <ImageSource :src="photo.url" :alt="photo.caption" :class="['w-full h-full object-cover', `filter-${photo.filter || 'normal'}`]" />
        </div>
        <div class="pt-2 text-center">
          <p class="font-handwriting text-stone-800 text-sm leading-tight truncate px-1">
            {{ photo.caption || 'Klik untuk caption...' }}
          </p>
          <span v-if="photo.date" class="text-[9px] text-stone-700 font-sans block mt-0.5">{{ photo.date }}</span>
        </div>
      </div>

      <!-- Standard Frame Design -->
      <div 
        v-else 
        class="relative w-full h-full rounded-lg overflow-hidden border border-stone-200/80 bg-stone-100 shadow-xs flex flex-col cursor-pointer"
        @click="emit('photo-edit', photo)"
      >
        <div class="relative w-full flex-1 overflow-hidden">
          <ImageSource :src="photo.url" :alt="photo.caption" :class="['w-full h-full object-cover transition-transform duration-300 group-hover:scale-102', `filter-${photo.filter || 'normal'}`]" />
          
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span class="p-1.5 rounded-full bg-white/90 text-stone-800 shadow"><Edit3 class="w-3.5 h-3.5" /></span>
            <button @click.stop="emit('photo-delete', photo.id)" class="p-1.5 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700"><Trash2 class="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div v-if="photo.caption || photo.date" class="px-2 py-1.5 bg-white/90 border-t border-stone-100 text-[11px] text-stone-800 flex items-center justify-between">
          <span class="truncate font-serif-book italic">{{ photo.caption }}</span>
          <span v-if="photo.date" class="text-[9px] text-stone-700 shrink-0 ml-2 font-mono flex items-center gap-0.5"><Calendar class="w-2.5 h-2.5" />{{ photo.date }}</span>
        </div>
      </div>
    </template>

    <!-- Empty Upload Dropzone -->
    <div 
      v-else
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
      :class="[
        'w-full h-full min-h-[140px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all',
        isDragging ? 'border-amber-600 bg-amber-50/50 scale-101' : 'border-stone-300 hover:border-amber-700 bg-stone-50/50 hover:bg-amber-50/20'
      ]"
    >
      <div v-if="isProcessing" class="flex flex-col items-center gap-2">
        <div class="w-5 h-5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[11px] text-stone-500 font-medium">Mengompres foto...</p>
      </div>
      <div v-else class="flex flex-col items-center gap-1.5 text-stone-400 group-hover:text-amber-800 transition-colors">
        <UploadCloud class="w-6 h-6 stroke-[1.5]" />
        <p class="text-xs font-semibold text-stone-600">Seret & Lepas Foto</p>
        <p class="text-[10px] text-stone-700">atau klik untuk unggah</p>
        <p class="text-[10px] text-stone-500">Ukuran hasil maksimal 1 MB</p>
      </div>
      <p v-if="errorMessage" role="alert" class="mt-2 text-[10px] text-rose-700">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.editor-polaroid {
  position: relative;
}

.editor-polaroid::before {
  position: absolute;
  z-index: 2;
  top: -8px;
  left: 50%;
  width: 68px;
  height: 18px;
  transform: translateX(-50%) rotate(-3deg);
  background: rgb(251 207 232 / 82%);
  clip-path: polygon(2% 0, 100% 7%, 96% 100%, 0 91%);
  content: "";
  pointer-events: none;
}
</style>
