<script setup lang="ts">
// pages/posts/index.vue — 文章列表页（极客风 Unit 5）
import { computed } from 'vue'
import { POSTS, type PostMeta } from '@/content/build-time-index'
import {
  GlowButton,
  TerminalCard,
  MonoChip,
  SectionHeader,
  DividerDecorate,
  MetaLine,
} from '@/components/ui'

const props = withDefaults(
  defineProps<{
    variant?: 'terminal' | 'newspaper' | 'card'
  }>(),
  { variant: 'card' }
)

const sortedPosts = computed(() =>
  [...POSTS].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
)
</script>

<template>
  <div class="posts-page">
    <div class="posts-page__header">
      <SectionHeader label="POSTS" title="观察" align="center" />
      <p class="posts-page__desc">共 {{ POSTS.length }} 篇文章 · 按日期倒序</p>
    </div>

    <v-container max-width="1000" class="posts-page__content">
      <div class="posts-page__list">
        <TerminalCard
          v-for="post in sortedPosts"
          :key="post.slug"
          :title="post.slug + '.md'"
          prompt="$ cat"
        >
          <article class="post-item">
            <header class="post-item__header">
              <MetaLine :date="post.date" :tags="(post.tags ?? []).slice(0, 4)" />
            </header>
            <h2 class="post-item__title">{{ post.title ?? post.slug }}</h2>
            <p v-if="post.summary" class="post-item__summary">{{ post.summary }}</p>
            <div class="post-item__footer">
              <div class="post-item__tags">
                <MonoChip v-for="t in (post.tags ?? []).slice(0, 3)" :key="t">{{ t }}</MonoChip>
              </div>
              <GlowButton variant="ghost" size="sm" :to="'/posts/' + post.slug">
                阅读 →
              </GlowButton>
            </div>
          </article>
        </TerminalCard>
      </div>

      <div v-if="!POSTS.length" class="posts-page__empty">
        <TerminalCard title="posts" prompt="$">
          <p>还没有文章。去 <MonoChip>src/content/posts/</MonoChip> 写一篇试试。</p>
        </TerminalCard>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.posts-page {
  min-height: 100vh;
  background: transparent;
  color: var(--theme-on-background);
  padding-top: var(--theme-spacing-xl);
}

.posts-page__header {
  text-align: center;
  margin-bottom: var(--theme-spacing-lg);
}

.posts-page__desc {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.7;
  margin-top: -0.5rem;
}

.posts-page__content {
  padding-bottom: var(--theme-spacing-xxl);
}

.posts-page__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--theme-spacing-md);
}

.post-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-item__header {
  margin-bottom: 0.25rem;
}

.post-item__title {
  font-size: var(--theme-font-size-lg);
  font-weight: 600;
  color: var(--theme-on-surface);
  margin: 0;
  line-height: 1.3;
}

.post-item__summary {
  font-size: var(--theme-font-size-sm);
  opacity: 0.7;
  line-height: 1.5;
  flex: 1;
}

.post-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.post-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.posts-page__empty {
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .posts-page__list {
    grid-template-columns: 1fr;
  }
}
</style>
