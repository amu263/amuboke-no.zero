<script setup lang="ts">
// AGENTS.md §0: 主题切换器以外的复杂主题一律不做 — 只 1 个胶囊 toggle
// AGENTS.md §5 #8: 暗色下 outlined 边框刺眼；这里用 flat（无边框、半透明底）
// AGENTS.md §2: 这个组件归 layout/，由 app.vue 引用
// 单元 4 Todo 2: 固定磨砂导航只保留四通道链接 + 主题切换，品牌/Bilibili 留给 hero。
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
const route = useRoute()

const isDark = computed(() => theme.value === 'dark')
const themeSwitchLabel = '主题模式'
const nextLabel = computed(() => (isDark.value ? '切到亮色' : '切到暗色'))

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

    <!-- Theme toggle -->
    <button
      type="button"
      class="theme-toggle"
      :class="{ 'is-dark': isDark }"
      role="switch"
      :aria-checked="isDark ? 'true' : 'false'"
      :aria-label="themeSwitchLabel"
      :title="nextLabel"
      @click="toggle()"
    >
      <span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="2.5" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="21.5" y2="12" />
            <line x1="4.8" y1="4.8" x2="6.6" y2="6.6" />
            <line x1="17.4" y1="17.4" x2="19.2" y2="19.2" />
            <line x1="4.8" y1="19.2" x2="6.6" y2="17.4" />
            <line x1="17.4" y1="6.6" x2="19.2" y2="4.8" />
          </g>
        </svg>
      </span>
      <span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a0.5 0.5 0 0 0-0.7-0.5 9.5 9.5 0 1 0 12.2 12.2 0.5 0.5 0 0 0-0.5-0.7Z"
            fill="currentColor"
          />
        </svg>
      </span>
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

/* ── 主题切换胶囊 ──────────────────────────────────── */
.theme-toggle {
  padding: 0;
  margin: 0;
  position: relative;
  display: inline-flex;
  flex: 0 0 56px;
  align-items: center;
  width: 56px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  transition: background-color 200ms ease;
  font: inherit;
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: 2px;
}

/* 滑块 */
.theme-toggle::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--theme-surface);
  box-shadow: var(--theme-shadow-sm);
  transition: transform 200ms ease;
}

.theme-toggle.is-dark::before {
  transform: translateX(28px);
}

.theme-toggle__icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.35;
  transition: opacity 200ms ease, color 200ms ease;
}

.theme-toggle__icon--sun {
  left: 7px;
}
.theme-toggle__icon--moon {
  right: 7px;
}

.theme-toggle .theme-toggle__icon--sun {
  opacity: 0.25;
}
.theme-toggle .theme-toggle__icon--moon {
  opacity: 0.25;
}

.theme-toggle:not(.is-dark) .theme-toggle__icon--sun {
  opacity: 1;
}
.theme-toggle.is-dark .theme-toggle__icon--moon {
  opacity: 1;
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