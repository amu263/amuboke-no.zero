// Vuetify 插件入口
// AGENTS.md §5 #9: dark/light 都显式声明（从 app.config.ts 导入）
import { createVuetify } from 'vuetify'
import { lightTheme, darkTheme } from '../../app.config'

export const vuetify = createVuetify({
  theme: {
    // 站点固定浅色主题（2026-10-01）：深色入口已禁用，见 src/composables/useTheme.ts
    defaultTheme: 'light',
    themes: { light: lightTheme, dark: darkTheme }
  },
  defaults: {
    // AGENTS.md §5 #8: 按钮 variant 选择规范
    VBtn: { rounded: 'lg' },
    VCard: { rounded: 'lg' }
  }
})