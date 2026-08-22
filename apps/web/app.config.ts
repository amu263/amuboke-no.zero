// Vuetify 主题配置（light + dark 均显式声明，AGENTS.md §5 #9）
// AGENTS.md §9.5: 不引第三方脚本/UI 库
//
// 单元 2: 颜色 token 单一来源 = src/styles/tokens.ts。
//   这里只做「把 palette 映射到 Vuetify 期望的 colors 字段」，颜色值不重复写。
//   CSS 变量贯通由 tokens.scss 在 :root/.v-theme--dark 下同步输出。
import type { ThemeDefinition } from 'vuetify'
import { palettes } from './src/styles/tokens'

function vuetifyTheme(p: typeof palettes.light): ThemeDefinition {
  return {
    dark: false, // 这里只决定形状；真实 dark/light 由 createVuetify 的 key 控制
    colors: {
      background: p.background,
      surface: p.surface,
      'surface-variant': p.surfaceVariant,
      primary: p.primary,
      secondary: p.secondary,
      accent: p.accent,
      error: p.error,
      info: p.info,
      success: p.success,
      warning: p.warning,
      'on-background': p.onBackground,
      'on-surface': p.onSurface
    }
  }
}

export const lightTheme: ThemeDefinition = { ...vuetifyTheme(palettes.light), dark: false }
export const darkTheme: ThemeDefinition = { ...vuetifyTheme(palettes.dark), dark: true }