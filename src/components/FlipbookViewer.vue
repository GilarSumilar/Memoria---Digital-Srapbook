<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ArrowLeft, ArrowRight, Edit3, Plus, Sparkles } from "lucide-vue-next";
import type { Album, BookPage, PhotoItem } from "@/types";
import { COVER_COLORS } from "@/data/coverColors";
import { useAlbumStore } from "@/stores/albumStore";
import { useConfigStore } from "@/stores/configStore";
import ImageSource from "@/components/ImageSource.vue";
import { playPageFlipSound } from "@/utils/audio";
import BookCoverModal from "./BookCoverModal.vue";
import MemoryFormModal from "./MemoryFormModal.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = defineProps<{ album: Album }>();
const albumStore = useAlbumStore();
const configStore = useConfigStore();
configStore.initSound();

const currentSpread = ref(0);
const transitionDirection = ref<"forward" | "backward">("forward");
const isCoverTransition = ref(false);
const isMemoryModalOpen = ref(false);
const isCoverModalOpen = ref(false);
const initialPageId = ref<string>();
const notice = ref("");
const flippedPhotoIds = ref<string[]>([]);
const photoPendingDeletion = ref<{ page: BookPage; photo: PhotoItem } | null>(
  null,
);

const totalSpreads = computed(() => Math.ceil(props.album.pages.length / 2));
const currentPages = computed<(BookPage | undefined)[]>(() => {
  if (currentSpread.value === 0) return [];
  const firstIndex = (currentSpread.value - 1) * 2;
  return [props.album.pages[firstIndex], props.album.pages[firstIndex + 1]];
});
const coverColor = computed(
  () =>
    COVER_COLORS.find((color) => color.id === props.album.coverColor)?.bg ??
    COVER_COLORS[0].bg,
);

watch(
  () => props.album.id,
  () => {
    transitionDirection.value = "backward";
    isCoverTransition.value = false;
    currentSpread.value = 0;
    flippedPhotoIds.value = [];
  },
);

const goToSpread = (index: number, playSound = true) => {
  const nextSpread = Math.max(0, Math.min(index, totalSpreads.value));
  if (nextSpread === currentSpread.value) return;

  if (playSound && configStore.soundEnabled) playPageFlipSound();
  isCoverTransition.value = (currentSpread.value === 0) !== (nextSpread === 0);
  transitionDirection.value =
    nextSpread >= currentSpread.value ? "forward" : "backward";
  currentSpread.value = nextSpread;
  flippedPhotoIds.value = [];
};
const nextSpread = () => goToSpread(currentSpread.value + 1);
const previousSpread = () => goToSpread(currentSpread.value - 1);

const togglePhoto = (photoId: string) => {
  flippedPhotoIds.value = flippedPhotoIds.value.includes(photoId)
    ? flippedPhotoIds.value.filter((id) => id !== photoId)
    : [...flippedPhotoIds.value, photoId];
};

const handleDeletePhoto = (page: BookPage, photo: PhotoItem) => {
  photoPendingDeletion.value = { page, photo };
};

const confirmDeletePhoto = async () => {
  if (!photoPendingDeletion.value) return;
  const { page, photo } = photoPendingDeletion.value;
  await albumStore.deletePhoto(props.album.id, page.id, photo.id);
  flippedPhotoIds.value = flippedPhotoIds.value.filter((id) => id !== photo.id);
  photoPendingDeletion.value = null;
};

const openMemoryForm = (page?: BookPage | "__new__") => {
  initialPageId.value =
    page === "__new__" ? page : page?.photos.length === 0 ? page.id : undefined;
  isMemoryModalOpen.value = true;
};

const handleSaveMemory = async ({
  pageId,
  photo,
}: {
  pageId: string;
  photo: PhotoItem;
}) => {
  notice.value = "";
  try {
    let targetPage: BookPage | undefined;
    if (pageId === "__new__") {
      targetPage = await albumStore.addPage(props.album.id, "polaroid");
    } else {
      targetPage = props.album.pages.find((page) => page.id === pageId);
    }

    if (!targetPage) throw new Error("Lembar tujuan tidak ditemukan.");
    await albumStore.addPhotoToPage(props.album.id, targetPage.id, photo);
    const updatedSpread = Math.floor((targetPage.pageNumber - 1) / 2) + 1;
    goToSpread(updatedSpread, false);
  } catch (error) {
    console.error("Gagal menyimpan kenangan:", error);
    notice.value =
      "Kenangan belum tersimpan. Periksa ruang penyimpanan browser, lalu coba lagi.";
  }
};
</script>

<template>
  <section
    class="memoria-reader mx-auto w-full max-w-6xl rounded-[2rem] px-3 py-5 sm:px-7 sm:py-8"
  >
    <div
      class="mx-auto mb-5 flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <div class="text-center sm:text-left">
        <p class="font-handwriting text-xl leading-none text-pink-600">
          setiap halaman punya cerita
        </p>
      </div>
      <!-- <button
        class="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-pink-600"
        @click="openMemoryForm()"
      >
        <Plus class="h-4 w-4" />
        Tambah Kenangan
      </button> -->
    </div>

    <p
      v-if="notice"
      role="alert"
      class="mx-auto mb-3 max-w-5xl rounded-xl bg-rose-50 px-4 py-2 text-center text-xs text-rose-700"
    >
      {{ notice }}
    </p>

    <div
      class="book-stage mx-auto max-w-5xl"
      :class="[
        `book-stage-${transitionDirection}`,
        { 'book-cover-transition': isCoverTransition },
      ]"
    >
      <Transition name="book">
        <div v-if="currentSpread === 0" key="cover" class="cover-spread">
          <div class="closed-book">
            <div class="cover-backface"></div>
            <div class="cover-front" :style="{ backgroundColor: coverColor }">
              <div class="cover-spine"></div>
              <div class="cover-decoration">
                <span class="cover-flower">✿</span>
                <p class="cover-label">MY LITTLE MEMORY BOOK</p>
                <div class="cover-title-wrap">
                  <h3 class="cover-title">{{ album.title }}</h3>
                  <p v-if="album.subtitle" class="cover-subtitle">
                    {{ album.subtitle }}
                  </p>
                </div>
                <p class="cover-author">
                  {{ album.author || "Kenangan tersimpan di sini" }}
                </p>
                <span class="cover-flower cover-flower-bottom">♡</span>
              </div>
              <button
                type="button"
                class="edit-cover-button"
                @click="isCoverModalOpen = true"
              >
                <Edit3 class="h-3.5 w-3.5" /> Edit Sampul
              </button>
              <button
                class="page-corner corner-next"
                aria-label="Buka halaman berikutnya"
                @click="nextSpread"
              >
                <span></span><ArrowRight class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          :key="currentSpread"
          class="open-book"
          aria-label="Lembar album terbuka"
        >
          <article
            v-for="(page, index) in currentPages"
            :key="page?.id ?? `empty-${currentSpread}-${index}`"
            class="paper-page"
          >
            <div class="paper-front">
              <template v-if="page">
                <div class="paper-heading">
                  <span class="font-handwriting text-sm text-pink-600">{{
                    album.title
                  }}</span>
                  <span class="page-number">{{ page.pageNumber }}</span>
                </div>
                <h3 class="page-title">
                  {{ page.title || "Momen kecil, kenangan besar" }}
                </h3>

                <div v-if="page.photos[0]" class="polaroid-scene">
                  <div
                    class="polaroid-card"
                    :class="{
                      'is-flipped': flippedPhotoIds.includes(page.photos[0].id),
                    }"
                    :style="{
                      '--photo-rotation': `${page.photos[0].rotation ?? (index === 0 ? -2 : 2)}deg`,
                    }"
                    role="button"
                    tabindex="0"
                    :aria-label="`Balik kartu ${page.photos[0].caption || 'kenangan'}`"
                    @click="togglePhoto(page.photos[0].id)"
                    @keydown.enter.prevent="togglePhoto(page.photos[0].id)"
                    @keydown.space.prevent="togglePhoto(page.photos[0].id)"
                  >
                    <div class="polaroid-inner">
                      <div class="polaroid-face polaroid-front">
                        <span class="washi-tape"></span>
                        <ImageSource
                          :src="page.photos[0].url"
                          :alt="page.photos[0].caption || 'Foto kenangan'"
                          :class="`filter-${page.photos[0].filter || 'normal'}`"
                          loading="lazy"
                        />
                        <p class="polaroid-caption">
                          {{ page.photos[0].caption || "Kenangan manis" }}
                        </p>
                        <span
                          v-if="page.photos[0].date"
                          class="polaroid-date"
                          >{{ page.photos[0].date }}</span
                        >
                      </div>
                      <div class="polaroid-face polaroid-back">
                        <span class="back-heart">♡</span>
                        <h4>
                          {{ page.photos[0].caption || "Kenangan manis" }}
                        </h4>
                        <p v-if="page.photos[0].date" class="back-date">
                          {{ page.photos[0].date }}
                        </p>
                        <p
                          class="back-story"
                          tabindex="0"
                          @click.stop
                          @keydown.stop
                        >
                          {{
                            page.photos[0].story ||
                            page.journalText ||
                            "Simpan cerita kecil ini agar bisa dikenang kembali."
                          }}
                        </p>
                        <button
                          class="delete-memory"
                          @click.stop="handleDeletePhoto(page, page.photos[0])"
                        >
                          🗑️ Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  v-else
                  class="empty-memory"
                  @click="openMemoryForm(page)"
                >
                  <Sparkles class="h-6 w-6 text-pink-400" />
                  <span>Tambahkan ke lembar kosong</span>
                  <span class="font-handwriting text-sm text-pink-500"
                    >klik untuk memilih foto</span
                  >
                </button>

                <p
                  v-if="page.journalText && page.photos[0]?.story"
                  class="page-note"
                >
                  {{ page.journalText }}
                </p>
                <div class="page-footer">
                  <span>♡</span> {{ page.pageNumber }} <span>♡</span>
                </div>
                <button
                  v-if="index === 0"
                  class="page-corner corner-prev"
                  :aria-label="
                    currentSpread === 1
                      ? 'Kembali ke sampul'
                      : 'Buka halaman sebelumnya'
                  "
                  :title="
                    currentSpread === 1
                      ? 'Kembali ke sampul'
                      : 'Buka halaman sebelumnya'
                  "
                  @click="previousSpread"
                >
                  <span></span><ArrowLeft class="h-4 w-4" />
                </button>
                <button
                  v-else
                  class="page-corner corner-next"
                  aria-label="Buka halaman berikutnya"
                  :disabled="currentSpread >= totalSpreads"
                  @click="nextSpread"
                >
                  <span></span><ArrowRight class="h-4 w-4" />
                </button>
              </template>
              <button
                v-else
                class="empty-memory"
                @click="openMemoryForm('__new__')"
              >
                <Sparkles class="h-6 w-6 text-pink-400" />
                <span>Tambahkan ke lembar kosong</span>
                <span class="font-handwriting text-sm text-pink-500"
                  >klik untuk membuat lembar baru</span
                >
              </button>
            </div>
            <div class="paper-back" aria-hidden="true"></div>
          </article>
        </div>
      </Transition>
    </div>

    <p class="mt-6 text-center font-handwriting text-sm text-[#9b796d]">
      Klik sudut lembar untuk membalik halaman
    </p>

    <MemoryFormModal
      :is-open="isMemoryModalOpen"
      :pages="album.pages"
      :album-id="album.id"
      :initial-page-id="initialPageId"
      @close="isMemoryModalOpen = false"
      @save="handleSaveMemory"
    />
    <BookCoverModal
      :is-open="isCoverModalOpen"
      :album-to-edit="album"
      @close="isCoverModalOpen = false"
      @updated="isCoverModalOpen = false"
    />
    <ConfirmDialog
      :is-open="photoPendingDeletion !== null"
      title="Hapus foto?"
      :message="`Foto '${photoPendingDeletion?.photo.caption || 'Kenangan'}' akan dihapus dari album.`"
      confirm-label="Hapus foto"
      @confirm="confirmDeletePhoto"
      @cancel="photoPendingDeletion = null"
    />
  </section>
</template>

<style scoped>
.memoria-reader {
  background:
    radial-gradient(ellipse at 12% 0%, rgb(252 231 243 / 85%), transparent 42%),
    radial-gradient(
      ellipse at 100% 100%,
      rgb(209 250 229 / 62%),
      transparent 42%
    ),
    #fffaf7;
}

.book-stage {
  display: grid;
  grid-template-areas: "book";
  height: 490px;
  min-height: 490px;
  perspective: 1800px;
  perspective-origin: center;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.book-stage > .book-enter-active,
.book-stage > .book-leave-active {
  grid-area: book;
}

.book-enter-active,
.book-leave-active {
  transition:
    opacity 240ms ease,
    transform 380ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.book-enter-from,
.book-leave-to {
  opacity: 0;
}

.book-leave-active {
  z-index: 2;
  pointer-events: none;
}

.book-enter-active {
  z-index: 1;
}

.book-stage:not(.book-cover-transition) .open-book.book-enter-active,
.book-stage:not(.book-cover-transition) .open-book.book-leave-active {
  transition: none;
  animation: spread-transition-clock 760ms linear both;
}

.book-stage:not(.book-cover-transition) .open-book.book-enter-from,
.book-stage:not(.book-cover-transition) .open-book.book-leave-to {
  transform: none;
  opacity: 1;
}

.book-stage:not(.book-cover-transition) .open-book.book-leave-active {
  z-index: 2;
  overflow: visible;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.book-stage:not(.book-cover-transition)
  .open-book.book-leave-active
  .paper-page {
  animation-duration: 760ms;
  animation-fill-mode: both;
}

.book-stage-forward:not(.book-cover-transition)
  .open-book.book-leave-active
  .paper-page:last-child {
  z-index: 3;
  transform-origin: left center;
  animation-name: page-turn-forward;
}

.book-stage-backward:not(.book-cover-transition)
  .open-book.book-leave-active
  .paper-page:first-child {
  z-index: 3;
  transform-origin: right center;
  animation-name: page-turn-backward;
}

.book-stage-forward .open-book.book-enter-from {
  transform: translateX(14px);
}

.book-stage-forward .open-book.book-leave-to {
  transform: translateX(-10px);
}

.book-stage-backward .open-book.book-leave-to {
  transform: translateX(10px);
}

.book-stage-backward .cover-spread.book-enter-from,
.book-stage-backward .open-book.book-enter-from {
  transform: translateX(-12px);
}

.book-cover-transition .cover-spread {
  transform: none;
  opacity: 1;
}

.book-cover-transition .cover-spread.book-leave-active,
.book-cover-transition .cover-spread.book-enter-active {
  z-index: 3;
  pointer-events: none;
  transition: none;
}

.book-cover-transition .open-book.book-enter-active,
.book-cover-transition .open-book.book-leave-active {
  z-index: 1;
  transition:
    transform 820ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 820ms ease;
}

.book-stage-forward.book-cover-transition
  .cover-spread.book-leave-active
  .closed-book {
  transform-origin: left center;
  animation: cover-opening 820ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.book-stage-backward.book-cover-transition
  .cover-spread.book-enter-active
  .closed-book {
  transform-origin: left center;
  animation: cover-closing 820ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.book-stage-forward.book-cover-transition .open-book.book-enter-from,
.book-stage-backward.book-cover-transition .open-book.book-leave-to {
  transform: scaleX(0.5);
  opacity: 0.7;
}

.book-stage-forward.book-cover-transition .open-book.book-enter-active,
.book-stage-backward.book-cover-transition .open-book.book-leave-active {
  transform-origin: center;
}

.cover-spread {
  position: relative;
  width: 50%;
  min-height: 480px;
  justify-self: center;
}

.closed-book {
  position: relative;
  width: 100%;
  min-height: 480px;
  transform-style: preserve-3d;
}

.cover-front,
.cover-backface {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 9px solid #f4a8c8;
  border-radius: 12px 25px 25px 12px;
  backface-visibility: hidden;
}

.cover-front {
  display: flex;
  align-items: stretch;
  justify-content: center;
  box-shadow:
    12px 15px 35px rgb(112 75 97 / 18%),
    inset 5px 0 8px rgb(255 255 255 / 24%);
  background-image:
    repeating-linear-gradient(
      45deg,
      rgb(255 255 255 / 5%) 0 2px,
      transparent 2px 6px
    ),
    linear-gradient(110deg, transparent 65%, rgb(112 75 97 / 10%));
}

.cover-backface {
  transform: rotateY(180deg);
  border-color: #e8b8cd;
  border-radius: 25px 12px 12px 25px;
  background:
    linear-gradient(90deg, rgb(75 48 32 / 16%), transparent 14%),
    repeating-linear-gradient(
      0deg,
      transparent 0 27px,
      rgb(244 114 182 / 8%) 27px 28px
    ),
    #fffaf3;
  box-shadow: inset -8px 0 14px -10px rgb(75 48 32 / 30%);
}

.cover-spine {
  position: absolute;
  z-index: 1;
  inset: 0 auto 0 25px;
  width: 15px;
  border-right: 1px solid rgb(255 255 255 / 42%);
  border-left: 1px solid rgb(112 75 97 / 16%);
  background: linear-gradient(
    90deg,
    rgb(112 75 97 / 20%),
    transparent,
    rgb(255 255 255 / 38%)
  );
}

.cover-decoration {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin: 16px;
  padding: 28px 30px;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 5px 15px 15px 5px;
  color: #704b61;
  text-align: center;
}

.cover-flower {
  color: #d977a3;
  font-size: 34px;
  line-height: 1;
}

.cover-flower-bottom {
  font-size: 30px;
}

.cover-label {
  margin-top: 20px;
  color: #8d5d76;
  font-size: 10px;
  letter-spacing: 0.24em;
}

.cover-title-wrap {
  max-width: 90%;
}

.cover-title {
  color: #704b61;
  font-family: var(--font-serif);
  font-size: clamp(1.7rem, 5vw, 2.7rem);
  font-style: italic;
  line-height: 1.1;
  text-shadow: 0 1px 2px rgb(255 255 255 / 55%);
}

.cover-subtitle {
  margin-top: 12px;
  color: #8d667b;
  font-family: var(--font-handwriting);
  font-size: 1.1rem;
}

.cover-author {
  color: #8d667b;
  font-family: var(--font-handwriting);
  font-size: 1.2rem;
}

.edit-cover-button {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 999px;
  background: rgb(255 255 255 / 72%);
  padding: 7px 10px;
  color: #704b61;
  font-size: 11px;
  font-weight: 600;
  transition: background 160ms ease;
}

.edit-cover-button:hover {
  background: rgb(255 255 255 / 92%);
}

.open-book {
  display: grid;
  width: 100%;
  min-height: 480px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid #e8c9bd;
  border-radius: 14px;
  background: #fffdf6;
  box-shadow: 0 18px 40px rgb(75 48 32 / 20%);
  transform-style: preserve-3d;
}

.paper-page {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 480px;
  flex-direction: column;
  align-items: center;
  transform-style: preserve-3d;
}

.paper-front {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 22px clamp(12px, 3vw, 34px) 25px;
  backface-visibility: hidden;
  background-color: #fffdf6;
  background-image:
    linear-gradient(rgb(244 114 182 / 10%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(244 114 182 / 4%) 1px, transparent 1px);
  background-position:
    0 44px,
    20px 0;
  background-size:
    100% 28px,
    100% 100%;
  box-shadow: inset 0 0 0 1px rgb(232 201 189 / 45%);
}

.paper-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  background:
    linear-gradient(90deg, rgb(98 68 55 / 12%), transparent 18%),
    repeating-linear-gradient(
      0deg,
      transparent 0 27px,
      rgb(244 114 182 / 8%) 27px 28px
    ),
    #fffaf3;
  box-shadow: inset 0 0 0 1px rgb(232 201 189 / 50%);
}

.paper-page + .paper-page {
  border-left: 1px solid #f1d8dd;
}

.paper-page:first-child .paper-front {
  box-shadow:
    inset -18px 0 24px -24px #754b40,
    inset 0 0 0 1px rgb(232 201 189 / 45%);
}

.paper-page + .paper-page .paper-front {
  box-shadow:
    inset 18px 0 24px -24px #754b40,
    inset 0 0 0 1px rgb(232 201 189 / 45%);
}

.paper-heading {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(244 114 182 / 24%);
  padding-bottom: 8px;
}

.page-number {
  color: #ba8c7c;
  font-family: var(--font-handwriting);
  font-size: 15px;
}

.page-title {
  margin-top: 16px;
  color: #3a2e2b;
  font-family: var(--font-serif);
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  font-style: italic;
  text-align: center;
}

.polaroid-scene {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0 24px;
  perspective: 1100px;
}

.polaroid-card {
  width: min(100%, 260px);
  height: 300px;
  transform: rotate(var(--photo-rotation));
  transition: transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.polaroid-card:hover,
.polaroid-card.is-flipped {
  transform: rotate(0deg) translateY(-4px) scale(1.025);
}

.polaroid-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 650ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.polaroid-card.is-flipped .polaroid-inner {
  transform: rotateY(180deg);
}

.polaroid-face {
  position: absolute;
  inset: 0;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  backface-visibility: hidden;
  border: 1px solid #f0e9e3;
  background: white;
  box-shadow: 0 9px 22px rgb(58 46 43 / 17%);
}

.polaroid-front {
  padding: 13px 13px 12px;
}

.polaroid-front img {
  width: 100%;
  height: 218px;
  border-radius: 2px;
  background: #f5e9e4;
  object-fit: cover;
}

.washi-tape {
  position: absolute;
  z-index: 1;
  top: -3px;
  left: 50%;
  width: 72px;
  height: 20px;
  transform: translateX(-50%) rotate(-3deg);
  background: rgb(255 209 220 / 79%);
  clip-path: polygon(0 0, 100% 0, 96% 100%, 4% 91%);
}

.polaroid-caption {
  width: 100%;
  margin-top: 9px;
  overflow: hidden;
  color: #3a2e2b;
  font-family: var(--font-handwriting);
  font-size: 20px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.polaroid-date {
  margin-top: 2px;
  color: #8d746b;
  font-family: var(--font-note);
  font-size: 9px;
}

.polaroid-back {
  justify-content: center;
  padding: 20px;
  transform: rotateY(180deg);
  background:
    repeating-linear-gradient(
      0deg,
      transparent 0 25px,
      rgb(244 114 182 / 10%) 25px 26px
    ),
    #fff8f4;
  text-align: center;
}

.back-heart {
  color: #f472b6;
  font-size: 27px;
}

.polaroid-back h4 {
  margin-top: 5px;
  color: #3a2e2b;
  font-family: var(--font-note);
  font-size: 24px;
  line-height: 1.1;
}

.back-date {
  margin-top: 3px;
  color: #a17669;
  font-size: 10px;
}

.back-story {
  width: 100%;
  min-height: 0;
  max-height: 82px;
  margin-top: 9px;
  overflow-y: auto;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  color: #65504a;
  font-family: var(--font-handwriting);
  font-size: 16px;
  line-height: 1.15;
}

.delete-memory {
  margin-top: 12px;
  border-radius: 999px;
  background: #ffe5e5;
  padding: 7px 12px;
  color: #a94450;
  font-size: 10px;
  font-weight: 700;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.delete-memory:hover {
  background: #ff4d4d;
  color: white;
}

.empty-memory {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #bd8c99;
  font-family: var(--font-handwriting);
  font-size: 17px;
}

.empty-memory {
  min-height: 280px;
  margin: 14px 0;
  border: 1px dashed rgb(244 114 182 / 36%);
  border-radius: 12px;
  background: rgb(255 255 255 / 42%);
}

.page-note {
  max-width: 90%;
  margin: 0 auto 12px;
  color: #795c51;
  font-family: var(--font-note);
  font-size: 15px;
  text-align: center;
}

.page-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  color: #bd8c99;
  font-family: var(--font-handwriting);
  font-size: 13px;
}

.page-corner {
  position: absolute;
  z-index: 2;
  bottom: 0;
  display: flex;
  width: 56px;
  height: 56px;
  align-items: flex-end;
  justify-content: flex-end;
  overflow: hidden;
  padding: 0 7px 6px;
  color: #cf7796;
  transition:
    filter 180ms ease,
    transform 180ms ease;
}

.page-corner > span {
  position: absolute;
  inset: auto;
  width: 0;
  height: 0;
  border-style: solid;
  border-color: transparent #ffd1dc #f4b4c8 transparent;
  border-width: 0 0 47px 47px;
  filter: drop-shadow(-2px -2px 3px rgb(83 55 56 / 10%));
  transition:
    border-width 200ms ease,
    filter 200ms ease;
}

.page-corner:hover > span {
  border-width: 0 0 60px 60px;
  filter: drop-shadow(-4px -4px 5px rgb(83 55 56 / 20%));
}

.page-corner svg {
  position: relative;
  z-index: 1;
}

.page-corner:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.corner-next {
  right: 0;
  border-radius: 100% 0 0;
}

.corner-prev {
  left: 0;
  transform: scaleX(-1);
  border-radius: 0 100% 0 0;
}

.corner-prev svg {
  transform: scaleX(-1);
}

.cover-spread .page-corner {
  right: 0;
  bottom: 0;
  color: #704b61;
}

.cover-spread .page-corner > span {
  border-color: transparent #fbcfe8 #f4a8c8 transparent;
}

@keyframes page-turn-forward {
  0% {
    transform: rotateY(0);
    box-shadow: 0 0 0 rgb(58 46 43 / 0%);
  }
  18% {
    transform: rotateY(-12deg) translateZ(2px);
    box-shadow: 3px 4px 12px rgb(58 46 43 / 15%);
  }
  52% {
    transform: rotateY(-105deg) translateZ(4px);
    box-shadow: 8px 5px 16px rgb(58 46 43 / 22%);
  }
  82% {
    transform: rotateY(-170deg) translateZ(2px);
    box-shadow: 2px 3px 8px rgb(58 46 43 / 12%);
  }
  100% {
    transform: rotateY(-180deg);
    box-shadow: 0 0 0 rgb(58 46 43 / 0%);
  }
}

@keyframes page-turn-backward {
  0% {
    transform: rotateY(0);
    box-shadow: 0 0 0 rgb(58 46 43 / 0%);
  }
  18% {
    transform: rotateY(12deg) translateZ(2px);
    box-shadow: -3px 4px 12px rgb(58 46 43 / 15%);
  }
  52% {
    transform: rotateY(105deg) translateZ(4px);
    box-shadow: -8px 5px 16px rgb(58 46 43 / 22%);
  }
  82% {
    transform: rotateY(170deg) translateZ(2px);
    box-shadow: -2px 3px 8px rgb(58 46 43 / 12%);
  }
  100% {
    transform: rotateY(180deg);
    box-shadow: 0 0 0 rgb(58 46 43 / 0%);
  }
}

@keyframes spread-transition-clock {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.999;
  }
}

@keyframes cover-opening {
  0% {
    transform: translateX(0) rotateY(0);
    box-shadow: 12px 15px 35px rgb(112 75 97 / 18%);
  }
  45% {
    transform: translateX(22%) rotateY(-76deg);
    box-shadow: 16px 15px 28px rgb(112 75 97 / 20%);
  }
  100% {
    transform: translateX(50%) rotateY(-180deg);
    box-shadow: 2px 8px 18px rgb(112 75 97 / 12%);
  }
}

@keyframes cover-closing {
  0% {
    transform: translateX(50%) rotateY(-180deg);
  }
  55% {
    transform: translateX(22%) rotateY(-76deg);
    box-shadow: 16px 15px 28px rgb(112 75 97 / 20%);
  }
  100% {
    transform: translateX(0) rotateY(0);
    box-shadow: 12px 15px 35px rgb(112 75 97 / 18%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-enter-active,
  .book-leave-active {
    transition-duration: 1ms, 1ms;
  }

  .book-cover-transition .cover-spread.book-leave-active .closed-book,
  .book-cover-transition .cover-spread.book-enter-active .closed-book {
    animation-duration: 1ms;
  }

  .book-cover-transition .open-book.book-enter-active,
  .book-cover-transition .open-book.book-leave-active {
    transition-duration: 1ms, 1ms;
  }

  .book-stage:not(.book-cover-transition) .open-book.book-enter-active,
  .book-stage:not(.book-cover-transition) .open-book.book-leave-active,
  .book-stage:not(.book-cover-transition)
    .open-book.book-leave-active
    .paper-page {
    animation-duration: 1ms;
  }
}

@media (max-width: 1024px) {
  .book-stage {
    height: 450px;
    min-height: 450px;
  }

  .cover-spread,
  .closed-book,
  .open-book {
    min-height: 440px;
  }

  .paper-page {
    min-height: 440px;
  }

  .paper-front {
    padding: 12px 10px 18px;
    font-size: 13px;
  }

  .polaroid-card {
    height: 280px;
    width: 200px;
  }

  .polaroid-front img {
    height: 200px;
  }
}

@media (max-width: 768px) {
  .book-stage {
    height: 400px;
    min-height: 400px;
    padding: 0 8px;
  }

  .cover-spread,
  .closed-book,
  .open-book {
    min-height: 390px;
  }

  .paper-page {
    min-height: 390px;
  }

  .paper-front {
    padding: 10px 8px 15px;
    font-size: 12px;
  }

  .paper-front h3 {
    font-size: 13px;
  }

  .polaroid-card {
    height: 260px;
    width: 180px;
  }

  .polaroid-front {
    padding: 8px 7px 6px;
  }

  .polaroid-front img {
    height: 180px;
  }

  .polaroid-caption {
    font-size: 15px;
  }

  .polaroid-back {
    padding: 8px 6px;
    font-size: 12px;
  }

  .back-story {
    font-size: 12px;
  }
}

@media (max-width: 560px) {
  .book-stage {
    height: 360px;
    min-height: 360px;
    padding: 0 4px;
  }

  .cover-spread,
  .closed-book,
  .open-book {
    min-height: 350px;
  }

  .paper-page {
    min-height: 350px;
  }

  .paper-front {
    padding: 8px 6px 12px;
    font-size: 11px;
  }

  .paper-front h3 {
    font-size: 12px;
    margin-bottom: 6px;
  }

  .polaroid-card {
    height: 240px;
    width: 160px;
  }

  .polaroid-front {
    padding: 7px 6px 5px;
  }

  .polaroid-front img {
    height: 160px;
    margin-bottom: 6px;
  }

  .polaroid-caption {
    font-size: 13px;
  }

  .polaroid-back {
    padding: 7px 5px;
    font-size: 11px;
  }

  .back-story {
    font-size: 11px;
  }
}

@media (max-width: 380px) {
  .book-stage {
    height: 320px;
    min-height: 320px;
    padding: 0 2px;
  }

  .cover-spread,
  .closed-book,
  .open-book {
    min-height: 310px;
  }

  .paper-page {
    min-height: 310px;
  }

  .paper-front {
    padding: 6px 5px 10px;
    font-size: 10px;
  }

  .paper-front h3 {
    font-size: 11px;
    margin-bottom: 4px;
  }

  .polaroid-card {
    height: 220px;
    width: 145px;
  }

  .polaroid-front {
    padding: 6px 5px 4px;
  }

  .polaroid-front img {
    height: 145px;
    margin-bottom: 5px;
  }

  .polaroid-caption {
    font-size: 12px;
  }

  .polaroid-back {
    padding: 5px 4px;
    font-size: 10px;
  }

  .back-story {
    font-size: 10px;
  }
}
</style>
