<script setup lang="ts">
import type { Comment } from '@/types'

const props = defineProps<{
  comments: Comment[]
  loading?: boolean
}>()

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <section class="comment-list">
    <h2 class="comment-list__title">
      <svg class="comment-list__icon" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-4 4v-4H4a2 2 0 0 1-2-2V5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
      评论
      <span v-if="!loading" class="comment-list__count">[{{ comments.length }}]</span>
    </h2>

    <div v-if="loading" class="comment-list__loading">
      <span class="comment-list__loading-dots">加载中...</span>
    </div>

    <div v-else-if="comments.length === 0" class="comment-list__empty">
      还没有评论，来抢沙发吧~
    </div>

    <ul v-else class="comment-list__items">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
        :class="{ 'comment-item--reply': !!comment.parent }"
      >
        <div class="comment-item__header">
          <span class="comment-item__name">{{ comment.name || '匿名' }}</span>
          <time class="comment-item__time">{{ formatDate(comment.createdAt) }}</time>
        </div>
        <p class="comment-item__body">{{ comment.body }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.comment-list {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--theme-border, currentColor);
}
.comment-list__title {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-lg);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.comment-list__icon {
  width: 1.25em;
  height: 1.25em;
  color: var(--theme-accent);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.comment-list__count {
  opacity: 0.6;
  font-weight: 400;
}
.comment-list__loading,
.comment-list__empty {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  opacity: 0.6;
  padding: 1rem 0;
}
.comment-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.comment-item {
  background: var(--theme-scrim);
  border-radius: var(--theme-radius-md);
  padding: 0.875rem 1rem;
  border-left: 2px solid var(--theme-accent);
}
.comment-item--reply {
  margin-left: 1.5rem;
  border-left-color: var(--theme-accent-secondary, var(--theme-accent));
  opacity: 0.85;
}
.comment-item__header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.375rem;
}
.comment-item__name {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-accent);
  font-weight: 600;
}
.comment-item__time {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.5;
}
.comment-item__body {
  font-size: var(--theme-font-size-base);
  line-height: 1.6;
  margin: 0;
  word-break: keep-all;
  line-break: strict;
}
</style>
