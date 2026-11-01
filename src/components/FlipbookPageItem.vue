<script setup lang="ts">
import type { BookPage } from '@/types';
import ImageSource from '@/components/ImageSource.vue';

defineProps<{
  page: BookPage;
  albumTitle: string;
}>();
</script>

<template>
  <div class="flip-page bg-[#FAF8F5] p-6 sm:p-7 flex flex-col justify-between border-r border-stone-200">
    <div>
      <div class="flex items-center justify-between pb-2 mb-3 border-b border-stone-200 text-xs text-stone-500">
        <span class="font-serif-book italic truncate max-w-[200px]">{{ albumTitle }}</span>
        <span class="font-mono text-stone-700">Hal. {{ page.pageNumber }}</span>
      </div>
      <h3 v-if="page.title" class="font-serif-book font-bold text-center text-stone-800 text-base mb-3">{{ page.title }}</h3>

      <div v-if="page.photos && page.photos.length > 0" class="flex-1">
        <!-- Single Full -->
        <div v-if="page.layout === 'single-full'" class="w-full h-72 rounded-lg overflow-hidden shadow-xs">
          <ImageSource :src="page.photos[0].url" :class="['w-full h-full object-cover', `filter-${page.photos[0].filter || 'normal'}`]" />
        </div>

        <!-- Polaroid -->
        <div v-else-if="page.layout === 'polaroid'" class="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
          <div v-for="ph in page.photos" :key="ph.id" class="polaroid-card p-2 pb-3 bg-white border border-stone-200 shadow-md w-44 text-center" :style="{ transform: `rotate(${ph.rotation || 0}deg)` }">
            <div class="w-full h-32 bg-stone-100 overflow-hidden mb-1.5">
              <ImageSource :src="ph.url" :class="['w-full h-full object-cover', `filter-${ph.filter || 'normal'}`]" />
            </div>
            <p class="font-handwriting text-stone-800 text-sm truncate">{{ ph.caption || 'Kenangan Indah' }}</p>
            <span v-if="ph.date" class="text-[9px] text-stone-700 block mt-0.5">{{ ph.date }}</span>
          </div>
        </div>

        <!-- Grid or Split -->
        <div v-else class="grid grid-cols-2 gap-2">
          <div v-for="ph in page.photos" :key="ph.id" class="rounded overflow-hidden border border-stone-200 bg-white p-1">
            <div class="w-full h-28 overflow-hidden rounded">
              <ImageSource :src="ph.url" :class="['w-full h-full object-cover', `filter-${ph.filter || 'normal'}`]" />
            </div>
            <div v-if="ph.caption || ph.date" class="p-1 text-[10px] text-stone-700">
              <p class="font-serif-book italic truncate">{{ ph.caption }}</p>
              <p v-if="ph.date" class="text-[8px] text-stone-700">{{ ph.date }}</p>
            </div>
          </div>
        </div>
      </div>

      <p v-if="page.journalText" class="mt-3 text-xs font-serif-book text-stone-700 leading-relaxed italic bg-amber-50/50 p-2.5 rounded border border-amber-200/50">
        "{{ page.journalText }}"
      </p>
    </div>

    <div class="pt-2 border-t border-stone-200 text-center">
      <span class="text-[10px] text-stone-700 font-mono">- {{ page.pageNumber }} -</span>
    </div>
  </div>
</template>
