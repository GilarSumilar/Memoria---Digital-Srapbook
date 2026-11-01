<script setup lang="ts">
import { ref } from 'vue';
import { BookOpen } from 'lucide-vue-next';
import type { BookPage, PhotoItem } from '@/types';
import SinglePageEditor from './SinglePageEditor.vue';
import PhotoEditModal from './PhotoEditModal.vue';

const props = defineProps<{
  leftPage?: BookPage;
  rightPage?: BookPage;
  albumId: string;
}>();

const emit = defineEmits<{
  (e: 'update-page', page: BookPage): void;
  (e: 'delete-page', pageId: string): void;
}>();

const editingPhoto = ref<{ photo: PhotoItem; pageId: string } | null>(null);

const handlePhotoEdit = (item: { photo: PhotoItem; pageId: string }) => {
  editingPhoto.value = item;
};

const handleSavePhotoEdit = (patch: Partial<PhotoItem>) => {
  if (!editingPhoto.value) return;
  const { photo, pageId } = editingPhoto.value;
  const targetPage = props.leftPage?.id === pageId ? props.leftPage : props.rightPage;
  if (!targetPage) return;

  const updatedPhotos = targetPage.photos.map(p => p.id === photo.id ? { ...p, ...patch } : p);
  emit('update-page', { ...targetPage, photos: updatedPhotos });
};

const handleDeletePhoto = () => {
  if (!editingPhoto.value) return;
  const { photo, pageId } = editingPhoto.value;
  const targetPage = props.leftPage?.id === pageId ? props.leftPage : props.rightPage;
  if (!targetPage) return;

  const updatedPhotos = targetPage.photos.filter(p => p.id !== photo.id);
  emit('update-page', { ...targetPage, photos: updatedPhotos });
  editingPhoto.value = null;
};
</script>

<template>
  <div class="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row scrapbook-paper rounded-2xl book-spread-shadow border border-pink-200 overflow-hidden min-h-[560px]">
    <!-- Book Center Fold / Spine Shading -->
    <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -ml-4 z-20 pointer-events-none bg-gradient-to-r from-pink-900/10 via-pink-900/5 to-pink-900/10"></div>

    <!-- LEFT PAGE -->
    <SinglePageEditor 
      v-if="leftPage"
      :page="leftPage"
      :album-id="albumId"
      :is-right-page="false"
      @update-page="emit('update-page', $event)"
      @delete-page="emit('delete-page', $event)"
      @photo-edit="handlePhotoEdit"
    />
    <div v-else class="flex-1 flex flex-col items-center justify-center p-8 bg-[#FFFDF8] md:page-gutter-left border-r border-pink-200 text-[#B596A7]">
      <BookOpen class="w-8 h-8 stroke-[1.5] mb-2" />
      <p class="text-xs">Sampul Dalam (Awal)</p>
    </div>

    <!-- RIGHT PAGE -->
    <SinglePageEditor 
      v-if="rightPage"
      :page="rightPage"
      :album-id="albumId"
      :is-right-page="true"
      @update-page="emit('update-page', $event)"
      @delete-page="emit('delete-page', $event)"
      @photo-edit="handlePhotoEdit"
    />
    <div v-else class="flex-1 flex flex-col items-center justify-center p-8 bg-[#FFFDF8] md:page-gutter-right text-[#B596A7]">
      <BookOpen class="w-8 h-8 stroke-[1.5] mb-2" />
      <p class="text-xs">Sampul Dalam (Akhir)</p>
    </div>

    <!-- Photo Edit Modal -->
    <PhotoEditModal 
      :is-open="!!editingPhoto"
      :photo="editingPhoto?.photo || null"
      @close="editingPhoto = null"
      @save="handleSavePhotoEdit"
      @delete="handleDeletePhoto"
    />
  </div>
</template>
