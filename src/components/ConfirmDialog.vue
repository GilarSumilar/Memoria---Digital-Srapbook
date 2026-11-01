<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <Transition name="confirm-dialog">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#5D4654]/45 p-4 backdrop-blur-sm"
      @click.self="emit('cancel')"
      @keydown.esc="emit('cancel')"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        class="w-full max-w-sm overflow-hidden rounded-3xl border border-pink-200 bg-[#FFFDF8] shadow-2xl"
      >
        <div class="flex items-start gap-3 p-5">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <AlertTriangle class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1 pt-0.5">
            <h2 id="confirm-dialog-title" class="font-serif-book text-lg font-bold text-[#704B61]">
              {{ title }}
            </h2>
            <p id="confirm-dialog-message" class="mt-1 break-words text-sm leading-relaxed text-stone-600">
              {{ message }}
            </p>
          </div>
          <button
            type="button"
            aria-label="Batal"
            class="-mr-1 -mt-1 rounded-lg p-1.5 text-stone-400 transition hover:bg-pink-50 hover:text-stone-700"
            @click="emit('cancel')"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="flex justify-end gap-2 border-t border-pink-100 bg-pink-50/60 px-5 py-3">
          <button
            type="button"
            class="rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-[#806A78] transition hover:bg-pink-50"
            @click="emit('cancel')"
          >
            Batal
          </button>
          <button
            type="button"
            class="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-rose-700"
            @click="emit('confirm')"
          >
            {{ confirmLabel || 'Hapus' }}
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 160ms ease;
}

.confirm-dialog-enter-active section,
.confirm-dialog-leave-active section {
  transition: transform 160ms ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-from section,
.confirm-dialog-leave-to section {
  transform: translateY(8px) scale(0.98);
}
</style>
