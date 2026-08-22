<script setup lang="ts">
// components/ui/TickerText.vue — 滚动字幕
// Usage: <TickerText :items="['hello', 'world']" />
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps<{
  items: string[]
  speed?: number // px per second
}>()

const trackRef = ref<HTMLElement>()
let animFrame = 0
let lastTime = 0
let offset = 0
const speed = props.speed ?? 60

function tick(time: number) {
  if (!trackRef.value) return
  if (lastTime === 0) lastTime = time
  const dt = (time - lastTime) / 1000
  lastTime = time
  offset += speed * dt
  const itemWidth = trackRef.value.scrollWidth / 2
  if (offset >= itemWidth) offset -= itemWidth
  trackRef.value.style.transform = `translateX(-${offset}px)`
  animFrame = requestAnimationFrame(tick)
}

onMounted(() => { animFrame = requestAnimationFrame(tick) })
onUnmounted(() => { cancelAnimationFrame(animFrame) })
</script>

<template>
  <div class="ticker-text" aria-live="off">
    <div class="ticker-text__track" ref="trackRef">
      <span
        v-for="(item, i) in [...items, ...items]"
        :key="i"
        class="ticker-text__item"
      >{{ item }}<span class="ticker-text__sep" aria-hidden="true">//</span></span>
    </div>
  </div>
</template>

<style scoped>
.ticker-text {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
}

.ticker-text__track {
  display: inline-flex;
  will-change: transform;
}

.ticker-text__item {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  padding-right: 0.5rem;
}

.ticker-text__sep {
  color: var(--theme-primary);
  margin: 0 0.75rem;
  opacity: 0.6;
}
</style>
