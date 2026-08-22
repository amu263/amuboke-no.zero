import { defineConfig, presetUno, presetAttributify } from 'unocss'

// AGENTS.md §9.1 — UnoCSS 仅做极客风细节补足，不替代 Vuetify
export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify()
  ],
  theme: {
    colors: {
      // 让原子类颜色直接吃 Vuetify token 的 CSS 变量，避免再维护一份色板
      primary: 'var(--v-theme-primary)',
      surface: 'var(--v-theme-surface)'
    }
  }
})