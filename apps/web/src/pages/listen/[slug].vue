<script setup lang="ts">
// AGENTS.md §4: 页面壳只决定 variant，不重写子组件。
// /listen/:slug 详情页 — 构建期定型，数据来自 build-time-index。
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LISTENS } from '@/content/build-time-index'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const hit = computed(() => LISTENS.find(l => l.slug === slug.value) ?? null)
const backHref = computed(() => '/listen')

// Format date
const formattedDate = computed(() => {
  if (!hit.value?.date) return ''
  const [y, m, d] = hit.value.date.split('-')
  return `${y}年${m}月${d}日`
})
</script>

<template>
  <v-container class="py-10" max-width="900">
    <!-- Back button -->
    <v-btn
      :to="backHref"
      variant="text"
      size="small"
      class="mb-6"
    >
      <template #prepend>
        <svg class="back-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M12.5 4.5 7 10l5.5 5.5" />
        </svg>
      </template>
      回到听见
    </v-btn>

    <article v-if="hit" class="listen-detail">

      <!-- Cover image + info header -->
      <div class="listen-detail__hero">
        <figure class="listen-detail__cover">
          <img
            :src="hit.cover ?? '/images/placeholder.svg'"
            :alt="hit.album + ' 专辑封面'"
            class="listen-detail__cover-img"
          />
        </figure>

        <div class="listen-detail__info">
          <span class="listen-detail__eyebrow">#LISTEN</span>
          <h1 class="listen-detail__album">{{ hit.album }}</h1>
          <p class="listen-detail__artist">{{ hit.artist }}</p>

          <dl class="listen-detail__meta">
            <div>
              <dt>流派</dt>
              <dd>{{ hit.genres?.join(' · ') ?? '—' }}</dd>
            </div>
            <div>
              <dt>发行</dt>
              <dd>{{ hit.year }}</dd>
            </div>
            <div v-if="hit.date">
              <dt>日期</dt>
              <dd>{{ formattedDate }}</dd>
            </div>
            <div v-if="hit.tracks?.length">
              <dt>曲目</dt>
              <dd>{{ hit.tracks.length }}首</dd>
            </div>
          </dl>

          <div v-if="hit.genres?.length" class="listen-detail__genres">
            <span
              v-for="g in hit.genres"
              :key="g"
              class="listen-detail__genre"
            >{{ g }}</span>
          </div>

          <a
            v-if="hit.links?.external"
            :href="hit.links.external"
            target="_blank"
            rel="noopener noreferrer"
            class="listen-detail__extlink"
          >
            外部资料
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M7 5h8v8" />
              <path d="M5 15 15 5" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Summary / review text -->
      <section v-if="hit.summary" class="listen-detail__review">
        <h2 class="listen-detail__review-title">乐评</h2>
        <p class="listen-detail__review-body">{{ hit.summary }}</p>
      </section>

      <!-- Track list -->
      <section v-if="hit.tracks?.length" class="listen-detail__tracks">
        <h2 class="listen-detail__tracks-title">曲目</h2>
        <ol class="listen-detail__track-list">
          <li
            v-for="(track, i) in hit.tracks"
            :key="track.title"
            class="listen-detail__track"
          >
            <span class="listen-detail__track-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="listen-detail__track-title">{{ track.title }}</span>
            <span v-if="track.duration" class="listen-detail__track-dur">{{ track.duration }}</span>
          </li>
        </ol>
      </section>

    </article>

    <v-alert
      v-else
      type="warning"
      variant="tonal"
      title="没有这个音乐档案"
      :text="`找不到 slug 为 ${slug} 的音乐档案`"
    />
  </v-container>
</template>

<style scoped>
/* Back button */
.mb-6 { margin-bottom: var(--theme-spacing-lg); }
.back-icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Hero: cover + info side by side */
.listen-detail__hero {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--theme-spacing-xl);
  margin-bottom: var(--theme-spacing-xl);
  align-items: start;
}

.listen-detail__cover {
  width: 280px;
  flex-shrink: 0;
  margin: 0;
  border-radius: var(--theme-radius-lg);
  overflow: hidden;
  box-shadow: var(--theme-shadow-lg);
}

.listen-detail__cover-img {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 1 / 1;
  object-fit: contain;
}

.listen-detail__info {
  display: flex;
  flex-direction: column;
  gap: var(--theme-spacing-sm);
}

.listen-detail__eyebrow {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  letter-spacing: 0.08em;
}

.listen-detail__album {
  margin: 0;
  font-size: var(--theme-font-size-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  word-break: keep-all;
  line-break: strict;
  color: var(--theme-on-surface);
}

.listen-detail__artist {
  margin: 0;
  font-size: var(--theme-font-size-lg);
  color: var(--theme-on-surface);
  opacity: 0.75;
}

.listen-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-spacing-md) var(--theme-spacing-xl);
  margin: var(--theme-spacing-xs) 0 0;
}

.listen-detail__meta > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.listen-detail__meta dt {
  font-family: var(--theme-font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--theme-on-surface);
  opacity: 0.45;
}

.listen-detail__meta dd {
  margin: 0;
  font-size: var(--theme-font-size-sm);
  color: var(--theme-on-surface);
  opacity: 0.85;
}

.listen-detail__genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-spacing-xs);
  margin-top: var(--theme-spacing-xs);
}

.listen-detail__genre {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  padding: 2px 10px;
  border-radius: var(--theme-radius-sm);
  background: color-mix(in srgb, var(--theme-primary) 15%, transparent);
  color: var(--theme-primary);
  letter-spacing: 0.04em;
}

.listen-detail__extlink {
  display: inline-flex;
  align-items: center;
  gap: var(--theme-spacing-xs);
  margin-top: var(--theme-spacing-sm);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  text-decoration: none;
  transition: opacity 160ms ease;
}

.listen-detail__extlink:hover {
  opacity: 0.75;
}

.listen-detail__extlink svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Review section */
.listen-detail__review {
  margin-bottom: var(--theme-spacing-xl);
}

.listen-detail__review-title,
.listen-detail__tracks-title {
  margin: 0 0 var(--theme-spacing-sm);
  font-size: var(--theme-font-size-xs);
  font-family: var(--theme-font-mono);
  color: var(--theme-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.listen-detail__review-body {
  margin: 0;
  font-size: var(--theme-font-size-base);
  line-height: 1.8;
  color: var(--theme-on-surface);
  opacity: 0.85;
  word-break: keep-all;
  line-break: strict;
  text-wrap: pretty;
}

/* Track list */
.listen-detail__tracks {
  margin-bottom: var(--theme-spacing-xl);
}

.listen-detail__track-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.listen-detail__track {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  align-items: center;
  gap: var(--theme-spacing-sm);
  padding: var(--theme-spacing-xs) var(--theme-spacing-sm);
  border-radius: var(--theme-radius-sm);
  transition: background 160ms ease;
}

.listen-detail__track:hover {
  background: var(--theme-scrim);
}

.listen-detail__track-num {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  opacity: 0.65;
}

.listen-detail__track-title {
  font-size: var(--theme-font-size-sm);
  color: var(--theme-on-surface);
}

.listen-detail__track-dur {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-on-surface);
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 640px) {
  .listen-detail__hero {
    grid-template-columns: 1fr;
  }
  .listen-detail__cover {
    width: 200px;
  }
  .listen-detail__album {
    font-size: var(--theme-font-size-2xl);
  }
}
</style>
