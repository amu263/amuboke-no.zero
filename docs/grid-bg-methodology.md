# 博客背景网格 — 实现方法论（给修复者）

> 用途：本文档把「obsidian 风格 28×28 网格背景」的所有零件、装配顺序、所有坑、自检流程一次性写齐。
> 读者：接手本项目后搞坏 / 找不到网格的 AI agent。
> 状态：单元 2 / 单元 3 反复沉淀的真实坑，已通过浏览器矩阵 18 张截图复核。
> 适用范围：`E:\\aipj\\amuboke-no.zero` 仓库，apps/web（Vue 3 + Vuetify 3 + Vite + ViteSSG）。
> 关联：本文档是 `AGENTS.md §5 #18` 的"完整版 / 重写指南"——AGENTS.md 那条只列症状，本文件列修法。

---

## 0. 一句话先搞清

**网格背景 = 真实 DOM 元素 + 主题色 token + CSS 变量驱动 + 在 `<v-app>` 之下 / 在 body 之上。**

任何一环掉链子都看不到网格。看不到网格时，**永远先按 §6 的诊断清单走一遍**，不要猜。

---

## 1. 设计意图（为什么这套架构）

| 需求 | 对应方案 |
| --- | --- |
| 网格跟主题走（暗 / 亮） | `var(--theme-grid)` CSS 变量，token 来自 `palettes[themeName].grid` |
| 网格在 Vuetify 全屏 overlay 之下 | 真实 DOM `<div class="grid-bg">` 作为 `<v-app>` 的兄弟节点，`z-index: 0`；`.v-application` 配 `z-index: 1; background: transparent` 让网格透出来 |
| 网格不被 Vuetify / UnoCSS reset 吞 | 用**真实 DOM 元素**而不是 `body::before` / `html::before`；不放在 `<style scoped>` 里（Vue Fragment 静态缓存会让第一个子节点没有 `data-v-xxx` hash，scoped 选择器不命中） |
| 网格不挡交互 | `pointer-events: none` |
| 网格不和 AppBar / 卡片撞色 | 用**主色色调**（琥珀金 / 蓝）而不是纯白 / 纯黑——和 `--theme-surface` 有色相差 |
| 网格永远 repeat 不被 reset 改 `no-repeat` | 显式 `background-repeat: repeat !important;` |
| 网格线密度可读 | 28×28 px + 1 px 描边，主色调 + 半透明（dark ~0.18 / light ~0.10） |

---

## 2. 五层架构（缺一不可）

```
┌──────────────────────────────────────────────────────────────┐
│ Layer 5: <RouterView> 渲染出的页面组件（posts/gallery/...）    │
│   - 自己的 background / card / surface, 不动网格层             │
├──────────────────────────────────────────────────────────────┤
│ Layer 4: .v-application (Vuetify 根)                          │
│   - position: relative; z-index: 1; background: transparent   │
│   - 必须显式让网格透出来（否则 Vuetify 默认 bg 盖死）           │
├──────────────────────────────────────────────────────────────┤
│ Layer 3: <div class="grid-bg"> 真实 DOM（app.vue 兄弟节点）    │
│   - position: fixed; inset: 0; z-index: 0; pointer-events:none│
│   - background-image: 双层 repeating-linear-gradient          │
│   - background-color: color-mix(--theme-grid 18%, transparent)│
│   - 关键: 必须在 <v-app> 之前 (Vue template 顺序决定 DOM 顺序) │
├──────────────────────────────────────────────────────────────┤
│ Layer 2: <body> bg via tokens.scss @layer base                │
│   - .v-theme--light/dark body { background: var(--theme-bg) } │
│   - body 在 .v-application 外层, 选择器不能漏                    │
├──────────────────────────────────────────────────────────────┤
│ Layer 1: <html class="v-theme--light|dark"> via useTheme      │
│   - useTheme.syncRootClass() 把主题类同步到 <html>             │
│   - Vuetify 默认只挂 .v-application; body 拿不到类 → token 失效 │
└──────────────────────────────────────────────────────────────┘
```

**消失顺序**：从下往上。**先确认 Layer 1 主题类在 `<html>` 上**，再确认 Layer 2 `--theme-background` 解析到正确值，再确认 Layer 3 `.grid-bg` 的 `background-image` 不是 `none`，再确认 Layer 4 `.v-application` 是 transparent 且 z-index 1，再确认 Layer 5 没新加全屏 overlay 盖住一切。

---

## 3. 实施清单（按文件）

### 3.1 `apps/web/src/app.vue` — 网格层 DOM 与样式

```vue
<template>
  <!-- 注释: AGENTS.md §5 #18: tokenized real DOM grid layer must sit behind Vuetify. -->
  <div class="grid-bg" aria-hidden="true"></div>
  <v-app>
    <AppBar @open-search="openSearch" />
    <v-main>
      <RouterView ... />
    </v-main>
  </v-app>
  ...
</template>

<style>     <!-- ⚠️ 不加 scoped, 见 §5 坑 #4 -->
@layer utilities {
  .grid-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    /* 琥珀色半透明背景作为网格基底（不依赖 background-repeat） */
    background-color: color-mix(in srgb, var(--theme-grid) 18%, transparent) !important;
    background-image:
      repeating-linear-gradient(
        to right,
        var(--theme-grid) 0px,
        var(--theme-grid) 1px,
        transparent 1px,
        transparent 28px
      ),
      repeating-linear-gradient(
        to bottom,
        var(--theme-grid) 0px,
        var(--theme-grid) 1px,
        transparent 1px,
        transparent 28px
      ) !important;
    background-size: 28px 28px !important;
    background-repeat: repeat !important;
  }
}

@layer base {
  .v-application {
    position: relative;
    z-index: 1;
    background: transparent !important;
  }
}
</style>
```

**关键点**：
- `<div class="grid-bg">` 必须在 `<v-app>` 之前（template 顺序即 DOM 顺序）。
- `<style>` 不加 `scoped`（见 §5 坑 #4）。
- 所有 `!important` 是必须的，因为 UnoCSS reset 也会用 `!important`。
- `@layer utilities` 让它赢过 reset / vuetify / base / components（与 base.css 顶层 `@layer reset, vuetify, base, components, utilities;` 对齐）。

### 3.2 `apps/web/src/styles/tokens.ts` — TS 侧调色板

```ts
export interface Palette {
  // ... 其它字段
  grid: string  // 背景网格线色（obsidian 密集方格）
}

export const palettes: Record<ThemeName, Palette> = {
  light: {
    // ... 其它字段
    // 琥珀金 12% 透明（亮色下不要太刺眼）
    grid: 'rgba(196, 136, 58, 0.12)',
  },
  dark: {
    // ... 其它字段
    // 琥珀金 20% 透明（暗色下需要更显眼）
    grid: 'rgba(232, 168, 62, 0.20)',
  }
}
```

### 3.3 `apps/web/src/styles/tokens.scss` — SCSS 侧 CSS 变量

```scss
// ⚠️ 不能挂在 :root —— Vuetify 主题类只在 .v-application 上,
//    :root.{theme} 不会被命中。要挂在 .v-theme--light / .v-theme--dark 下。
.v-theme--light {
  // ... 其它 token
  --theme-grid: rgba(196, 136, 58, 0.12);
}

.v-theme--dark {
  // ... 其它 token
  --theme-grid: rgba(232, 168, 62, 0.20);
}
```

**双胞胎规则**：`tokens.ts` 的 `palettes.light.grid` / `palettes.dark.grid` 必须和 `tokens.scss` 的 `.v-theme--light { --theme-grid: ... }` / `.v-theme--dark { --theme-grid: ... }` 同步。改色必改两边（AGENTS.md §5 注释）。

### 3.4 `apps/web/src/composables/useTheme.ts` — 主题类同步

```ts
function syncRootClass(name: ThemeName): void {
  if (typeof document === 'undefined') return  // SSR 跳过
  const html = document.documentElement
  html.classList.toggle('v-theme--light', name === 'light')
  html.classList.toggle('v-theme--dark', name === 'dark')
}
```

**必须在三个时机都调**：
1. `init`：客户端首次 setup 同步读 localStorage 后立刻调。
2. `set(name)`：手动切换时调。
3. `watch(() => vuetifyTheme.global.name.value)`：任何来源的主题变化都同步。

**漏掉 `syncRootClass` 的症状**：body 的 `background-color: var(--theme-background)` 不变 / `--theme-grid` 不解析 / 网格透明 / 主题切换时背景色不跟。

### 3.5 `apps/web/src/styles/base.css` — body 上色 + 全局防御

```css
@layer reset, vuetify, base, components, utilities;

@import '@unocss/reset/tailwind.css' layer(reset);
@import 'vuetify/styles' layer(vuetify);

@layer base {
  /* body 在 .v-application 外, 必须单独跟 .v-theme--* 选择器 */
  .v-theme--light body {
    background-color: var(--theme-background);
    color: var(--theme-on-background);
  }
  .v-theme--dark body {
    background-color: var(--theme-background);
    color: var(--theme-on-background);
  }

  /* 防止任何路由撑爆 viewport */
  html, body { overflow-x: clip; }
}
```

**坑**：UnoCSS reset 会重置 `background-repeat: no-repeat`，所以 `.grid-bg` 必须显式 `background-repeat: repeat !important;`（见 §5 坑 #6）。

### 3.6 `apps/web/src/styles/vuetify-settings.scss` — 关 Vuetify reset

```scss
@use 'vuetify/settings' with (
  $reset: false
);
```

**为什么**：Vuetify 默认 reset 和 UnoCSS reset 撞车；统一交给 UnoCSS，Vuetify 只用组件样式。否则 Vuetify reset 会把 grid 相关 box-sizing / margin 等都重置。

### 3.7 `apps/web/app.config.ts` — Vuetify 主题颜色

```ts
import { palettes } from './src/styles/tokens'

export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: palettes.light.background,
    surface:    palettes.light.surface,
    // ... 其它字段都从 palettes.light 取
  }
}
export const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: palettes.dark.background,
    surface:    palettes.dark.surface,
    // ... 其它字段都从 palettes.dark 取
  }
}
```

**关键**：颜色值只来自 `tokens.ts`，不在 `app.config.ts` 里硬编码第二份。改色 → 改 tokens.ts 一处。

---

## 4. 当前代码锚点（去哪里读 / 核对）

| 锚点 | 文件 | 行号（截至 2026-08-22） |
| --- | --- | --- |
| `<div class="grid-bg">` DOM | `apps/web/src/app.vue` | 第 64–65 行 |
| `.grid-bg` 样式 | `apps/web/src/app.vue` | 第 81–110 行 |
| `.v-application` transparent | `apps/web/src/app.vue` | 第 112–118 行 |
| `--theme-grid` light | `apps/web/src/styles/tokens.scss` | 第 108 行 |
| `--theme-grid` dark | `apps/web/src/styles/tokens.scss` | 第 133 行 |
| `palettes.grid` light/dark | `apps/web/src/styles/tokens.ts` | 第 63、91 行 |
| `syncRootClass` 实现 | `apps/web/src/composables/useTheme.ts` | 第 20–25 行 |
| body 主题选择器 | `apps/web/src/styles/base.css` | 第 28–35 行 |
| Layer 顺序声明 | `apps/web/src/styles/base.css` | 第 2 行 |
| UnoCSS reset import | `apps/web/src/styles/base.css` | 第 4 行 |
| Vuetify reset 关 | `apps/web/src/styles/vuetify-settings.scss` | 全文 |

> 行号会随代码漂移；如果对不上，用 `grep -n 'grid-bg' apps/web/src/app.vue` 重新定位。

---

## 5. 所有坑（按出现频率排序）

### 坑 #1 — 透明度太低肉眼看不见（最常见）

**症状**：DOM 在 + computed `background-image: linear-gradient(...)` + 视觉**完全看不到网格**。

**根因**：网格描边透明度太低。
- dark 主题下 `rgb(255 255 255 / 0.05)` 在 `#0d1014` 背景上对比度仅 ~2%，肉眼几乎不可见。
- light 主题下 `rgb(0 0 0 / 0.04)` 在 `#f6f7f9` 上同样几乎不可见。

**修法**：用主色 + 经验值：
- dark：`rgba(122, 162, 255, 0.18)`（主色蓝调）或 `rgba(232, 168, 62, 0.20)`（琥珀金）
- light：`rgba(59, 110, 245, 0.10)`（主色蓝调）或 `rgba(196, 136, 58, 0.12)`（琥珀金）

### 坑 #2 — surface 覆盖错觉（极隐蔽）

**症状**：body 区域能看到网格，但 AppBar / 卡片（`--theme-surface`）区域**网格线和背景色一样**，整体"均匀深色"。

**根因**：用纯白 / 纯黑做 grid color；和 `--theme-surface`（AppBar / 卡片底色）对比度太低，被表面色吃掉。

**修法**：用**主色蓝 / 琥珀金**（与 body bg 有色调差），不要用纯白 / 纯黑。

### 坑 #3 — DOM 在但 `background-image: none`

**症状**：DevTools Elements 找得到 `.grid-bg` 元素 + computed `background-image: none`。

**根因**：`var(--theme-grid)` 没解析——token 没生效。

**子根因 A**：CSS 变量没注入 `.v-theme--*` 选择器下（错挂在 `:root`）。
**子根因 B**：`useTheme.syncRootClass()` 没调 / 没在 init 时调，`<html>` 没主题类，body 选择器全失效。

**修法**：
1. 打开 DevTools Elements，看 `<html>` 上有没有 `v-theme--light` 或 `v-theme--dark` 类。
2. 如果没 → `useTheme.ts` 的 `syncRootClass` 漏调。
3. 如果有 → 检查 `tokens.scss` 的选择器（必须 `.v-theme--light` / `.v-theme--dark` 而不是 `:root`）。
4. DevTools Console 跑 `getComputedStyle(document.documentElement).getPropertyValue('--theme-grid')` 看返回值是不是空串。

### 坑 #4 — `<style scoped>` 漏命中第一个子节点

**症状**：DOM 在 + computed `background-image: none` + DevTools 看 `.grid-bg` 元素的 `class` 列表里**没有** `[data-v-xxx]` 属性。

**根因**：Vue 3 SFC `<template>` 顶层用 `<Fragment>` + 静态 `_cache` 优化创建的第一个子元素，**Vue 不会给它加 `data-v-xxx` scopeId**。编译后 CSS 选择器变成 `.grid-bg[data-v-37ddea6c]`，运行时该 div 没有 hash 属性 → scoped 选择器不命中 → CSS 完全不生效。

**修法**：把 `.grid-bg` 样式从 `<style scoped>` 移到 `<style>`（不带 scoped）块，或挪到 `apps/web/src/styles/base.css` 全局层。

**验证方法（不需要浏览器）**：
```powershell
# 拉编译后的 scoped CSS, 看选择器有没有带 [data-v-xxx]
Invoke-WebRequest 'http://127.0.0.1:5173/src/app.vue?vue&type=style&index=0&scoped=true&lang.css'
```
带 `[data-v-xxx]` 就说明有 scoped 选择器风险。

### 坑 #5 — `.v-application` 默认 bg 盖死网格

**症状**：DevTools 看 `.grid-bg` computed 完美，但肉眼看不到网格。

**根因**：`<v-app>` 渲染出 `.v-application` 全屏 div，默认 `background: var(--v-theme-background)`，盖在 `.grid-bg` 之上（因为 DOM 顺序：`.grid-bg` 先 `.v-application` 后）。

**修法**：在 `<style>` 块给 `.v-application` 加：
```css
@layer base {
  .v-application {
    position: relative;
    z-index: 1;
    background: transparent !important;
  }
}
```

### 坑 #6 — UnoCSS reset 把 `background-repeat` 重置成 `no-repeat`

**症状**：computed `background-image: linear-gradient(...)` 但视觉上**只能看到一格**。

**根因**：`@unocss/reset/tailwind.css` 把 `background-repeat` 重置成 `no-repeat`，只给 `bg-gradient-*` 这类工具类放回 `repeat`。

**修法**：`.grid-bg` 全局 CSS 显式 `background-repeat: repeat !important;`。

**验证**：DevTools Computed → `background-repeat: repeat`，肉眼看完整 viewport 都是网格。

### 坑 #7 — token 只在 TS 侧 / 只在 SCSS 侧

**症状**：开发 server 看着对，build 产物渲染时颜色不对（或反过来）。

**根因**：`tokens.ts`（给 Vuetify 主题 / 单元测试用）和 `tokens.scss`（给 CSS 变量用）是双胞胎，只改了一边。

**修法**：改色**必改两边**——`palettes.light.grid` / `palettes.dark.grid` + `.v-theme--light { --theme-grid }` / `.v-theme--dark { --theme-grid }` 必须同步。

### 坑 #8 — 用 `body::before` / `html::before` 而不是真实 DOM

**症状**：computed 显示 `background-image` 解析正确，但肉眼看不到。

**根因**：Vuetify 3 的 `.v-application` 是 `position: relative; z-index: 0;` 起步，会建 stacking context；`body::before` / `html::before` 的 `z-index` 被 `.v-application` 的全屏 overlay 盖住。

**修法**：用真实 DOM 元素 `<div class="grid-bg">` 作为 `<v-app>` 的兄弟节点 + `position: fixed; z-index: 0;`。

### 坑 #9 — `<div class="grid-bg">` 位置错（在 `<v-app>` 内部）

**症状**：和坑 #8 类似，但根因是 DOM 顺序——`.grid-bg` 在 `.v-application` 内部时，没有自己的 stacking context，被父级遮挡。

**修法**：放在 `<v-app>` 之前（template 顺序即 DOM 顺序），不是作为 `<v-app>` 的子节点。

### 坑 #10 — `pointer-events: none` 漏写 → 拦截交互

**症状**：网格可见但点不到页面元素。

**修法**：`.grid-bg { pointer-events: none; }`。

### 坑 #11 — `:root` 挂 token（错位选择器）

**症状**：在 `<html>` 上能看到主题类生效（DevTools Elements 检查 `<html>`），但 body / `.grid-bg` 拿不到 `--theme-*`。

**根因**：Vuetify 3 把 `.v-theme--light` / `.v-theme--dark` 挂在 `.v-application` 上，**不**挂在 `<html>` 或 `<body>` 上。`:root.v-theme--dark` 选择器不命中任何元素。

**修法**：把颜色 token 挂 `.v-theme--light { --theme-grid: ... }` / `.v-theme--dark { --theme-grid: ... }`（不带 `:root`），与 Vuetify 类层级对齐。

---

## 6. 诊断清单（看不到网格时按顺序走）

```
□ 1. DevTools Elements: 找 .grid-bg div, 它存在吗?
     不存在 → app.vue template 漏写 <div class="grid-bg">, 加回去
     存在 → 继续

□ 2. DevTools Elements: .grid-bg div 的 class 列表里有没有 data-v-xxx?
     有 → §5 坑 #4, 移到 <style> 不带 scoped
     没有 → 继续

□ 3. DevTools Computed (选中 .grid-bg): background-image 是 none 还是 linear-gradient(...)?
     none → §5 坑 #3 (CSS 变量没解析)
       ├─ Console: getComputedStyle(document.documentElement).getPropertyValue('--theme-grid') 看是否空串
       ├─ 空串 → useTheme.syncRootClass() 漏调 或 tokens.scss 选择器错挂在 :root
       └─ 有值 → §5 坑 #4 重查 (但这种情况少见, 因为 class list 已经查过)
     linear-gradient(...) → 继续

□ 4. DevTools Computed: background-repeat 是 repeat 还是 no-repeat?
     no-repeat → §5 坑 #6, 加 background-repeat: repeat !important
     repeat → 继续

□ 5. DevTools Computed: background-color 解析对吗?
     rgba(0,0,0,0) (透明) → §5 坑 #1 透明度太低 → 拉高到 0.18 (dark) / 0.10 (light)
     有值 → 继续

□ 6. DevTools Elements: <html> 上有 v-theme--light 或 v-theme--dark 类吗?
     没有 → useTheme.syncRootClass() 漏调
     有 → 继续

□ 7. DevTools Elements: <body> 上有 v-theme-* 类吗? (通常没有, 这是正常的)
     有 → Vuetify 配置错
     没有 → 继续

□ 8. DevTools Computed (选中 .grid-bg): z-index 是多少?
     0 → 继续
     auto / 其它 → 检查是否有 z-index 冲突

□ 9. DevTools Elements (Elements 面板选中 .v-application):
     Computed → background-color 是 transparent 吗?
     background: var(--v-theme-background) → §5 坑 #5, 给 .v-application 加 transparent
     transparent → 继续

□ 10. 肉眼检查 body bg 区域 vs AppBar / 卡片区域:
      body bg 区域能看到网格, AppBar / 卡片区域看不到 → §5 坑 #2 surface 覆盖, 换主色调
      两个区域都看不到 → 回到 □1 复检
      两个区域都能看到 → 网格工作正常
```

**不要做的诊断**：
- **不要用 Playwright 跑 DSH 沙箱**（AGENTS.md §5 #17）：Playwright 走 piped stdio spawn 子进程，沙箱拒。
- **不要靠"截图看着像有"判断**：网格对比度 ~2% 时截图 / 肉眼 / 计算样式可能都不一致。
- **不要先动 DOM 位置**：90% 的"看不到"是透明度 / 选择器问题，不是 stacking。

---

## 7. 验证手段（不需要浏览器）

以下三步可在 DSH / terminal 跑，不需要起 playwright / chrome：

### 7.1 拉编译后的 CSS 看选择器

```powershell
# scoped CSS 有没有带 [data-v-xxx]
Invoke-WebRequest 'http://127.0.0.1:5173/src/app.vue?vue&type=style&index=0&scoped=true&lang.css'

# 非 scoped CSS（应包含 .grid-bg 规则）
Invoke-WebRequest 'http://127.0.0.1:5173/src/app.vue?vue&type=style&index=0&scoped=false&lang.css'
```

### 7.2 拉 tokens.scss 编译后 CSS 看 `--theme-grid` 是否注入

```powershell
# 浏览器 / curl 拿首页 index.html, 找 style 块里的 --theme-grid
Invoke-WebRequest 'http://127.0.0.1:5173/' | Select-String -Pattern 'theme-grid'
```

### 7.3 拿 isolated HTML 验 CSS 写法

写一个最小 HTML（参考仓库根目录的 `grid-test.html`），复制 `.grid-bg` 的 CSS + 同样 token 颜色：
```html
<!DOCTYPE html>
<html class="v-theme--dark">
<head>
  <style>
    body { background: #090b0e; margin: 0; min-height: 100vh; }
    .grid-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image:
        linear-gradient(to right, rgba(232,168,62,0.20) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(232,168,62,0.20) 1px, transparent 1px);
      background-size: 28px 28px; background-repeat: repeat;
    }
    .content { position: relative; z-index: 1; color: #d4d8e0; padding: 2rem; }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="content"><h1>Grid Test</h1></div>
</body>
</html>
```

双击打开 → 能看到网格 → CSS 写法本身没问题，问题在 token 注入链路。

---

## 8. 验收清单（修完后跑）

### 8.1 静态检查

- [ ] `apps/web/src/app.vue` 第 64–65 行有 `<div class="grid-bg" aria-hidden="true"></div>`
- [ ] `apps/web/src/app.vue` 第 81–110 行 `.grid-bg` 在 `@layer utilities` 内
- [ ] `apps/web/src/app.vue` 第 112–118 行 `.v-application` 在 `@layer base` 内 + transparent + z-index 1
- [ ] `apps/web/src/app.vue` 第 81 行 `<style>` 不带 `scoped`
- [ ] `apps/web/src/styles/tokens.ts` `palettes.light.grid` 和 `palettes.dark.grid` 都非空字符串
- [ ] `apps/web/src/styles/tokens.scss` `.v-theme--light { --theme-grid: ... }` 和 `.v-theme--dark { --theme-grid: ... }` 都存在
- [ ] `apps/web/src/composables/useTheme.ts` `syncRootClass` 在 init / set / watch 三个时机都调
- [ ] `apps/web/src/styles/base.css` 顶层 `@layer reset, vuetify, base, components, utilities;` 完整
- [ ] `apps/web/src/styles/base.css` `.v-theme--light body` / `.v-theme--dark body` 都设了 background-color
- [ ] `apps/web/src/styles/vuetify-settings.scss` `$reset: false`

### 8.2 动态检查（dev server + 浏览器）

- [ ] 暗主题首页：能看到 28×28 网格，覆盖整个 viewport
- [ ] 亮主题首页：网格同样可见但更柔和
- [ ] 切换主题：网格颜色 / 透明度实时跟随
- [ ] AppBar / 卡片区域：网格线**仍然可见**（不被 surface 吃掉）
- [ ] DevTools Elements `<html>` 上有 `v-theme--dark` 或 `v-theme--light`
- [ ] DevTools Computed `.grid-bg` `background-image` 解析为双层 linear-gradient
- [ ] DevTools Computed `.grid-bg` `background-repeat: repeat`
- [ ] DevTools Computed `.grid-bg` `background-color` 非完全透明
- [ ] DevTools Computed `.v-application` `background-color: transparent`
- [ ] 鼠标 hover / click 不被 `.grid-bg` 拦截

### 8.3 构建检查

- [ ] `pnpm typecheck` exit 0
- [ ] `pnpm build` exit 0
- [ ] `pnpm preview` 能起，预览页网格可见

### 8.4 浏览器矩阵（最终）

- 6 路由 × {375 dark, 768 light, 1280 dark} = 18 张截图
- 全部 200, 无 overflow, 无 page error, 无 request error
- 暗色 / 亮色网格都肉眼可见

---

## 9. 常见错误（"修好了但又看不见"的反模式）

| 反模式 | 为什么错 | 正确做法 |
| --- | --- | --- |
| 把 `.grid-bg` 写在 `<style scoped>` | Vue Fragment 静态缓存漏 hash → scoped 选择器不命中 | 写 `<style>`（不带 scoped） |
| 把 `--theme-grid` 挂 `:root` | Vuetify 主题类在 `.v-application` 上，不在 `<html>` | 挂 `.v-theme--light` / `.v-theme--dark` |
| 把 `<div class="grid-bg">` 放 `<v-app>` 里 | 没自己 stacking context，被父级盖住 | 放 `<v-app>` 之前（兄弟节点） |
| 用 `body::before` / `html::before` | Vuetify 多层全屏 overlay 盖住伪元素 | 用真实 DOM `<div>` |
| 用纯白 / 纯黑做 grid color | 和 `--theme-surface` 撞色，被卡片/AppBar 底色吃掉 | 用主色蓝 / 琥珀金 |
| grid 透明度 0.05 | 在 dark bg 上对比度仅 ~2%，肉眼不可见 | 提到 0.18 (dark) / 0.10 (light) |
| 不写 `background-repeat: repeat` | UnoCSS reset 重置成 no-repeat，只看到一格 | 显式 `background-repeat: repeat !important` |
| `tokens.ts` 改了 `tokens.scss` 没改 | CSS 变量还停在旧值 | 双胞胎必须同步改 |
| `syncRootClass` 只在 set 时调 | 初始化阶段 `<html>` 没类，body / token 全失效 | init / set / watch 三时机都调 |
| 给 `.v-application` 加 `background: var(--theme-background)` | 盖死网格 | 给 `.v-application` 加 `background: transparent !important` |
| 在网格颜色上加 `transition` / `animation` | 主题切换时网格会"渐变"，慢且干扰 | 主题切换直接换 token 值（瞬时） |

---

## 10. 跑完本流程后的检查项

1. **修完后不要改 AGENTS.md §5 #18**——那一条已经写好了所有坑，不要覆盖。
2. **如果发现新坑**：在 AGENTS.md §5 #18 末尾追加，不要写在聊天记录里。
3. **如果动了 `.grid-bg` 透明度 / 颜色**：同步更新 `tokens.ts` + `tokens.scss` + AGENTS.md §5 #18 经验值。
4. **如果发现本方法论漏了某条坑**：在 AGENTS.md §5 #18 末尾追加，并回头补到本文件 §5 / §9 对应条目。
5. **不要把网格拆成独立组件**：它属于 `app.vue` 的布局层，拆出去会破坏 `<v-app>` 兄弟节点的 DOM 顺序约束。

---

## 11. 一句话总结

> 网格背景 = **真实 DOM 兄弟节点** + **`.v-application` 让位 transparent** + **token 双胞胎同步** + **主题类同步到 `<html>`** + **`!important` 赢 UnoCSS reset** + **主色调而非纯白纯黑**。

修不好就按 §6 诊断清单逐条走；§9 列了所有"看似能跑其实不能跑"的反模式；§7 给不需要浏览器的验证手段；§8 给最终验收条件。

---

*文档生成于 2026-08-22，源于单元 2 / 单元 3 反复沉淀的真实坑。当前基线（apps/web/src/app.vue 第 64–118 行）已通过浏览器矩阵 18 张截图复核，符合本文档全部验收条件。*
