<script setup lang="ts">
// AGENTS.md §4: <Domain><Role> 命名；多皮肤组件必须暴露 variant 字面量联合。
// 单元 3: PostCard 在 posts 列表页用，v-card 形态。variant 控制边角、是否玻璃、是否带色条。
import { computed } from 'vue'
import type { PostMeta } from '@/content/build-time-index'
import { postRoute } from '@/content/build-time-index'

export type PostCardVariant = 'terminal' | 'newspaper' | 'card'

const props = withDefaults(
  defineProps<{
    post: PostMeta
    variant?: PostCardVariant
  }>(),
  { variant: 'card' }
)

const href = computed(() => postRoute(props.post.slug))
const hasCover = computed(() => Boolean(props.post.cover))
</script>

<template>
  <v-card
    :class="['post-card', `post-card--${variant}`]"
    :variant="variant === 'card' ? 'elevated' : 'tonal'"
    :to="href"
    link
  >
    <div v-if="hasCover && variant === 'newspaper'" class="post-card__cover">
      <img :src="post.cover" :alt="post.title ?? post.slug" loading="lazy" />
      <span class="post-card__cover-fade" />
    </div>

    <v-card-item>
      <div class="post-card__meta">
        <span class="post-card__date">{{ post.date ?? '未注明日期' }}</span>
        <span
          v-for="t in post.tags ?? []"
          :key="t"
          class="post-card__tag"
          :class="`post-card__tag--${variant}`"
        >
          #{{ t }}
        </span>
      </div>
      <v-card-title class="post-card__title">{{ post.title ?? post.slug }}</v-card-title>
      <v-card-subtitle v-if="post.summary" class="post-card__summary">
        {{ post.summary }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-actions v-if="variant === 'terminal'">
      <span class="post-card__prompt">$ cat ./posts/{{ post.slug }}.md</span>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.post-card {
  border: 1px solid var(--theme-border);
  background: transparent;
  color: var(--theme-on-surface);
  transition: transform 160ms ease, border-color 160ms ease;
}
.post-card:hover {
  transform: translateY(-2px);
  border-color: var(--theme-primary);
}

.post-card__meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  font-size: var(--theme-font-size-xs);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}
.post-card__date {
  font-family: var(--theme-font-mono);
}

.post-card__tag {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  padding: 0.05em 0.4em;
  border-radius: var(--theme-radius-sm);
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
}
.post-card__tag--terminal {
  color: var(--theme-accent);
}
.post-card__tag--newspaper {
  font-style: italic;
}

.post-card__title {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.post-card__summary {
  opacity: 0.75;
  line-height: 1.5;
}

.post-card__cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}
.post-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.post-card__cover-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, var(--theme-surface));
}

.post-card__prompt {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.55;
}
</style>