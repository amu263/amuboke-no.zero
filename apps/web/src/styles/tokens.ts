// 单元 2: 设计 token — 单 source of truth
// AGENTS.md §5 #9: dark/light 都显式声明
// AGENTS.md §9.5: 不引第三方脚本/UI 库
//
// 设计：tokens.ts 是「数值/语义」唯一来源。
//   - app.config.ts 里 Vuetify 主题的 colors 直接从这里读，保证暗/亮切换只改一处。
//   - tokens.scss 在 :root / .v-theme--dark 下把这些 token 展开为 CSS 变量
//     （--theme-*），组件样式全部走 CSS 变量。

export type ThemeName = 'light' | 'dark'

export interface Palette {
  // AGENTS.md §3 主题三件套（背景/面/表面变体）+ 语义色
  background: string
  surface: string
  surfaceVariant: string
  primary: string
  secondary: string
  accent: string
  error: string
  info: string
  success: string
  warning: string
  onBackground: string
  onSurface: string
  // §5 #5: 边框色兑底
  border: string
  // 自写组件需要透明/不透明叠加的辅助色
  scrim: string
  // 单元 3: 文章页 pre 块（玻璃+彩虹）需要比 scrim 更强的蒙层
  scrimStrong: string
  // 纸质：磨砂玻璃 — backdrop-filter blur 量（px 数值）
  glassBlur: string
  // 纸质：磨砂玻璃表面色（极低不透明度，叠在 surface 上效果最好）
  glass: string
  // 背景网格线（obsidian 密集方格）— 见 base.css body::before
  grid: string
  // 明日方舟风格：边框高光（卡片/面板内边缘的 1px 亮线）
  borderGlow: string
  // 明日方舟风格：内阴影（面板内嵌感）
  innerShadow: string
}

export const palettes: Record<ThemeName, Palette> = {
  light: {
    // 明日方舟风格：亮色保持清新但略偏暖灰
    background: '#f0f2f5',
    surface: '#fafbfd',
    surfaceVariant: '#e8ebf0',
    // 浅色主题：青绿色主色
    primary: 'rgb(47, 181, 160)',
    secondary: '#6b7280',
    accent: '#2fb5a0',
    error: '#d94545',
    info: '#3b6ef5',
    success: '#2fb5a0',
    warning: '#d4920a',
    onBackground: '#1a1d24',
    onSurface: '#1a1d24',
    border: 'rgb(0 0 0 / 0.10)',
    scrim: 'rgb(0 0 0 / 0.05)',
    scrimStrong: 'rgb(250 251 253 / 0.80)',
    // 苍苍蓝 35% 透明（柔和的雾蓝色调）
    grid: 'rgba(165, 192, 212, 0.35)',
    // 纸质：磨砂玻璃
    glassBlur: '10px',
    glass: 'rgba(250, 251, 253, 0.80)',
    // 明日方舟风格：金色边框高光（亮色下更柔和）
    borderGlow: 'rgb(196 136 58 / 0.28)',
    // 明日方舟风格：内阴影（面板内嵌感）
    innerShadow: 'inset 0 1px 0 rgb(196 136 58 / 0.18), inset 0 -1px 0 rgb(0 0 0 / 0.06)'
  },
  dark: {
    // 明日方舟风格：更深沉的背景，类似游戏内控制台
    background: '#090b0e',
    surface: '#111520',
    surfaceVariant: '#181d28',
    // 明日方舟风格：主色改为琥珀金，衬以青色
    primary: '#e8a83e',
    secondary: '#7a8599',
    accent: '#3dd9c4',
    error: '#ff6b6b',
    info: '#7aa2ff',
    success: '#3dd9c4',
    warning: '#f0c060',
    onBackground: '#d4d8e0',
    onSurface: '#d4d8e0',
    // 明日方舟风格：更明显的边框（金色调）
    border: 'rgb(232 168 62 / 0.22)',
    scrim: 'rgb(0 0 0 / 0.32)',
    scrimStrong: 'rgb(9 11 14 / 0.82)',
    // 琥珀金 12% 透明（温暖不刺眼，与主题色呼应）
    grid: 'rgba(232, 168, 62, 0.12)',
    // 纸质：磨砂玻璃 — 明日方舟风格：更深更暗的面板
    glassBlur: '8px',
    glass: 'rgba(9, 11, 14, 0.85)',
    // 明日方舟风格：金色边框高光（内边缘 1px 亮线）
    borderGlow: 'rgb(232 168 62 / 0.35)',
    // 明日方舟风格：内阴影（面板内嵌感）
    innerShadow: 'inset 0 1px 0 rgb(232 168 62 / 0.15), inset 0 -1px 0 rgb(0 0 0 / 0.4)'
  }
}

// 间距（rem 基准）
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2.5rem',
  xxl: '4rem'
}

// 字号（rem）
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem'
}

// 圆角
export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  pill: '999px'
}

// 阴影（明日方舟风格：更克制；依赖 border + innerShadow 制造立体感，阴影更轻）
export const shadow = {
  xs: '0 1px 3px rgb(0 0 0 / 0.10)',
  sm: '0 2px 6px rgb(0 0 0 / 0.14)',
  md: '0 4px 12px rgb(0 0 0 / 0.18)',
  lg: '0 8px 20px rgb(0 0 0 / 0.22)',
  xl: '0 12px 32px rgb(0 0 0 / 0.26)',
  '2xl': '0 18px 48px rgb(0 0 0 / 0.30)'
}

// 等宽字体栈（自写 markdown/终端卡片用）
export const fontFamilyMono =
  'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace'

// 客户端持久化 key（AGENTS.md §9.5: 路径/阈值不硬编码到组件里，但 key
// 本身就是「持久化契约」，抽成常量方便以后换 namespace）。
export const THEME_STORAGE_KEY = 'amuboke-no.zero:theme'