<script setup lang="ts">
// 图集详情页 - 单行水平滚动图片展示，左右箭头导航
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { GALLERY_BY_SLUG, type GalleryPhoto } from '@/content/build-time-index'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const gallery = computed(() => GALLERY_BY_SLUG[slug.value] ?? null)
const backHref = computed(() => '/gallery')

// ── Horizontal scroll state ────────────────────────────────────────────
const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function updateScrollButtons() {
  if (!scrollContainer.value) return
  const el = scrollContainer.value
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

function scrollLeft() {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: -(200 + 24), behavior: 'smooth' })
  nextTick(updateScrollButtons)
}

function scrollRight() {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: 200 + 24, behavior: 'smooth' })
  nextTick(updateScrollButtons)
}

// ── Lightbox state ──────────────────────────────────────────────────────
const lightboxPhoto = ref<GalleryPhoto | null>(null)
const lightboxIndex = ref<number>(-1)

function openLightbox(photo: GalleryPhoto, index: number) {
  lightboxPhoto.value = photo
  lightboxIndex.value = index
}
function closeLightbox() {
  lightboxPhoto.value = null
  lightboxIndex.value = -1
}
function prevPhoto() {
  if (!gallery.value || lightboxIndex.value <= 0) return
  lightboxIndex.value--
  lightboxPhoto.value = gallery.value.photos[lightboxIndex.value]
}
function nextPhoto() {
  if (!gallery.value || lightboxIndex.value >= gallery.value.photos.length - 1) return
  lightboxIndex.value++
  lightboxPhoto.value = gallery.value.photos[lightboxIndex.value]
}

const formattedDate = computed(() => {
  if (!gallery.value?.date) return ''
  const [y, m, d] = gallery.value.date.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
})

// ── Image dimensions for aspect ratio calculation ────────────────────────
interface PhotoWithRatio extends GalleryPhoto {
  aspectRatio?: number
}

const photosWithRatio = ref<PhotoWithRatio[]>([])
const rowHeight = ref(280)

onMounted(() => {
  if (!gallery.value?.photos) return

  // Render the strip immediately. Individual images refine their ratio after loading.
  photosWithRatio.value = gallery.value.photos.map((photo) => ({
    ...photo,
    aspectRatio: 4 / 3
  }))
  nextTick(updateScrollButtons)
})

function updatePhotoRatio(photo: PhotoWithRatio, event: Event): void {
  const image = event.currentTarget as HTMLImageElement
  if (!image.naturalWidth || !image.naturalHeight) return

  const aspectRatio = image.naturalWidth / image.naturalHeight
  photosWithRatio.value = photosWithRatio.value.map((item) =>
    item.src === photo.src ? { ...item, aspectRatio } : item
  )
}

function getPhotoWidth(photo: PhotoWithRatio): number {
  return (photo.aspectRatio ?? 1) * rowHeight.value
}
</script>

<template>
  <v-container class="py-10" max-width="1200">

    <!-- Back button -->
    <v-btn
      :to="backHref"
      variant="text"
      size="small"
      class="mb-6"
    >
      <template #prepend>
        <svg class="back-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </template>
      回到图集
    </v-btn>

    <article v-if="gallery">

      <!-- Header -->
      <header class="gallery-header">
        <time class="gallery-header__date">{{ formattedDate }}</time>
        <h1 class="gallery-header__title">{{ gallery.title }}</h1>
        <p v-if="gallery.summary" class="gallery-header__summary">{{ gallery.summary }}</p>
        <div class="gallery-header__meta">
          <span class="gallery-header__count">{{ gallery.photos?.length ?? 0 }} 张照片</span>
        </div>
      </header>

      <!-- Horizontal scrolling gallery with nav arrows -->
      <div class="gallery-scroller">
        <!-- Left arrow -->
        <button
          v-show="canScrollLeft"
          class="gallery-arrow gallery-arrow--left"
          @click="scrollLeft"
          aria-label="向左滚动"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>

        <!-- Scrollable container -->
        <div
          ref="scrollContainer"
          class="gallery-viewport"
          @scroll="updateScrollButtons"
        >
          <!-- Loading state -->
          <div v-if="!photosWithRatio.length" class="gallery-loading">
            <div class="gallery-loading__spinner" />
            <p>加载中...</p>
          </div>

          <!-- Photo strip -->
          <div
            v-else
            class="gallery-strip"
            :style="{ height: rowHeight + 'px' }"
          >
            <figure
              v-for="(photo, i) in photosWithRatio"
              :key="i"
              class="gallery-cell"
              :style="{ width: getPhotoWidth(photo) + 'px', height: rowHeight + 'px' }"
              @click="openLightbox(photo, i)"
            >
              <img
                :src="photo.src"
                :alt="photo.alt"
                class="gallery-cell__img"
                loading="lazy"
                decoding="async"
                @load="updatePhotoRatio(photo, $event)"
              />
              <div class="gallery-cell__overlay">
                <svg class="gallery-cell__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 3h6v6M14 10l7-7M21 14v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h13l5 5z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div v-if="photo.caption" class="gallery-cell__caption">
                {{ photo.caption }}
              </div>
            </figure>
          </div>
        </div>

        <!-- Right arrow -->
        <button
          v-show="canScrollRight"
          class="gallery-arrow gallery-arrow--right"
          @click="scrollRight"
          aria-label="向右滚动"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>

      <!-- Photo captions list -->
      <section v-if="gallery.photos?.length" class="gallery-captions">
        <h2 class="gallery-captions__title">照片说明</h2>
        <ul class="gallery-captions__list">
          <li
            v-for="(photo, i) in gallery.photos"
            :key="i"
            class="gallery-captions__item"
          >
            <span class="gallery-captions__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="gallery-captions__content">
              <p class="gallery-captions__text">{{ photo.caption }}</p>
              <p v-if="photo.exif" class="gallery-captions__exif">
                <span v-if="photo.exif.camera">{{ photo.exif.camera }}</span>
                <span v-if="photo.exif.lens"> · {{ photo.exif.lens }}</span>
                <span v-if="photo.exif.iso"> · ISO {{ photo.exif.iso }}</span>
              </p>
            </div>
          </li>
        </ul>
      </section>

    </article>

    <v-alert
      v-else
      type="warning"
      variant="tonal"
      title="图集不存在"
      :text="`找不到 slug 为 ${slug} 的图集`"
    />

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxPhoto" class="lightbox" @click.self="closeLightbox">
        <button class="lightbox__close" @click="closeLightbox" aria-label="关闭">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>

        <button v-if="lightboxIndex > 0" class="lightbox__prev" @click="prevPhoto" aria-label="上一张">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>

        <div class="lightbox__content">
          <img :src="lightboxPhoto.src" :alt="lightboxPhoto.alt" class="lightbox__img" />
          <p v-if="lightboxPhoto.caption" class="lightbox__caption">{{ lightboxPhoto.caption }}</p>
          <p v-if="lightboxPhoto.exif" class="lightbox__exif">
            <span v-if="lightboxPhoto.exif.camera">{{ lightboxPhoto.exif.camera }}</span>
            <span v-if="lightboxPhoto.exif.lens"> · {{ lightboxPhoto.exif.lens }}</span>
            <span v-if="lightboxPhoto.exif.iso"> · ISO {{ lightboxPhoto.exif.iso }}</span>
          </p>
        </div>

        <button v-if="gallery && lightboxIndex < gallery.photos.length - 1" class="lightbox__next" @click="nextPhoto" aria-label="下一张">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>

        <div class="lightbox__counter">{{ lightboxIndex + 1 }} / {{ gallery?.photos?.length ?? 0 }}</div>
      </div>
    </Teleport>

  </v-container>
</template>

<style scoped>
.mb-6 { margin-bottom: var(--theme-spacing-xl); }

.back-icon {
  width: 16px;
  height: 16px;
}

/* Header */
.gallery-header {
  margin-bottom: var(--theme-spacing-lg);
}
.gallery-header__date {
  display: block;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  letter-spacing: 0.06em;
  margin-bottom: var(--theme-spacing-xs);
}
.gallery-header__title {
  margin: 0 0 var(--theme-spacing-sm);
  font-size: var(--theme-font-size-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  word-break: keep-all;
  line-break: strict;
}
.gallery-header__summary {
  margin: 0 0 var(--theme-spacing-sm);
  font-size: var(--theme-font-size-base);
  line-height: 1.7;
  color: var(--theme-on-surface);
  opacity: 0.8;
  max-width: 60ch;
  text-wrap: pretty;
}
.gallery-header__meta {
  display: flex;
  gap: var(--theme-spacing-md);
}
.gallery-header__count {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-on-surface);
  opacity: 0.5;
}

/* ── Horizontal scroller ─────────────────────────────────────────────── */
.gallery-scroller {
  position: relative;
  margin: 0 calc(-1 * var(--theme-spacing-lg));
  padding: 0 var(--theme-spacing-lg);
}

.gallery-viewport {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  scrollbar-color: var(--theme-primary) transparent;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.gallery-viewport::-webkit-scrollbar {
  display: none;
}

.gallery-strip {
  display: flex;
  flex-direction: row;
  gap: 6px;
  width: max-content;
}

/* Gallery cell */
.gallery-cell {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--theme-radius-md);
  cursor: pointer;
  background: var(--theme-scrim);
  scroll-snap-align: start;
}

.gallery-cell__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 300ms ease;
}
.gallery-cell:hover .gallery-cell__img {
  transform: scale(1.03);
}

.gallery-cell__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: opacity 200ms ease;
}
.gallery-cell:hover .gallery-cell__overlay {
  opacity: 1;
}
.gallery-cell__icon {
  width: 28px;
  height: 28px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}

.gallery-cell__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 10px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  opacity: 0;
  transition: opacity 200ms ease;
}
.gallery-cell:hover .gallery-cell__caption {
  opacity: 1;
}

/* Loading */
.gallery-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 1rem;
  opacity: 0.6;
}
.gallery-loading__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--theme-border);
  border-top-color: var(--theme-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Navigation arrows ───────────────────────────────────────────────── */
.gallery-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: transform 160ms ease, opacity 160ms ease, background-color 160ms ease;
}

.gallery-arrow svg {
  width: 20px;
  height: 20px;
}

.gallery-arrow--left {
  left: calc(var(--theme-spacing-lg) + 8px);
}

.gallery-arrow--right {
  right: calc(var(--theme-spacing-lg) + 8px);
}

/* Light theme arrow */
.v-theme--light .gallery-arrow {
  background: rgba(255, 255, 255, 0.88);
  color: #1a1a1a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.v-theme--light .gallery-arrow:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-50%) scale(1.08);
}

/* Dark theme arrow */
.v-theme--dark .gallery-arrow {
  background: rgba(30, 30, 30, 0.88);
  color: #e8e8e8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.v-theme--dark .gallery-arrow:hover {
  background: rgba(40, 40, 40, 0.95);
  transform: translateY(-50%) scale(1.08);
}

/* Captions */
.gallery-captions {
  margin-top: var(--theme-spacing-xl);
  padding-top: var(--theme-spacing-xl);
  border-top: 1px solid var(--theme-border);
}
.gallery-captions__title {
  margin: 0 0 var(--theme-spacing-lg);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.gallery-captions__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--theme-spacing-sm);
}
.gallery-captions__item {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  gap: var(--theme-spacing-sm);
  align-items: start;
}
.gallery-captions__num {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  opacity: 0.65;
  padding-top: 2px;
}
.gallery-captions__text {
  margin: 0;
  font-size: var(--theme-font-size-sm);
  color: var(--theme-on-surface);
  line-height: 1.5;
}
.gallery-captions__exif {
  margin: 2px 0 0;
  font-family: var(--theme-font-mono);
  font-size: 10px;
  color: var(--theme-on-surface);
  opacity: 0.4;
  letter-spacing: 0.04em;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}
.lightbox__close,
.lightbox__prev,
.lightbox__next {
  position: absolute;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 160ms ease;
}
.lightbox__close:hover,
.lightbox__prev:hover,
.lightbox__next:hover {
  background: rgba(255,255,255,0.2);
}
.lightbox__close { top: 20px; right: 20px; }
.lightbox__prev { left: 20px; top: 50%; transform: translateY(-50%); }
.lightbox__next { right: 20px; top: 50%; transform: translateY(-50%); }
.lightbox__close svg,
.lightbox__prev svg,
.lightbox__next svg {
  width: 24px;
  height: 24px;
}
.lightbox__content {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--theme-spacing-sm);
}
.lightbox__img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: var(--theme-radius-sm);
}
.lightbox__caption {
  margin: 0;
  font-size: var(--theme-font-size-sm);
  color: rgba(255,255,255,0.8);
  text-align: center;
  max-width: 60ch;
}
.lightbox__exif {
  margin: 0;
  font-family: var(--theme-font-mono);
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.04em;
}
.lightbox__counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.08em;
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-header__title { font-size: var(--theme-font-size-2xl); }
  .gallery-scroller { margin: 0 calc(-1 * var(--theme-spacing-md)); padding: 0 var(--theme-spacing-md); }
  .gallery-arrow { width: 36px; height: 36px; }
  .gallery-arrow--left { left: calc(var(--theme-spacing-md) + 4px); }
  .gallery-arrow--right { right: calc(var(--theme-spacing-md) + 4px); }
}
</style>