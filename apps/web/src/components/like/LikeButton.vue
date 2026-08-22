<script setup lang="ts">
defineProps<{
  count: number
  hasLiked: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  like: []
}>()
</script>

<template>
  <button
    class="like-btn"
    :class="{ 'like-btn--liked': hasLiked }"
    :disabled="loading"
    @click="emit('like')"
    :title="hasLiked ? '已经点过赞了' : '喜欢这篇文章'"
  >
    <svg
      class="like-btn__icon"
      viewBox="0 0 20 20"
      aria-hidden="true"
      :fill="hasLiked ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 0 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656z"/>
    </svg>
    <span class="like-btn__count">{{ count }}</span>
  </button>
</template>

<style scoped>
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: var(--theme-scrim);
  border: 1px solid var(--theme-border, currentColor);
  border-radius: var(--theme-radius-pill);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-on-surface);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.like-btn:hover:not(:disabled) {
  border-color: var(--theme-accent);
  color: var(--theme-accent);
}
.like-btn--liked {
  color: var(--theme-accent);
  border-color: var(--theme-accent);
  background: rgba(var(--theme-accent-rgb, 122, 162, 255) / 0.12);
}
.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.like-btn__icon {
  width: 1.125em;
  height: 1.125em;
  transition: transform 0.2s;
}
.like-btn:hover:not(:disabled) .like-btn__icon {
  transform: scale(1.15);
}
.like-btn--liked .like-btn__icon {
  animation: heart-pop 0.3s ease;
}
@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.like-btn__count {
  font-weight: 600;
  min-width: 1.5ch;
  text-align: left;
}
</style>
