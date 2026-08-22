// AGENTS.md §9.3: composable 必须以 use 开头
// AGENTS.md §9.5: 路径/阈值不硬编码在客户端 → key 抽成常量
// AGENTS.md §5 #9: dark/light 两边都显式（值在 tokens.ts，这里只切 name）
//
// useTheme 暴露三个东西：
//   - theme       : 当前主题名（响应式）
//   - set(name)   : 设成指定主题，并持久化
//   - toggle()    : dark ↔ light 切换
//
// 它不直接调用 useTheme()，而是返回一个工厂 useTheme()
// 调用站点：const { theme, toggle, set } = useTheme()

import { computed, ref, watch } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'
import { palettes, THEME_STORAGE_KEY, type ThemeName } from '@/styles/tokens'

// 把主题类挂到 <html> 上（Vuetify 3 默认只挂到 .v-application）。
// body 在 .v-application 外，body 需要 <html> 上有 .v-theme--* 类才能消费
// tokens.scss 里挂在 .v-theme--* 选择器下的 CSS 变量（--theme-background 等）。
function syncRootClass(name: ThemeName): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.classList.toggle('v-theme--light', name === 'light')
  html.classList.toggle('v-theme--dark', name === 'dark')
}

function isThemeName(v: unknown): v is ThemeName {
  return v === 'light' || v === 'dark'
}

function readPersisted(): ThemeName | null {
  // AGENTS.md §9.5: 客户端硬编码路径/阈值是禁止行为；localStorage key 走常量
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeName(raw) ? raw : null
  } catch {
    // SSR / 隐私模式 / 被禁用的 storage → 忽略
    return null
  }
}

function persist(name: ThemeName): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, name)
  } catch {
    // ignore
  }
}

// 单例：所有调用 useTheme() 的组件共享同一个 state
// 初始化顺序：
//   1. SSR 阶段（无 window）→ 默认 'dark'
//   2. 客户端首次 setup → 同步读 localStorage，立即应用 → 避免 hydration mismatch
//   3. 任何后续对 Vuetify theme 的修改 → 反向同步进 current + persist
const current = ref<ThemeName>('dark')
let bound = false

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme()

  if (!bound) {
    bound = true

    // 客户端首次进入：同步读 localStorage 并立刻把 Vuetify theme 切到持久化值。
    // 这里在 setup 同步段跑，所以 onMounted 之前 component setup 已经看到正确状态。
    if (typeof window !== 'undefined') {
      const saved = readPersisted()
      const initial: ThemeName = saved ?? 'dark'
      if (vuetifyTheme.global.name.value !== initial) {
        vuetifyTheme.global.name.value = initial
      }
      current.value = initial
      syncRootClass(initial)
    }

    // 任何方式改变 Vuetify 主题（其它组件 / 调试器 / HMR）都同步进 current
    watch(
      () => vuetifyTheme.global.name.value,
      (n) => {
        if (isThemeName(n) && n !== current.value) {
          current.value = n
          if (typeof window !== 'undefined') {
            persist(n)
            syncRootClass(n)
          }
        }
      }
    )
  }

  function set(name: ThemeName): void {
    vuetifyTheme.global.name.value = name
    current.value = name
    if (typeof window !== 'undefined') {
      persist(name)
      syncRootClass(name)
    }
  }

  function toggle(): void {
    set(current.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme: computed<ThemeName>(() => current.value),
    palette: computed(() => palettes[current.value]),
    set,
    toggle
  }
}