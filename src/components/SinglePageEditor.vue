<script setup lang="ts">
import { ref } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import type { BookPage, PageLayout, PhotoItem } from '@/types';
import PhotoSlot from './PhotoSlot.vue';

const props = defineProps<{
  page: BookPage;
  albumId: string;
  isRightPage?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-page', page: BookPage): void;
  (e: 'delete-page', pageId: string): void;
  (e: 'photo-edit', item: { photo: PhotoItem; pageId: string }): void;
}>();

const layouts: { id: PageLayout; label: string }[] = [
  { id: 'single', label: '1 Foto Utama' },
  { id: 'polaroid', label: 'Polaroid Vintage' },
  { id: 'story', label: 'Cerita & Jurnal' },
];

const changeLayout = (newLayout: PageLayout) => {
  emit('update-page', { ...props.page, layout: newLayout });
};

const handleAddPhoto = (photo: PhotoItem) => {
  emit('update-page', { ...props.page, photos: [...props.page.photos, photo] });
};

const handleDeletePhoto = (photoId: string) => {
  const updatedPhotos = props.page.photos.filter((p) => p.id !== photoId);
  emit('update-page', { ...props.page, photos: updatedPhotos });
};
</script>

<template>
  <div :class="['paper-texture flex-1 flex flex-col p-5 sm:p-7 bg-[#FFFDF8] relative', isRightPage ? 'md:page-gutter-right' : 'md:page-gutter-left border-b md:border-b-0 md:border-r border-pink-200']">
    <!-- Header -->
    <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-pink-200 text-xs">
      <div class="flex items-center gap-2">
        <span class="font-serif-book font-bold text-stone-700">Hal. {{ page.pageNumber }}</span>
        <select :value="page.layout" @change="changeLayout(($event.target as HTMLSelectElement).value as PageLayout)" class="px-2 py-1 rounded-lg bg-pink-50 border border-pink-200 text-[#806A78] text-xs font-medium">
          <option v-for="l in layouts" :key="l.id" :value="l.id">{{ l.label }}</option>
        </select>
      </div>
      <button @click="emit('delete-page', page.id)" class="text-stone-400 hover:text-rose-600" title="Hapus Halaman">
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Page Title -->
    <input v-model="page.title" @change="emit('update-page', page)" placeholder="Judul Halaman (Opsional)..." class="font-serif-book text-center font-bold text-[#704B61] mb-3 bg-transparent border-b border-transparent hover:border-pink-300 focus:border-pink-400 focus:outline-none text-lg" />

    <!-- Layouts -->
    <div class="flex-1 flex flex-col justify-center min-h-[320px]">
      <div class="flex h-full flex-col gap-3">
        <div class="min-h-[220px] flex-1">
          <PhotoSlot
            :photo="page.photos[0]"
            :album-id="albumId"
            :is-polaroid="page.layout === 'polaroid'"
            @photo-added="handleAddPhoto"
            @photo-edit="emit('photo-edit', { photo: $event, pageId: page.id })"
            @photo-delete="handleDeletePhoto"
          />
        </div>
        <textarea
          v-if="page.layout === 'story'"
          v-model="page.journalText"
          @change="emit('update-page', page)"
          placeholder="Tuliskan catatan momen ini..."
          class="w-full min-h-20 resize-y rounded-xl border border-pink-200 bg-pink-50/40 p-2.5 font-serif-book text-sm leading-relaxed text-[#6F5B67] focus:border-pink-400"
        ></textarea>
      </div>
    </div>
  </div>
</template>
