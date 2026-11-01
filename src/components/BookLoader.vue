<template>
  <div class="book-loader-overlay" role="status" aria-live="polite" aria-label="Memuat album">
    <div class="loader-content">
      <div class="loader-book" aria-hidden="true">
        <div class="book-base">
          <div class="book-left-page"></div>
          <div class="book-spine"></div>
          <div class="book-page page-one"><span class="page-back"></span></div>
          <div class="book-page page-two"><span class="page-back"></span></div>
          <div class="book-page page-three"><span class="page-back"></span></div>
        </div>
      </div>
      <p class="loader-label">Membuka kenangan...</p>
      <span class="loader-sparkle sparkle-one">✦</span>
      <span class="loader-sparkle sparkle-two">♡</span>
    </div>
  </div>
</template>

<style scoped>
.book-loader-overlay {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(255 248 245 / 88%);
  backdrop-filter: blur(3px);
}

.loader-content {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 20px;
}

.loader-book {
  width: 144px;
  height: 108px;
  perspective: 700px;
  filter: drop-shadow(0 10px 9px rgb(124 75 82 / 15%));
  animation: book-bob 2.4s ease-in-out infinite;
}

.book-base {
  position: absolute;
  inset: 5px 3px 10px;
  overflow: hidden;
  border: 2px solid #f9a8d4;
  border-radius: 8px 12px 12px 8px;
  background: #fbcfe8;
  box-shadow: inset 0 -4px 0 rgb(190 92 137 / 12%);
}

.book-left-page {
  position: absolute;
  inset: 7px 50% 5px 7px;
  border-radius: 4px 0 0 4px;
  background:
    repeating-linear-gradient(0deg, transparent 0 12px, rgb(244 114 182 / 13%) 12px 13px),
    #fffdf8;
  box-shadow: inset -5px 0 7px -7px rgb(112 75 68 / 55%);
}

.book-spine {
  position: absolute;
  z-index: 5;
  top: 5px;
  bottom: 5px;
  left: 50%;
  width: 3px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: #e7a3bd;
}

.book-page {
  position: absolute;
  top: 7px;
  bottom: 5px;
  left: 50%;
  width: calc(50% - 7px);
  transform: rotateY(0);
  transform-origin: left center;
  transform-style: preserve-3d;
  border: 1px solid #f2dfbd;
  border-radius: 1px 5px 5px 1px;
  background:
    repeating-linear-gradient(0deg, transparent 0 12px, rgb(217 119 150 / 13%) 12px 13px),
    #fef3c7;
  backface-visibility: hidden;
  animation: turn-page 1.8s cubic-bezier(0.45, 0.05, 0.35, 0.95) infinite;
}

.page-one {
  z-index: 4;
  animation-delay: 0s;
}

.page-two {
  z-index: 3;
  animation-delay: 0.24s;
}

.page-three {
  z-index: 2;
  animation-delay: 0.48s;
}

.page-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
  border-radius: inherit;
  background:
    repeating-linear-gradient(0deg, transparent 0 12px, rgb(217 119 150 / 11%) 12px 13px),
    #fffaf0;
  backface-visibility: hidden;
}

.loader-label {
  color: #a45b76;
  font-family: var(--font-handwriting, 'Caveat', cursive);
  font-size: 21px;
  line-height: 1;
}

.loader-sparkle {
  position: absolute;
  color: #ec8bb4;
  animation: sparkle 1.8s ease-in-out infinite;
}

.sparkle-one {
  top: 0;
  right: -14px;
  font-size: 18px;
}

.sparkle-two {
  top: 42px;
  left: -20px;
  font-size: 20px;
  animation-delay: 0.7s;
}

@keyframes turn-page {
  0%,
  12% {
    transform: rotateY(0);
    box-shadow: 2px 1px 3px rgb(90 65 58 / 8%);
  }
  62%,
  78% {
    transform: rotateY(-180deg);
    box-shadow: -2px 1px 4px rgb(90 65 58 / 12%);
  }
  100% {
    transform: rotateY(-180deg);
    box-shadow: none;
  }
}

@keyframes book-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(0.8) rotate(-8deg);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1) rotate(8deg);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-book,
  .book-page,
  .loader-sparkle {
    animation: none;
  }
}
</style>
