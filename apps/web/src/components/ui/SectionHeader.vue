<script setup lang="ts">
// components/ui/SectionHeader.vue — 带装饰线的区域标题
// Usage: <SectionHeader label="PROJECTS" title="我的项目" />
defineProps<{
  label?: string
  title: string
  align?: 'left' | 'center'
}>()
</script>

<template>
  <header :class="['section-header', `section-header--${align ?? 'left'}`]">
    <span v-if="label" class="section-header__label">{{ label }}</span>
    <h2 class="section-header__title">{{ title }}</h2>
    <span class="section-header__line" aria-hidden="true" />
  </header>
</template>

<style scoped>
.section-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: var(--theme-spacing-lg);
}

.section-header--center {
  align-items: center;
  text-align: center;
}

.section-header__label {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.section-header__title {
  font-size: var(--theme-font-size-2xl);
  font-weight: 700;
  color: var(--theme-on-surface);
  line-height: 1.2;
  margin: 0;
}

.section-header__line {
  display: block;
  height: 2px;
  width: 3rem;
  background: linear-gradient(to right, var(--theme-primary), var(--theme-accent));
  border-radius: 1px;
  margin-top: 0.25rem;
}

.section-header--center .section-header__line {
  width: 5rem;
}
</style>
