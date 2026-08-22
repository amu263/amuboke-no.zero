<script setup lang="ts">
// components/ui/MetaLine.vue — 元数据行（date + tags + reading-time）
// Usage: <MetaLine :date="post.date" :tags="post.tags" />
defineProps<{
  date?: string
  tags?: string[]
  readingTime?: number // minutes
  separator?: string
}>()
</script>

<template>
  <div class="meta-line">
    <time v-if="date" class="meta-line__date" :datetime="date">{{ date }}</time>
    <span v-if="readingTime" class="meta-line__time">{{ readingTime }}min</span>
    <span
      v-for="t in (tags ?? [])"
      :key="t"
      class="meta-line__tag"
    >{{ separator ?? '#' }}{{ t }}</span>
  </div>
</template>

<style scoped>
.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.7;
  color: var(--theme-secondary);
}

.meta-line__date {
  color: var(--theme-secondary);
}

.meta-line__time {
  color: var(--theme-accent);
  opacity: 0.8;
}

.meta-line__tag {
  color: var(--theme-primary);
  opacity: 0.75;
}
</style>
