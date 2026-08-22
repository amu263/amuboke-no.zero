<script setup lang="ts">
// components/ui/TerminalCard.vue — 终端风格卡片
// 明日方舟风格：深色面板 + 细边框 + 内光晕（border-glow + inner-shadow）
// Usage: <TerminalCard title="hello.sh" prompt="$">content</TerminalCard>
defineProps<{
  title?: string
  prompt?: string
  monochrome?: boolean
}>()
</script>

<template>
  <div :class="['terminal-card', { 'terminal-card--mono': monochrome }]">
    <header class="terminal-card__bar">
      <span class="terminal-card__dots" aria-hidden="true">
        <span class="terminal-card__dot terminal-card__dot--red" />
        <span class="terminal-card__dot terminal-card__dot--yellow" />
        <span class="terminal-card__dot terminal-card__dot--green" />
      </span>
      <span v-if="title" class="terminal-card__title">{{ title }}</span>
      <span v-if="prompt" class="terminal-card__prompt">{{ prompt }}</span>
    </header>
    <div class="terminal-card__body">
      <slot />
    </div>
  </div>
</template>


<style scoped>
.terminal-card {
  border-radius: var(--theme-radius-lg);
  /* 明日方舟风格：1px 金色边框 + 内阴影（内嵌感 + 边框高光）*/
  border: 1px solid var(--theme-border);
  box-shadow:
    var(--theme-inner-shadow),
    var(--theme-shadow-sm);
  background: transparent;
  color: var(--theme-on-surface);
  overflow: hidden;
  transition:
    box-shadow 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 220ms ease,
    transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* 明日方舟风格：悬浮时边框变为金色高亮 + 轻微上浮 */
.terminal-card:hover {
  border-color: var(--theme-border-glow);
  box-shadow:
    var(--theme-inner-shadow),
    var(--theme-shadow-md);
  transform: translateY(-1px);
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
  padding: var(--theme-spacing-md);
}

/* Monochrome: removes color bar dots */
.terminal-card--mono .terminal-card__dot {
  background: var(--theme-border);
}
</style>