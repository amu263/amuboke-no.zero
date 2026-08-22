<script setup lang="ts">
// AGENTS.md §4: 命名 PascalCase + variant 联合类型
// GalleryGrid: gallery 列表页用 — 网格 + masonry-lite 视觉，variant 控制密度
// AGENTS.md §3 §5: 内容写入由 build-time-index 控；这里只做渲染 + 预览触发。
// 单元 4 / Todo 4: 增加独立的 `gallery-grid__open` 按钮，figure 保持非链接；
// 点击按钮触发单图全屏预览（由父级 GalleryPreview 组件承载）。
import { computed, ref } from 'vue'
import type { GalleryMeta, GalleryPhoto } from '@/content/build-time-index'

export type GalleryGridVariant = 'masonry' | 'grid'

const props = withDefaults(
  defineProps<{
    gallery: GalleryMeta
    variant?: GalleryGridVariant
  }>(),
  { variant: 'masonry' }
)

const emit = defineEmits<{
  (
    e: 'open-preview',
    payload: { gallery: GalleryMeta; photo: GalleryPhoto; triggerId: string }
  ): void
}>()

const cardId = computed(() => `gallery-card-${props.gallery.slug}`)
const triggerId = computed(() => `gallery-trigger-${props.gallery.slug}`)

const previewPhotos = computed(() => (props.gallery.photos ?? []).slice(0, 3))
const firstPhoto = computed<GalleryPhoto | null>(() => props.gallery.photos?.[0] ?? null)
const totalPhotos = computed(() => props.gallery.photos?.length ?? 0)

const failedPhotoSources = ref<readonly string[]>([])

function isPhotoFailed(src: string): boolean {
  return failedPhotoSources.value.includes(src)
}

function markPhotoFailed(src: string): void {
  if (isPhotoFailed(src)) {
    return
  }

  failedPhotoSources.value = [...failedPhotoSources.value, src]
}

function openPreview(): void {
  const photo = firstPhoto.value
  if (!photo) {
    return
  }

  emit('open-preview', {
    gallery: props.gallery,
    photo,
    triggerId: triggerId.value
  })
}
</script>

<template>
  <article :id="cardId" :class="['gallery-grid', `gallery-grid--${variant}`]">
    <figure class="gallery-grid__thumbnails" :aria-label="`${gallery.title} 预览图片`">
      <template v-for="(p, i) in previewPhotos" :key="p.src">
        <img
          v-if="p.src && !isPhotoFailed(p.src)"
          :src="p.src"
          :alt="p.alt"
          :width="640"
          :height="480"
          :class="['gallery-grid__thumb', `gallery-grid__thumb--${i}`]"
          loading="lazy"
          decoding="async"
          @error="markPhotoFailed(p.src)"
        />
        <span
          v-else
          :class="['gallery-grid__thumb', 'gallery-grid__thumb-fallback', `gallery-grid__thumb--${i}`]"
          role="img"
          :aria-label="p.alt || '图片加载失败'"
        >
          <span class="gallery-grid__icon gallery-grid__icon--image-off" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
              <path
                d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3h9A2.75 2.75 0 0 1 19.25 5.75v9.5c0 .54-.16 1.04-.43 1.46M6.2 18.25h10.3m-8.7-3.5 2.7-3 2.15 2.4 1.15-1.25m4.7 6.85-15-15"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </span>
      </template>
      <span v-if="!previewPhotos.length" class="gallery-grid__empty" role="img" aria-label="暂无预览图片">
        <span class="gallery-grid__icon gallery-grid__icon--image-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
            <path
              d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3h9A2.75 2.75 0 0 1 19.25 5.75v9.5c0 .54-.16 1.04-.43 1.46M6.2 18.25h10.3m-8.7-3.5 2.7-3 2.15 2.4 1.15-1.25m4.7 6.85-15-15"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </span>
    </figure>

    <header class="gallery-grid__header">
      <time class="gallery-grid__date">{{ gallery.date }}</time>
      <h3 class="gallery-grid__title">{{ gallery.title }}</h3>
      <p v-if="gallery.summary" class="gallery-grid__summary">{{ gallery.summary }}</p>
    </header>

    <footer class="gallery-grid__footer">
      <span class="gallery-grid__count">
        <span class="gallery-grid__icon gallery-grid__icon--count" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" focusable="false">
            <rect
              x="4"
              y="6"
              width="12"
              height="12"
              rx="2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="M8 3.75h8.5A2.75 2.75 0 0 1 19.25 6.5V15"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        {{ totalPhotos }}
      </span>

      <button
        v-if="firstPhoto"
        :id="triggerId"
        type="button"
        class="gallery-grid__open"
        :aria-label="`预览图集《${gallery.title}》第 1 张（共 ${totalPhotos} 张）`"
        @click="openPreview"
      >
        <span class="gallery-grid__icon gallery-grid__icon--open" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
            <path
              d="M3 9.5V5.75A2.75 2.75 0 0 15.75 3h3.5A2.75 2.75 0 0 1 22 5.75v3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21 14.5v3.75A2.75 2.75 0 0 1 18.25 21h-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 14.5v3.75A2.75 2.75 0 0 0 5.75 21h3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9.5 9.5l5 5M14.5 9.5l-5 5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span class="gallery-grid__open-label">预览</span>
      </button>
    </footer>
  </article>
</template>

<style scoped>
/* 单元 4 / Todo 4: 浅色主题走白色 surface，深色主题走近黑 surface；
   二者都通过 --theme-surface token 统一表达，凸起感由 --theme-shadow-md
   + hover 时升级到 --theme-shadow-lg + translateY(-2px) 表达。 */
.gallery-grid {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-lg);
  background: transparent;
  color: var(--theme-on-surface);
  box-shadow: var(--theme-shadow-md);
  transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
}

.gallery-grid:hover {
  border-color: var(--theme-primary);
  box-shadow: var(--theme-shadow-lg);
  transform: translateY(-2px);
}

/* 「框中框」层次：内侧 1px surface 边线，让卡片在缩略图缩放时仍能看见
   一圈嵌进去的框。AGENTS.md §5 #18 同样思路：颜色由 token 决定。 */
.gallery-grid::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: calc(var(--theme-radius-lg) - 4px);
  border: 1px solid var(--theme-surface);
  pointer-events: none;
  opacity: 0.55;
  mix-blend-mode: difference;
}

.gallery-grid__thumbnails {
  position: relative;
  display: grid;
  margin: 0;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--theme-radius-md);
  background: var(--theme-scrim);
}
.gallery-grid__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.gallery-grid__thumb-fallback {
  display: grid;
  place-items: center;
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  opacity: 0.4;
}
.gallery-grid__thumb--0 {
  grid-row: span 2;
}

.gallery-grid__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0.4;
}

.gallery-grid__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: currentColor;
}
.gallery-grid__icon svg {
  display: block;
  width: 100%;
  height: 100%;
}
.gallery-grid__icon--image-off {
  width: 1.375rem;
  height: 1.375rem;
}
.gallery-grid__icon--count {
  width: 0.875rem;
  height: 0.875rem;
}
.gallery-grid__icon--open {
  width: 1rem;
  height: 1rem;
}

.gallery-grid__date {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.6;
}
.gallery-grid__title {
  font-size: var(--theme-font-size-lg);
  font-weight: 600;
  margin: 0;
}
.gallery-grid__summary {
  margin: 0;
  font-size: var(--theme-font-size-sm);
  opacity: 0.7;
  line-height: 1.5;
  word-break: keep-all;
  line-break: strict;
  text-wrap: pretty;
}
.gallery-grid__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.gallery-grid__count {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.7;
}

/* 单元 4 / Todo 4: 独立的「预览」触发按钮，figure 上不放 <a>。
   AGENTS.md §5 #8: 暗色下 outlined 边框刺眼，这里走 tonal 风格
   (半透明底 + 无边框)。focus-visible 显式 outline。 */
.gallery-grid__open {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 0;
  border-radius: var(--theme-radius-md);
  background: var(--theme-scrim);
  color: var(--theme-primary);
  font: inherit;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.gallery-grid__open:hover {
  background: var(--theme-surface-variant);
  color: var(--theme-primary);
  transform: translateY(-1px);
}

.gallery-grid__open:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: 2px;
}

.gallery-grid__open:active {
  transform: translateY(0);
}

.gallery-grid__open-label {
  letter-spacing: 0.02em;
}

/* grid 变体：横平竖直，单列 */
.gallery-grid--grid .gallery-grid__thumbnails {
  aspect-ratio: 16 / 9;
}

@media (max-width: 420px) {
  .gallery-grid__summary {
    font-size: var(--theme-font-size-xs);
    text-wrap: balance;
  }
  .gallery-grid__open-label {
    display: none;
  }
  .gallery-grid__open {
    padding: 0.35rem 0.5rem;
  }
}
</style>