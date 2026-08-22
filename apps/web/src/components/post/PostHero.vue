<script setup lang="ts">
// components/post/PostHero.vue — 文章页 Hero 组件
// AGENTS.md §4: <Domain><Role> 命名；多皮肤组件必须暴露 variant 字面量联合。
// variant: terminal | newspaper | card
import { computed } from 'vue'
import type { PostMeta } from '@/content/build-time-index'
import { MetaLine } from '@/components/ui'

const props = withDefaults(
  defineProps<{
    post: PostMeta
    variant?: 'terminal' | 'newspaper' | 'card'
  }>(),
  { variant: 'card' }
)

const hasCover = computed(() => Boolean(props.post.cover))
</script>

<template>
  <div :class="['post-hero', `post-hero--${variant}`]">
    
    <!-- ========== CARD variant (默认) ========== -->
    <template v-if="variant === 'card'">
      <div v-if="hasCover" class="post-hero__cover">
        <img :src="post.cover" :alt="post.title ?? post.slug" />
      </div>
      <div class="post-hero__body">
        <MetaLine :date="post.date" :tags="(post.tags ?? []).slice(0, 4)" />
        <h1 class="post-hero__title">{{ post.title ?? post.slug }}</h1>
        <p v-if="post.summary" class="post-hero__summary">{{ post.summary }}</p>
        <div v-if="post.tags?.length" class="post-hero__tags">
          <span v-for="t in post.tags" :key="t" class="post-hero__tag">#{{ t }}</span>
        </div>
      </div>
    </template>

    <!-- ========== TERMINAL variant ========== -->
    <template v-else-if="variant === 'terminal'">
      <div class="terminal-card">
        <header class="terminal-card__bar">
          <span class="terminal-card__dots" aria-hidden="true">
            <span class="terminal-card__dot terminal-card__dot--red" />
            <span class="terminal-card__dot terminal-card__dot--yellow" />
            <span class="terminal-card__dot terminal-card__dot--green" />
          </span>
          <span class="terminal-card__title">{{ post.slug }}.md</span>
          <span class="terminal-card__prompt">cat</span>
        </header>
        <div class="terminal-card__body">
          <div class="post-hero-terminal__content">
            <div class="post-hero-terminal__meta">
              <span class="post-hero-terminal__prompt">$</span>
              <span class="post-hero-terminal__cmd">head -n 1 ./{{ post.slug }}.md</span>
            </div>
            <p class="post-hero-terminal__date">{{ post.date ?? '2026-01-01' }}</p>
            <div class="post-hero-terminal__meta">
              <span class="post-hero-terminal__prompt">$</span>
              <span class="post-hero-terminal__cmd">cat ./{{ post.slug }}.md | grep "^title"</span>
            </div>
            <h1 class="post-hero-terminal__title">{{ post.title ?? post.slug }}</h1>
            <div v-if="post.summary" class="post-hero-terminal__meta">
              <span class="post-hero-terminal__prompt">$</span>
              <span class="post-hero-terminal__cmd">cat ./{{ post.slug }}.md | grep "^summary"</span>
            </div>
            <p v-if="post.summary" class="post-hero-terminal__summary">{{ post.summary }}</p>
            <div v-if="post.tags?.length" class="post-hero-terminal__meta">
              <span class="post-hero-terminal__prompt">$</span>
              <span class="post-hero-terminal__cmd">ls ./tags/</span>
            </div>
            <div v-if="post.tags?.length" class="post-hero-terminal__tags">
              <span v-for="t in post.tags" :key="t" class="post-hero-terminal__tag"># {{ t }}</span>
            </div>
            <div class="post-hero-terminal__footer">
              <span class="post-hero-terminal__cursor">█</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== NEWSPAPER variant ========== -->
    <template v-else-if="variant === 'newspaper'">
      <div v-if="hasCover" class="post-hero__cover post-hero__cover--newspaper">
        <img :src="post.cover" :alt="post.title ?? post.slug" />
        <div class="post-hero__cover-overlay" />
      </div>
      <div class="post-hero__body post-hero__body--newspaper">
        <div class="post-hero__newspaper-kicker">ARTICLE</div>
        <h1 class="post-hero__newspaper-title">{{ post.title ?? post.slug }}</h1>
        <p v-if="post.summary" class="post-hero__newspaper-summary">{{ post.summary }}</p>
        <div class="post-hero__newspaper-byline">
          <span class="post-hero__newspaper-date">{{ post.date ?? '2026' }}</span>
          <span v-if="post.tags?.length" class="post-hero__newspaper-sep">·</span>
          <span v-if="post.tags?.length" class="post-hero__newspaper-tags">
            <span v-for="(t, i) in post.tags.slice(0, 3)" :key="t">
              {{ t }}{{ i < Math.min(post.tags!.length - 1, 2) ? ',' : '' }}
            </span>
          </span>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
/* ─── Shared ─── */
.post-hero {
  width: 100%;
}

/* ─── CARD variant ─── */
.post-hero--card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.post-hero__cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--theme-radius-lg);
  border: 1px solid var(--theme-border);
}
.post-hero__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.post-hero__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-hero__title {
  margin: 0;
  font-size: var(--theme-font-size-3xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.post-hero__summary {
  margin: 0;
  opacity: 0.75;
  line-height: 1.6;
  font-size: var(--theme-font-size-base);
}

.post-hero__tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}
.post-hero__tag {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  padding: 0.1em 0.5em;
  border-radius: var(--theme-radius-sm);
  background: var(--theme-scrim);
  color: var(--theme-accent);
}

/* ─── TERMINAL variant ─── */
/* 使用全局 TerminalCard 样式（组件会渲染 terminal-card 类） */
.terminal-card {
  border-radius: var(--theme-radius-lg);
  border: 1px solid var(--theme-border);
  box-shadow: var(--theme-inner-shadow), var(--theme-shadow-sm);
  background: transparent;
  color: var(--theme-on-surface);
  overflow: hidden;
}
.terminal-card__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--theme-scrim);
  border-bottom: 1px solid var(--theme-border);
}
.terminal-card__dots {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}
.terminal-card__dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  display: block;
}
.terminal-card__dot--red    { background: #ff5f57; }
.terminal-card__dot--yellow { background: #ffbd2e; }
.terminal-card__dot--green  { background: #28c840; }
.terminal-card__title {
  flex: 1;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-secondary);
  text-align: center;
  opacity: 0.8;
}
.terminal-card__prompt {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-accent);
  opacity: 0.75;
}
.terminal-card__body {
  padding: 1rem 1.25rem;
  background: var(--theme-surface);
}

.post-hero-terminal__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.post-hero-terminal__meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.post-hero-terminal__prompt {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-accent);
  opacity: 0.8;
}
.post-hero-terminal__cmd {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.7;
}
.post-hero-terminal__date {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  opacity: 0.6;
  margin: 0;
}
.post-hero-terminal__title {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xl);
  font-weight: 700;
  color: var(--theme-on-surface);
  margin: 0.25rem 0;
  line-height: 1.3;
}
.post-hero-terminal__summary {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  opacity: 0.65;
  margin: 0;
  line-height: 1.5;
}
.post-hero-terminal__tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.post-hero-terminal__tag {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-accent);
  opacity: 0.85;
}
.post-hero-terminal__footer {
  margin-top: 0.5rem;
}
.post-hero-terminal__cursor {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-accent);
  animation: blink 1.1s step-end infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ─── NEWSPAPER variant ─── */
.post-hero__cover--newspaper {
  position: relative;
  border-radius: 0;
  margin-bottom: 1.5rem;
}
.post-hero__cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4));
}

.post-hero__body--newspaper {
  border-left: 3px solid var(--theme-accent);
  padding-left: 1rem;
}

.post-hero__newspaper-kicker {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--theme-accent);
  opacity: 0.8;
  margin-bottom: 0.25rem;
}
.post-hero__newspaper-title {
  margin: 0;
  font-size: var(--theme-font-size-4xl);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-family: var(--theme-font-serif, serif);
}
.post-hero__newspaper-summary {
  margin: 0.75rem 0;
  font-size: var(--theme-font-size-lg);
  line-height: 1.6;
  opacity: 0.8;
  font-style: italic;
}
.post-hero__newspaper-byline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.post-hero__newspaper-sep {
  opacity: 0.4;
}
</style>
