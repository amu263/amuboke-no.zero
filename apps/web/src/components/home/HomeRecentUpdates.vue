<script setup lang="ts">
import { ref } from 'vue'
import { RECENT_UPDATES, type RecentUpdate } from '@/content/build-time-index'
import ContentMagnifier from './ContentMagnifier.vue'

const active = ref<string | null>(null)
const hovered = ref<string | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)

function showFocus(item: RecentUpdate) { active.value = item.slug }
function hideFocus(item: RecentUpdate) { if (active.value === item.slug) { active.value = null } }
function showHover(item: RecentUpdate, e: MouseEvent) {
  hovered.value = item.slug
  mouseX.value = e.clientX
  const row = (e.currentTarget as HTMLElement).getBoundingClientRect()
  mouseY.value = row.bottom + 16
}
function hideHover(item: RecentUpdate) { if (hovered.value === item.slug) { hovered.value = null } }
function onMouseMove(e: MouseEvent, item: RecentUpdate) {
  if (hovered.value === item.slug) {
    mouseX.value = e.clientX
  }
}
</script>
<template>
  <section class="home-recent" aria-labelledby="home-recent-title">
    <div class="home-section-heading"><span class="heading" data-level="8">LATEST SIGNALS / {{ RECENT_UPDATES.length.toString().padStart(2, '0') }}</span></div>
    <div v-if="RECENT_UPDATES.length" class="home-recent__list">
      <div v-for="item in RECENT_UPDATES" :key="item.slug" class="home-recent__item">
        <RouterLink
          :to="item.href"
          class="home-recent__row"
          :data-slug="item.slug"
          @focus="showFocus(item)"
          @blur="hideFocus(item)"
          @mouseenter="showHover(item, $event)"
          @mouseleave="hideHover(item)"
          @mousemove="onMouseMove($event, item)"
        >
          <span class="home-recent__channel">{{ item.nativeChannel }}</span>
          <time :datetime="item.date">{{ item.date }}</time>
          <span class="home-recent__title">{{ item.title }}</span>
        </RouterLink>
        <ContentMagnifier
          v-if="active === item.slug || hovered === item.slug"
          :item="item"
          :x="mouseX"
          :y="mouseY"
        />
      </div>
    </div>
    <p v-else class="home-recent__empty">还没有带日期的更新。</p>
  </section>
</template>
<style scoped>
.home-recent { position: relative; } .home-section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: var(--theme-spacing-md); margin-bottom: var(--theme-spacing-md); } .home-section-heading h2 { margin: 0; font-size: var(--theme-font-size-lg); } .home-recent__list { display: grid; gap: var(--theme-spacing-xs); width: min(100%, 480px); } .home-recent__item { position: relative; } .home-recent__row { display: grid; grid-template-columns: 4.5rem 6.2rem minmax(0,1fr); align-items: center; gap: var(--theme-spacing-sm); min-height: 2.45rem; padding: var(--theme-spacing-xs) var(--theme-spacing-sm); border: 1px solid var(--theme-border); border-radius: var(--theme-radius-sm); background: transparent; color: var(--theme-on-surface); font-family: var(--theme-font-mono); font-size: var(--theme-font-size-sm); text-decoration: none; transition: background 160ms ease, border-color 160ms ease, transform 160ms ease; animation: home-rise 200ms both; } .home-recent__row:hover, .home-recent__row:focus-visible { border-color: var(--theme-primary); background: var(--theme-scrim); transform: translateX(3px); } .home-recent__channel, .home-recent__row time, .home-recent__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .home-recent__channel { color: var(--theme-primary); } .home-recent__row time { opacity: .64; } .home-recent__empty { margin: 0; opacity: .65; } @keyframes home-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @media (prefers-reduced-motion: reduce) { .home-recent__row { animation: none; } } @media (max-width: 480px) { .home-recent__row { grid-template-columns: 3.8rem 5.8rem minmax(0,1fr); font-size: var(--theme-font-size-xs); } }
</style>