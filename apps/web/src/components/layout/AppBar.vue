<script setup lang="ts">
// AGENTS.md §0: 主题切换器以外的复杂主题一律不做
// AGENTS.md §5 #8: 暗色下 outlined 边框刺眼；这里用 flat（无边框、半透明底）
// AGENTS.md §2: 这个组件归 layout/，由 app.vue 引用
// 单元 4 Todo 2: 固定磨砂导航只保留通道链接，品牌/Bilibili 留给 hero。
// 2026-10-01 人类决定：站点固定浅色主题，主题切换开关已移除。
import { useRoute } from 'vue-router'

const route = useRoute()

interface NavLink {
  to: string
  label: string
}
const navLinks: NavLink[] = [
  { to: '/', label: '首页' },
  { to: '/posts', label: '文章' },
  { to: '/gallery', label: '图集' },
  { to: '/projects', label: '项目' },
  { to: '/listen', label: '听见' }
]

function isNavLinkActive(link: NavLink): boolean {
  return route.path === link.to || route.path.startsWith(`${link.to}/`)
}

const emit = defineEmits<{
  'open-search': []
}>()
</script>

<template>
  <v-app-bar
    :elevation="0"
    density="compact"
    class="app-bar"
    fixed
  >
    <div class="app-bar__centered">
    <nav class="app-bar__nav" aria-label="主导航">
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="app-bar__link"
        :class="{ 'is-active': isNavLinkActive(link) }"
      >
        {{ link.label }}
      </router-link>
    </nav>

    <!-- Search button -->
    <button
      type="button"
      class="search-btn"
      aria-label="搜索"
      title="搜索 (Ctrl+K)"
      @click="emit('open-search')"
    >
      <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="M15 15 18 18" stroke-linecap="round" />
      </svg>
    </button>
    </div>
  </v-app-bar>
</template>

<style scoped>
.app-bar {
  background: var(--theme-surface);
  background: color-mix(in srgb, var(--theme-surface) 82%, transparent);
  color: var(--theme-on-surface);
  border-bottom: 1px solid var(--theme-border);
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
}

.app-bar :deep(.v-toolbar__content) {
  gap: var(--theme-spacing-sm);
  padding-inline: var(--theme-spacing-md);
  min-width: 0;
}

.app-bar__centered {
  display: flex;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  gap: var(--theme-spacing-md);
  min-width: 0;
}

.app-bar__nav {
  display: flex;
  flex-wrap: nowrap;
  flex: 0 0 auto;
  gap: var(--theme-spacing-xs);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  overscroll-behavior-inline: contain;
}
.app-bar__link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  padding: var(--theme-spacing-xs) var(--theme-spacing-md);
  border-radius: var(--theme-radius-md);
  color: var(--theme-on-surface);
  text-decoration: none;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  white-space: nowrap;
  opacity: 0.7;
  transition: background-color 160ms ease, opacity 160ms ease, color 160ms ease;
}
.app-bar__link:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: 2px;
}
.app-bar__link:hover {
  opacity: 1;
  background: var(--theme-scrim);
}
.app-bar__link.is-active {
  opacity: 1;
  color: var(--theme-primary);
  background: var(--theme-scrim);
}

/* ── 搜索按钮 ──────────────────────────────────── */
.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--theme-radius-md);
  border: 0;
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
  flex-shrink: 0;
}
.search-btn:hover {
  background: color-mix(in srgb, var(--theme-scrim) 150%, transparent);
  color: var(--theme-primary);
}
.search-btn:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: 2px;
}
.search-btn svg {
  display: block;
}

@media (max-width: 640px) {
  .app-bar :deep(.v-toolbar__content) {
    gap: var(--theme-spacing-xs);
    padding-inline: var(--theme-spacing-sm);
  }

  .app-bar__nav {
    flex: 1 1 auto;
    gap: var(--theme-spacing-xs);
  }
  .app-bar__link {
    padding: var(--theme-spacing-xs) var(--theme-spacing-sm);
    font-size: var(--theme-font-size-xs);
  }
}
</style>