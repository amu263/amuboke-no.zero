<script setup lang="ts">
// AGENTS.md §4: <Domain><Role> + variant 字面量联合
// ListenCard: /listen 音乐档案页用；CD盒式封标卡片设计。
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ListenMeta } from '@/content/build-time-index'

export type ListenCardVariant = 'card' | 'compact'

const props = withDefaults(
  defineProps<{
    listen: ListenMeta
    variant?: ListenCardVariant
  }>(),
  { variant: 'card' }
)

const titleId = computed(() => `listen-${props.listen.slug}-title`)
const router = useRouter()

// Format date to Chinese
const formattedDate = computed(() => {
  if (!props.listen.date) return ''
  const [year, month, day] = props.listen.date.split('-')
  return `${year}年${month}月${day}日`
})

// Number of tracks
const trackCount = computed(() => props.listen.tracks?.length ?? 0)
</script>

<template>
  <article
    :id="listen.slug"
    :class="['listen-card', `listen-card--${variant}`]"
    :aria-labelledby="titleId"
    role="link"
    tabindex="0"
    @click="router.push('/listen/' + listen.slug); $event.stopPropagation()"
    @keydown.enter="router.push('/listen/' + listen.slug)"
    @keydown.space.prevent="router.push('/listen/' + listen.slug)"
  >
    <!-- Cover image with page-flip hover effect -->
    <div class="listen-card__cover-wrap" aria-hidden="true">
      <div class="listen-card__cover-flipper">
        <figure class="listen-card__cover-front">
          <img
            :src="listen.cover ?? '/images/placeholder.svg'"
            :alt="listen.title + ' 专辑封面'"
            class="listen-card__cover-img"
            loading="lazy"
          />
        </figure>
        <div class="listen-card__cover-back">
          <!-- Back side shows artist info when flipped -->
          <div class="listen-card__cover-back-inner">
            <span class="listen-card__flip-artist">{{ listen.artist }}</span>
            <span class="listen-card__flip-album">{{ listen.album }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CD sleeve label: vertical text -->
    <div class="listen-card__sleeve" :aria-label="listen.album + ' 封标'">
      <div class="listen-card__sleeve-inner">
        <span class="listen-card__sleeve-title">{{ listen.album }}</span>
        <span class="listen-card__sleeve-artist">{{ listen.artist }}</span>
      </div>
    </div>

    <!-- Body: info + partial text -->
    <div class="listen-card__body">
      <header class="listen-card__header">
        <span class="listen-card__eyebrow">#LISTEN</span>
        <time v-if="formattedDate" class="listen-card__date" :datetime="listen.date">
          {{ formattedDate }}
        </time>
      </header>

      <h2 :id="titleId" class="listen-card__title">{{ listen.title }}</h2>

      <dl class="listen-card__meta" aria-label="音乐档案元数据">
        <div class="listen-card__meta-item">
          <dt>艺术家</dt>
          <dd>{{ listen.artist }}</dd>
        </div>
        <div class="listen-card__meta-item">
          <dt>发行</dt>
          <dd>{{ listen.year }}</dd>
        </div>
        <div v-if="trackCount" class="listen-card__meta-item">
          <dt>曲目</dt>
          <dd>{{ trackCount }}首</dd>
        </div>
      </dl>

      <p v-if="listen.summary && variant !== 'compact'" class="listen-card__summary">
        {{ listen.summary }}
      </p>

      <div v-if="listen.genres?.length" class="listen-card__genres">
        <span
          v-for="genre in listen.genres"
          :key="genre"
          class="listen-card__genre"
        >{{ genre }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ─── Card container ──────────────────────────────────── */
.listen-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--theme-radius-lg);
  background: transparent;
  color: var(--theme-on-surface);
  overflow: hidden;
  transition: transform 300ms ease, box-shadow 300ms ease;
  cursor: pointer;
  /* No border */
  border: 0;
  box-shadow: var(--theme-shadow-sm);
}

.listen-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--theme-shadow-lg);
}

/* ─── Cover image with page-flip ─────────────────────── */
.listen-card__cover-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  perspective: 800px;
  overflow: hidden;
  background: var(--theme-scrim);
  flex-shrink: 0;
}

.listen-card__cover-flipper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.4, 0.2, 0.2, 1);
}

.listen-card:hover .listen-card__cover-flipper {
  transform: rotateY(12deg) scale(1.04);
  box-shadow: 8px 0 20px rgba(0, 0, 0, 0.22);
}

.listen-card__cover-front,
.listen-card__cover-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.listen-card__cover-front {
  transform: rotateY(0deg);
}

.listen-card__cover-back {
  transform: rotateY(180deg);
  background: var(--theme-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.listen-card__cover-back-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--theme-spacing-xs);
  padding: var(--theme-spacing-md);
}

.listen-card__flip-artist,
.listen-card__flip-album {
  color: var(--theme-background);
  font-family: var(--theme-font-mono);
  text-align: center;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.listen-card__flip-artist {
  font-size: var(--theme-font-size-sm);
  font-weight: 600;
}

.listen-card__flip-album {
  font-size: var(--theme-font-size-xs);
  opacity: 0.85;
}

.listen-card__cover-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 400ms ease;
}

.listen-card:hover .listen-card__cover-img {
  transform: scale(1.06);
}

/* ─── CD sleeve label: vertical text ────────────────── */
.listen-card__sleeve {
  width: 100%;
  padding: var(--theme-spacing-sm) var(--theme-spacing-md);
  /* Sleeve background: slightly lighter/different from card bg */
  background: transparent;
  border-top: 1px solid rgba(128, 128, 128, 0.12);
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
  flex-shrink: 0;
}

.listen-card__sleeve-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  overflow: hidden;
  min-height: 3.5rem;
}

.listen-card__sleeve-title,
.listen-card__sleeve-artist {
  /* 竖排文字：手写风格楷体 */
  writing-mode: vertical-rl;
  -webkit-writing-mode: vertical-rl;
  text-orientation: upright;
  -webkit-text-orientation: upright;
  font-family: "STKaiti", "KaiTi", "FZKai-Z03", "楷体", "华文楷体", "YouYuan", serif;
  color: var(--theme-on-surface);
  letter-spacing: 0.1em;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-height: 3.5rem;
}

.listen-card__sleeve-title {
  font-size: var(--theme-font-size-sm);
  font-weight: 600;
  /* Slightly warmer color for title */
  color: var(--theme-primary);
}

.listen-card__sleeve-artist {
  font-size: var(--theme-font-size-xs);
  opacity: 0.65;
}

/* ─── Body: info + summary ───────────────────────────── */
.listen-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--theme-spacing-xs);
  padding: var(--theme-spacing-sm) var(--theme-spacing-md) var(--theme-spacing-md);
  flex: 1 1 auto;
  min-height: 0;
}

.listen-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--theme-spacing-xs);
}

.listen-card__eyebrow {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  letter-spacing: 0.06em;
}

.listen-card__date {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-on-surface);
  opacity: 0.5;
}

.listen-card__title {
  margin: 0;
  font-size: var(--theme-font-size-base);
  font-weight: 600;
  letter-spacing: 0.01em;
  word-break: keep-all;
  line-break: strict;
  color: var(--theme-on-surface);
}

.listen-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-spacing-xs) var(--theme-spacing-md);
  margin: 0;
}

.listen-card__meta-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.listen-card__meta-item dt {
  font-family: var(--theme-font-mono);
  font-size: 9px;
  color: var(--theme-on-surface);
  opacity: 0.45;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.listen-card__meta-item dd {
  margin: 0;
  font-size: var(--theme-font-size-xs);
  color: var(--theme-on-surface);
  opacity: 0.8;
}

.listen-card__summary {
  margin: 0;
  font-size: var(--theme-font-size-xs);
  line-height: 1.6;
  color: var(--theme-on-surface);
  opacity: 0.68;
  word-break: keep-all;
  line-break: strict;
  text-wrap: pretty;
  /* Limit to 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.listen-card__genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-spacing-xs);
  margin-top: auto;
}

.listen-card__genre {
  font-family: var(--theme-font-mono);
  font-size: 9px;
  padding: 2px 7px;
  border-radius: var(--theme-radius-sm);
  background: color-mix(in srgb, var(--theme-primary) 15%, transparent);
  color: var(--theme-primary);
  letter-spacing: 0.04em;
}

/* ─── Compact variant: hide summary ──────────────────── */
.listen-card--compact .listen-card__summary {
  display: none;
}
</style>
