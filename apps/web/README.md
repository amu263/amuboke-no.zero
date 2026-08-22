# apps/web

个人博客前端单包（唯一代码目录）。

## 本单元（单元 3：内容接入）

跑通条件：四类内容（posts / gallery / projects / friends）构建期索引生成；`pnpm build` 走 ViteSSG，渲染出 6 条嵌套 HTML 路由。

```bash
cd apps/web
pnpm install
pnpm dev        # http://127.0.0.1:5173  (vite dev，HMR)
pnpm typecheck  # vue-tsc（TypeScript 5.8.3 锁定，见 AGENTS §5）
pnpm build      # vite-ssg build（**仅此一次**，禁止后跟 vite build，见 AGENTS §5）
pnpm preview    # 预览 dist/
```

## 目录速览

- `app.config.ts` — Vuetify light/dark 主题（两边都显式声明）
- `vite.config.ts` — vite-ssg + Vuetify + UnoCSS + 自写 markdown loader（`ssr.noExternal: ['vuetify']`）
- `src/styles/base.css` — CSS 层序声明（AGENTS.md §5）
- `src/plugins/markdown-loader.ts` — `.md` 双形态：`默认=Vue SFC` / `?frontmatter=纯 ESM`
- `src/pages/` — 路由级页面壳（首页 + posts 列表 + posts 详情 + gallery / projects / friends 索引）
- `src/content/posts/` — 文章（`.md`，frontmatter: title / date / tags / cover / summary）
- `src/content/gallery/` — 图集（`.json`，photos: [{ src, alt, caption, exif }]）
- `src/content/projects/` — 项目（`.json`，tech[], links{}）
- `src/content/friends/` — 友链（`.json`，name / url / avatar / bio / tags[]）

写内容的人**只**动 `src/content/` 和 `public/`（AGENTS §2 硬规则）。

## SSG 产物路由

`pnpm build` 后 `dist/` 落 6 条嵌套 HTML（ViteSSG prerender，**不是** plain vite build）：

| 路由 | 来源 |
| --- | --- |
| `/` | 首页（`src/pages/index.vue`） |
| `/posts` | 文章列表（`src/pages/posts/index.vue`） |
| `/posts/hello-world` | 示例文章详情（`src/pages/posts/[slug].vue`） |
| `/gallery` | 图集索引（`src/pages/gallery/index.vue`） |
| `/projects` | 项目索引（`src/pages/projects/index.vue`） |
| `/friends` | 友链索引（`src/pages/friends/index.vue`） |

posts 详情路由从 `import.meta.glob('?frontmatter', { eager: true })` 构建期拿 slug 列表，传给 ViteSSG 的 `includedRoutes`；新增 / 删除 `.md` 后重跑 `pnpm build` 自动增删 `dist/posts/<slug>/index.html`。

## Gallery 占位 fallback

当前**没有** gallery 详情页，**只**有 `GalleryGrid` 索引预览走 fallback——图位用**原生 `<img>` 的 `onerror`** 兜底：图片加载失败时切换到**内联 SVG 占位 slot**（项目 token 派生的色块 + 形状），**不**渲染 broken image icon、**不**抛 console error。**不**涉及 `<v-img>`、**不**渲染 caption 文本、**不**存在"详情图位 fallback"。

## 后续单元

详见 `../../AGENTS.md` §1。
