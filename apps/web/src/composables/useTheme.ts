// AGENTS.md §9.3: composable 必须以 use 开头
// AGENTS.md §9.5: 路径/阈值不硬编码在客户端
// AGENTS.md §5 #9: dark/light 两边都显式（值在 tokens.ts）
//
// 2026-10-01 人类决定：站点固定浅色主题，深色入口已禁用。
//   - 不再读取 / 写入 localStorage 偏好；
//   - 不再暴露 set / toggle（AppBar 的切换开关同步移除）；
//   - Vuetify name 与 <html> 根类恒为 light。
// tokens.ts 里 light/dark 两套 palette 与 app.config.ts 的两套主题定义
// 仍然保留，未来若要恢复深色，只需在这里与 index.html 引导脚本里放开。
//
// 它不直接调用 useTheme()，而是返回一个工厂 useTheme()
// 调用站点：const { theme, palette } = useTheme()

import { computed, onMounted, ref } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'
import { palettes, type ThemeName } from '@/styles/tokens'

const LIGHT: ThemeName = 'light'

// 把主题类挂到 <html> 上（Vuetify 3 默认只挂到 .v-application）。
// body 在 .v-application 外，body 需要 <html> 上有 .v-theme--* 类才能消费
// tokens.scss 里挂在 .v-theme--* 选择器下的 CSS 变量（--theme-background 等）。
function syncRootClass(name: ThemeName): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.classList.toggle('v-theme--light', name === 'light')
  html.classList.toggle('v-theme--dark', name === 'dark')
}

// 单例：所有调用 useTheme() 的组件共享同一 state。
const current = ref<ThemeName>(LIGHT)
let bound = false

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme()

  if (!bound) {
    bound = true

    // 客户端首次 setup：同步状态与根类（HTML 引导脚本已在首绘前设好 light）。
    if (typeof window !== 'undefined') {
      syncRootClass(LIGHT)
    }

    // mounted 后再应用 Vuetify name，避免 SSG 默认主题与 hydration 结构冲突。
    onMounted(() => {
      vuetifyTheme.global.name.value = current.value
      syncRootClass(current.value)
      if (typeof window !== 'undefined') {
        document.documentElement.style.colorScheme = current.value
      }
    })
  }

  return {
    theme: computed<ThemeName>(() => current.value),
    palette: computed(() => palettes[current.value])
  }
}
