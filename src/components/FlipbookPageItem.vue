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
        <span class="font-serif-book italic truncate max-w-[200px] sm:max-w-[250px]">{{ albumTitle }}</span>
        <span class="font-mono text-stone-700 text-xs">Hal. {{ page.pageNumber }}</span>
      </div>
      <h3 v-if="page.title" class="font-serif-book font-bold text-center text-stone-800 text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2">{{ page.title }}</h3>

      <div v-if="page.photos && page.photos.length > 0" class="flex-1">
        <!-- Single Full -->
        <div v-if="page.layout === 'single-full'" class="w-full h-48 sm:h-64 md:h-72 rounded-lg overflow-hidden shadow-xs">
          <ImageSource :src="page.photos[0].url" :class="['w-full h-full object-cover', `filter-${page.photos[0].filter || 'normal'}`]" />
        </div>

        <!-- Polaroid -->
        <div v-else-if="page.layout === 'polaroid'" class="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center pt-1 sm:pt-2">
          <div v-for="ph in page.photos" :key="ph.id" class="polaroid-card p-1.5 sm:p-2 pb-2 sm:pb-3 bg-white border border-stone-200 shadow-md w-40 sm:w-44 text-center text-xs sm:text-sm" :style="{ transform: `rotate(${ph.rotation || 0}deg)` }">
            <div class="w-full h-24 sm:h-32 bg-stone-100 overflow-hidden mb-1">
              <ImageSource :src="ph.url" :class="['w-full h-full object-cover', `filter-${ph.filter || 'normal'}`]" />
            </div>
            <p class="font-handwriting text-stone-800 text-xs sm:text-sm truncate">{{ ph.caption || 'Kenangan Indah' }}</p>
            <span v-if="ph.date" class="text-[8px] sm:text-[9px] text-stone-700 block mt-0.5">{{ ph.date }}</span>
          </div>
        </div>

        <!-- Grid or Split -->
        <div v-else class="grid grid-cols-2 gap-1 sm:gap-2">
          <div v-for="ph in page.photos" :key="ph.id" class="rounded overflow-hidden border border-stone-200 bg-white p-0.5 sm:p-1">
            <div class="w-full h-20 sm:h-28 overflow-hidden rounded">
              <ImageSource :src="ph.url" :class="['w-full h-full object-cover', `filter-${ph.filter || 'normal'}`]" />
            </div>
            <div v-if="ph.caption || ph.date" class="p-0.5 sm:p-1 text-[9px] sm:text-[10px] text-stone-700">
              <p class="font-serif-book italic truncate">{{ ph.caption }}</p>
              <p v-if="ph.date" class="text-[7px] sm:text-[8px] text-stone-700">{{ ph.date }}</p>
            </div>
          </div>
        </div>
      </div>

      <p v-if="page.journalText" class="mt-2 sm:mt-3 text-xs sm:text-sm font-serif-book text-stone-700 leading-relaxed italic bg-amber-50/50 p-2 sm:p-2.5 rounded border border-amber-200/50 line-clamp-3 sm:line-clamp-none">
        "{{ page.journalText }}"
      </p>
    </div>

    <div class="pt-2 border-t border-stone-200 text-center">
      <span class="text-[9px] sm:text-[10px] text-stone-700 font-mono">- {{ page.pageNumber }} -</span>
    </div>
  </div>
</template>
