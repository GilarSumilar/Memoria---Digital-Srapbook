<script setup lang="ts">
import { ref, watch } from "vue";
import { resolveSupabaseImageUrl } from "@/utils/supabase";

const props = defineProps<{
  src: string;
  alt?: string;
  loading?: "eager" | "lazy";
}>();

const resolvedSrc = ref("");
let requestId = 0;

watch(
  () => props.src,
  async (src) => {
    const currentRequest = ++requestId;
    try {
      const nextSrc = await resolveSupabaseImageUrl(src);
      if (currentRequest === requestId) resolvedSrc.value = nextSrc;
    } catch (error) {
      console.error("Gagal memuat foto cloud:", error);
      if (currentRequest === requestId) resolvedSrc.value = "";
    }
  },
  { immediate: true },
);
</script>

<template>
  <img v-if="resolvedSrc" :src="resolvedSrc" :alt="alt || ''" :loading="loading" />
</template>
