<script setup lang="ts">
// components/ui/CodeBlock.vue — 代码块（彩虹渐变 + 玻璃材质）
// Usage: <CodeBlock lang="bash">npm install</CodeBlock>
defineProps<{
  lang?: string
  code?: string
}>()
</script>

<template>
  <div class="code-block" :data-lang="lang">
    <div v-if="lang" class="code-block__header">
      <span class="code-block__dot" aria-hidden="true" />
      <span class="code-block__lang">{{ lang }}</span>
    </div>
    <pre class="code-block__pre"><code><slot>{{ code }}</slot></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  border-radius: var(--theme-radius-lg);
  overflow: hidden;
  border: 1px solid var(--theme-border);
  box-shadow: var(--theme-shadow-sm);
  position: relative;
}

/* Rainbow conic-gradient background */
.code-block__pre {
  margin: 0;
  padding: var(--theme-spacing-md) var(--theme-spacing-lg);
  background:
    conic-gradient(
      from 0deg at 50% 0%,
      #7c3aed 0deg, #3b82f6 90deg, #06b6d4 180deg,
      #10b981 270deg, #f59e0b 315deg, #ef4444 360deg
    ),
    var(--theme-scrim-strong);
  background-blend-mode: overlay;
  overflow-x: auto;
}

.code-block__pre code {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-on-surface);
  line-height: 1.6;
  display: block;
}

.code-block__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: var(--theme-scrim);
  border-bottom: 1px solid var(--theme-border);
}

.code-block__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--theme-primary);
  opacity: 0.7;
}

.code-block__lang {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-secondary);
  opacity: 0.7;
}
</style>
