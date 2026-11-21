# 提瓦特主题（挂在 /genshin/）

2026-11 的「原神 UI」个人视觉研究，作为经典站点的第三主题挂载在同一个域名下。
只学界面语言，不下载游戏、不搬运官方立绘/图标/Logo/字体。

## 设计决策

- **模式**：夜幕·深渊（深靛星海 + 金箔双线），文章正文单独使用一次羊皮纸阅读面。
- **元素**：风（Anemo）薄荷绿，面积 ≤15%；金与墨为中性色。
- **原型**：大世界入口（首页）+ 图鉴/背包（档案、影像列表）+ 角色档案（关于）+ 任务/对话（文章）。
- **字体**：展示衬线（系统 Noto Serif/Songti/SimSun 回退）、UI 黑体、等宽数字；不内嵌商业字体。
- **动效**：金线/星辉、滚动 reveal、视差、页面 wipe、首屏 boot、主题圆扩散。

## 结构

- **构建**：`node genshin/scripts/build.mjs`，输出 `apps/web/dist/genshin/`；`pnpm build` 已包含。
- **内容**：读取 `../zzz/content/`（与 ZZZ 主题共享个人内容，不复制文章）。
- **图片**：全部走 `/images/...`、`/img/...`，与经典站共用 `apps/web/public/`。
- **样式**：`assets/css/genshin-tokens.css` + `genshin.css`（ZZZ 布局底座 + Genshin skin）。
- **主题桥**：`assets/js/theme-bridge.js` + `assets/css/genshin-bridge.css`；和经典站/ZZZ 的三主题选择器成对维护。
- **自检**：`node ~/.dsh/skills/genshin-ui/scripts/audit.mjs dist/genshin/index.html` → PASS。

## 三主题路由

`/` ↔ `/zzz/` ↔ `/genshin/`，文章、图集、音轨、项目、友链、关于一一对应；
文章 slug 的 `about-me ↔ about`、`给洛洛的一封信 ↔ gei-luoluo-de-yi-feng-xin` 由
`src/composables/useThemeSwitch.ts` 与两个生成器共同维护。
