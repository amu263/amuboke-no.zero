<script setup lang="ts">
import { computed } from 'vue'
import { GALLERIES, LISTENS, POSTS_BY_SLUG, PROJECT_BY_SLUG, type RecentUpdate } from '@/content/build-time-index'
const props = defineProps<{
  item: RecentUpdate
  x: number   // viewport-relative X from mousemove
  y: number   // viewport-relative Y = row bottom + 16px offset
}>()

const post = computed(() => POSTS_BY_SLUG[props.item.slug])
const project = computed(() => PROJECT_BY_SLUG[props.item.slug])
const gallery = computed(() => GALLERIES.find((entry) => entry.slug === props.item.slug))
const listen = computed(() => LISTENS.find((entry) => entry.slug === props.item.slug))

// Clamp so magnifier never goes off the right edge of the viewport
const MAGNIFIER_WIDTH = 360
const clampedX = computed(() => {
  const maxLeft = window.innerWidth - MAGNIFIER_WIDTH - 16 // 16px right padding
  return Math.min(Math.max(16, props.x), maxLeft)
})
</script>
<template>
  <div
    class="content-magnifier"
    :style="{ left: clampedX + 'px', top: y + 'px' }"
    role="status"
    aria-live="polite"
  >
    <span class="content-magnifier__label">LOCAL RENDER / {{ item.type.toUpperCase() }}</span>
    <article v-if="item.type === 'post' && post" class="content-magnifier__content markdown-body"><h3>{{ post.title }}</h3><div v-if="post.html" v-html="post.html" /></article>
    <article v-else-if="item.type === 'project' && project" class="content-magnifier__content"><h3>{{ project.name }}</h3><p>{{ project.summary }}</p><p class="content-magnifier__meta">{{ project.tech.join(' · ') }}</p></article>
    <article v-else-if="item.type === 'gallery' && gallery" class="content-magnifier__content"><h3>{{ gallery.title }}</h3><p>{{ gallery.summary || '一组照片' }}</p><p class="content-magnifier__meta">{{ gallery.photos.length }} photos · {{ gallery.date }}</p></article>
    <article v-else-if="item.type === 'listen' && listen" class="content-magnifier__content"><h3>{{ listen.title }}</h3><p>{{ listen.artist }} · {{ listen.album }} · {{ listen.year }}</p><p class="content-magnifier__meta">{{ listen.genres.join(' · ') }}</p></article>
    <p v-else class="content-magnifier__content">{{ item.title }}</p>
  </div>
</template>
<style scoped>
.content-magnifier {
  position: fixed;
  z-index: 20;
  width: min(360px, calc(100vw - 2rem));
  height: 220px;
  overflow: hidden;
  padding: var(--theme-spacing-md);
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-md);
  background: var(--theme-scrimStrong);
  box-shadow: var(--theme-shadow-lg);
  backdrop-filter: blur(14px);
  pointer-events: none;
}
.content-magnifier__label, .content-magnifier__meta { color: var(--theme-primary); font-family: var(--theme-font-mono); font-size: var(--theme-font-size-xs); }
.content-magnifier__content { margin-top: var(--theme-spacing-sm); overflow: hidden; } .content-magnifier__content h3 { margin: 0 0 var(--theme-spacing-sm); font-size: var(--theme-font-size-lg); } .content-magnifier__content p { margin: 0 0 var(--theme-spacing-sm); line-height: 1.5; } .content-magnifier__content :deep(p) { margin: 0 0 var(--theme-spacing-sm); } .content-magnifier__content :deep(pre) { max-height: 5rem; overflow: hidden; }
</style>