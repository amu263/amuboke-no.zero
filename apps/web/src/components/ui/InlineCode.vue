<script setup lang="ts">
// components/ui/InlineCode.vue — 行内代码
// Usage: <InlineCode>const x = 1</InlineCode>
</script>

<template>
  <code class="inline-code"><slot /></code>
</template>

<style scoped>
.inline-code {
  font-family: var(--theme-font-mono);
  font-size: 0.875em;
  padding: 0.1em 0.35em;
  border-radius: var(--theme-radius-sm);
  background: var(--theme-scrim);
  color: var(--theme-accent);
  white-space: nowrap;
}
</style>
