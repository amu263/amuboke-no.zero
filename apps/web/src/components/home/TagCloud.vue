<script setup lang="ts">
import { computed } from 'vue'
import type { PostTagCloudItem } from '@/content/build-time-index'

interface TagPlacement extends PostTagCloudItem {
  x: number
  y: number
  fontSize: number
  rotation: 0 | 90
  tone: number
  opacity: number
  weight: number
}

const VIEWBOX_WIDTH = 1200
const VIEWBOX_HEIGHT = 400
const EDGE_PADDING = 3

const props = defineProps<{
  tags: readonly PostTagCloudItem[]
}>()

const maxCount = computed(() => Math.max(...props.tags.map((tag) => tag.count), 1))

function tagHash(text: string): number {
  return Array.from(text).reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) >>> 0), 17)
}

function textUnits(text: string): number {
  return Array.from(text).reduce((total, char) => total + (char.charCodeAt(0) > 255 ? 1 : 0.62), 0)
}

function makePlacements(tags: readonly PostTagCloudItem[]): TagPlacement[] {
  const ordered = [...tags].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
  const rows = ordered.length > 32 ? 5 : 4
  const columns = Math.ceil(ordered.length / rows)
  const cellWidth = VIEWBOX_WIDTH / columns
  const cellHeight = VIEWBOX_HEIGHT / rows

  return ordered.map((tag, index) => {
    const seed = tagHash(tag.tag)
    const column = index % columns
    const row = Math.floor(index / columns)
    const preferredRotation: 0 | 90 = (row + column * 2) % 5 === 0 ? 90 : 0
    const units = textUnits(tag.tag)
    const baseSize = 32 + (tag.count / maxCount.value) * 44
    const maxSize = preferredRotation === 0
      ? Math.min((cellWidth - EDGE_PADDING) / units, (cellHeight - EDGE_PADDING) / 1.12)
      : Math.min((cellHeight - EDGE_PADDING) / units, (cellWidth - EDGE_PADDING) / 1.12)
    const fontSize = Math.max(12, Math.min(baseSize, maxSize))

    return {
      ...tag,
      x: column * cellWidth + cellWidth / 2,
      y: row * cellHeight + cellHeight / 2,
      fontSize,
      rotation: preferredRotation,
      tone: seed % 4,
      opacity: Number((0.5 + (tag.count / maxCount.value) * 0.25 + (seed % 16) / 100).toFixed(2)),
      weight: 700
    }
  })
}

const placements = computed(() => makePlacements(props.tags))
</script>

<template>
  <svg class="tag-cloud" viewBox="0 0 1200 400" role="img" aria-label="文章标签云">
    <text
      v-for="tag in placements"
      :key="tag.tag"
      class="tag-cloud__tag"
      :class="'tag-cloud__tag--tone-' + tag.tone"
      :x="tag.x"
      :y="tag.y"
      :font-size="tag.fontSize"
      :transform="'rotate(' + tag.rotation + ' ' + tag.x + ' ' + tag.y + ')'"
      :style="{ opacity: tag.opacity, fontWeight: tag.weight }"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      <title>{{ tag.tag }}：{{ tag.count }} 篇文章</title>
      {{ tag.tag }}
    </text>
  </svg>
</template>

<style scoped>
/* A fixed SVG canvas gives every tag a bounded mosaic cell and hard clipping. */
.tag-cloud {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: strict;
  color: var(--theme-on-background);
  pointer-events: none;
}

.tag-cloud__tag {
  font-family: var(--theme-font-mono);
  letter-spacing: 1px;
}

.tag-cloud__tag--tone-0 { fill: var(--theme-primary); }
.tag-cloud__tag--tone-1 { fill: var(--theme-accent); }
.tag-cloud__tag--tone-2 { fill: var(--theme-secondary); }
.tag-cloud__tag--tone-3 { fill: var(--theme-on-background); }
</style>

