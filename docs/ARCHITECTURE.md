# ARCHITECTURE.md — 项目架构与决策记录

> 人类维护；AI 可以起草条目，由人类审过后合入。
> 触发：本文件作为「跨单元沉淀」——AGENTS.md §1 的单元表格是硬跑通条件，
> 用户的「非破坏性偏好 / 视觉倾向」不写进 AGENTS.md（避免污染 §1 表格），
> 而写进本文档。

---

## 1. 单元进度

| 单元 | 状态 | 跑通日期 |
| --- | --- | --- |
| 1 项目骨架 | ✅ 跑通 | 单元 1 收尾 |
| 2 主题与设计 token | ✅ 跑通 | 单元 2 收尾 |
| 3 内容接入 | ✅ 跑通 | 2026-08-22 |
| 4 页面组件 | ⏳ | — |
| 5 UI 基件库 | ✅ 跑通 | 2026-08-25 |
| 6 评论 & 点赞 stub | ⏳ | — |
| 7 路由 / 主题 / 搜索 / SEO | ⏳ | — |
| 8 部署与发布流 | ⏳ | — |
| 9 AGENTS.md / 项目专属约定 | 进行中 | — |

---

## 2. 视觉 / 内容偏好（人类备注，不在 AGENTS.md 硬表格里）

### 单元 3 基线（已落地 / 已验证）

- **posts 详情页**：markdown 渲染走全局 `.markdown-body` 样式（来自单元 2 收尾的 markdown-loader 重写）。**h1–h6 字阶 + `<pre><code>` 彩虹玻璃材质都已经落地**——字号 / 行高由 `--theme-font-size-*` 等 token 控制，颜色消费现有主题色 token；`<pre>` 区块背景走彩虹玻璃倾向（详见组件 CSS）。
- **Gallery 索引卡片非交互**：当前没有 gallery 详情页，`GalleryGrid` 的预览 `<figure>` 不挂 `<a>`（详见 §3 单元 3 决策 #5）。
- **Project 索引卡片非交互（repo 外链例外）**：当前没有 project 详情页，`<v-card>` 不设 `:to`、不用 `link` prop；但卡片内**保留** `links.repo` 锚点——这是真外链，跳到 GitHub 等，不受"非交互"约束。
- **Friend 索引卡片是真外链**：每个 `FriendCard` 是 outbound，渲染 `<a href>` 指向朋友站点，**不**走"非交互"模式——友链本质就是对外跳转。
- **Gallery 索引预览 fallback**：当前**没有** gallery 详情页，只有 `GalleryGrid` 索引预览走 fallback——原生 `<img>` `onerror` 切换到内联 SVG 占位 slot，**不**渲染 broken image icon、**不**抛 console error（详见 §3 单元 3 决策 #6）。

### 单元 3 仍待人类给出（不是 implementation pending，是美学方向）

以下条目 baseline 已经可见；这些是"未来美学方向"——只有人类给出新方向时再改，**不**是"还没实现"。

- **h1–h6 字阶 + `<pre><code>` 材质**：当前 token 已是项目自定义（彩虹玻璃倾向），但更细的字距 / 行高 / 字体、`<pre>` 彩虹取向（背景 vs 语法高亮）、材质（玻璃 / 霓虹 / 拟物）等美学微调等人类给方向。
- **Gallery 详情页（如要启用）**：当前**没有** gallery 详情路由；只有索引预览 fallback。若人类要加 `/gallery/<slug>` 详情页，要人类先给方向。

> 等人类给出后按指令改；baseline 不阻塞验证。

---

## 3. 决策记录

### 单元 2：tokens 层单一来源
- TS 侧（`src/styles/tokens.ts`）和 SCSS 侧（`src/styles/tokens.scss`）是「双胞胎」——颜色值必须同时改两边。
- 颜色 token 选择器**不能挂在 `:root`**——Vuetify 3 把主题类挂到 `.v-application` 上，body 在外层，要在 `.v-theme--light` / `.v-theme--dark` 选择器下设值，并在 base.css 显式用 `.v-theme--light body` / `.v-theme--dark body` 给 body 上色。
- 「与主题无关」的 token（间距 / 字号 / 圆角 / 阴影 / 字体栈）放 `:root`。

### 单元 2 副作用：markdown-loader 重写
- 单元 1 收尾的 `markdown-loader.ts` 在「文章页打开」时报 `Failed to parse source for import analysis` —— 因为它返回的 SFC 字符串模块 id 仍是 `.md`，vite-plugin-vue 的 filter 不匹配，import-analysis 当 JS 解析报错。
- 修法：用 `@vue/compiler-sfc` 的 `compileScript({ inlineTemplate: true })` + `parse` 自编译 SFC 为 JS，不再返回 SFC 字符串。
- 副作用：`<style scoped>` 块改写为全局 `.markdown-body` 样式放 base.css（避免虚拟 CSS 模块复杂度）。
- 新增 dep：`@vue/compiler-sfc` 到 devDependencies。

### 单元 2：主题类同步
- `useTheme` 必须在 set / watch / init 三个时机都调 `syncRootClass()`，把 `.v-theme--light` / `.v-theme--dark` 同时挂到 `<html>` 上——否则 body 拿不到 `:root.v-theme--*` 选择器里的颜色变量（实际上没用这个选择器，但说明 body 需要类）。

### 单元 3：构建期内容索引
- 四类内容（posts / gallery / projects / friends）都走 **eager `import.meta.glob`**，在构建期一次性拿到数据，**不**走运行时 fetch。posts 使用 `{ eager: true, query: '?frontmatter', import: 'default' }`；gallery / projects / friends 的 JSON 使用直接 eager glob。
- **没有独立的第二条 posts glob**。posts 模块的 default export 同时包含 frontmatter + 自写 markdown-loader 编译后的 HTML——渲染页直接消费这个 default export，不再二次 glob `.md` 主体。
- 理由：SSG 在 Node 端 prerender，运行时 fetch 会跨进程边界、把"内容接入"变成"前端 + 后端契约"，违反 §9.4 渲染策略。

### 单元 3：路由生成（ViteSSG `includedRoutes`）
- ViteSSG 的 `includedRoutes` 由两部分拼出，**不**写死任何具体路径：
  1. **静态非动态路径**——首页 / posts 列表 / gallery / projects / friends 索引（`/`、`/posts`、`/gallery`、`/projects`、`/friends`）全部保留；
  2. **从 posts 索引派生**——`posts.map(s => postRoute(s))` 给每个 slug 拼出 `/posts/<slug>`，追加到末尾。
- 实际形态（伪代码）：`includedRoutes = [...staticNonDynamic, ...posts.map(postRoute)]`，其中 `postRoute(slug) => '/posts/' + slug`。
- 新增 / 删除 `.md` 后重跑 `pnpm build` 自动增删 `dist/posts/<slug>/index.html`——**不**需要手动改路由表。

### 单元 3：单一 `vite-ssg build`（**严禁后跟 `vite build`**）
- `pnpm build` 走 `vite-ssg build`，**只一次**：ViteSSG 先跑 vite build 打 client bundle，再启 SSR engine 把六条路由 prerender 成 `dist/posts/hello-world/index.html` 嵌套 HTML。
- **如果跑完 `vite-ssg build` 再跑 `vite build`，第二次 plain vite build 会把 `dist/` 里 prerender 的嵌套 HTML 当成未引用的 asset 清掉 / 覆盖**——`dist/posts/hello-world/index.html` 会消失，静态托管 404。
- README / 包脚本只暴露 `vite-ssg build`，**不**再声明"先 vite-ssg 再 vite build"。这点和单元 1 README 旧表述冲突，本会话已修。

### 单元 3：Vuetify SSR 必须 bundled（`ssr.noExternal`）
- `vite.config.ts` 的 `ssr.noExternal: ['vuetify']`——Vuetify 3 的组件 CSS 在 SSR 阶段由 Node 解析时，**必须不让 Node external 它**（否则 `import 'vuetify/components/X/X.css'` 在 Node 里无法解析 → SSR 渲染时组件裸奔 / hydration mismatch）。
- noExternal 把 vuetify 拉进 SSR bundle，组件 CSS 跟着 server 一起打包。

### 单元 3：索引卡片非交互（detail 路由不存在时）
- 当前**没有** gallery / projects 详情页——它们的索引卡片都**不"假装能点"**：
  - **GalleryGrid**：预览 `<figure>` 不挂 `<a>`；
  - **ProjectCard**：`<v-card>` 不设 `:to`、不用 `link` prop；
  - Project 卡片**保留** `links.repo` 锚点（`<a :href="links.repo">`）——这是真外链，跳到 GitHub 等，**不**受"非交互"约束。
- **FriendCard 例外**：友链本质是 outbound，每个 `FriendCard` 渲染 `<a :href="friend.url">` 真跳转——**不**走非交互模式。
- 理由：SSG 产物是静态 HTML；渲染了"看起来能点"的链接但点击 404，等于在每个静态页面埋雷。不可点击比可点击-404 强；真外链例外。

### 单元 3：Gallery 索引预览 fallback（资源缺席）
- 当前**没有** gallery 详情页，**只**有 `GalleryGrid` 索引预览有 fallback——不涉及"详情图位"。
- 实现：图位用**原生 `<img>` + `onerror`**——图片加载失败时切换到**内联 SVG 占位 slot**（项目 token 派生的色块 + 形状，**不**是 `<v-img>`、**不**渲染 caption 文本），**不**抛 console error、**不**渲染 broken image icon。
- 静态页面的可信度优先于"视觉完整"——读者看到 SVG 占位框比看到带 alt 的 broken icon 更稳。

---

## 4. 参考与索引

> 人类维护；AI 可以起草条目，由人类审过后合入。
> 本节是单元 4 起的文档入口。下方三份文档互为引用，先读 ADR 拿决策，再读 HOMEPAGE-ARCHITECTURE 拿组件规格，GLOSSARY 共享术语。

| 文档 | 角色 | 当前状态 |
| --- | --- | --- |
| `docs/ADR-amu-live-style-homepage.md` | 单元 4 主页设计语言的决策记录（AMU LIVE STYLE 品牌、肖像 hero、无缝双栏、固定磨砂导航、四通道、Bilibili CTA、热力图、`channels` 字段、`/listen` schema、测试内容策略） | Proposed（已确认方向，未实现） |
| `docs/HOMEPAGE-ARCHITECTURE.md` | 单元 4 主页 `/`、`/gallery`、`/listen` 的实现可读规格（每区块的容器、槽位、动画阶段、键盘行为、媒体加载、可达性） | 与 ADR 同步，未实现 |
| `docs/GLOSSARY.md` | 跨文档共享术语（品牌词标、通道、`channels` 字段、热力图、液态玻璃 tooltip、CD 标签行、magnifier 预览等） | 首次落地 |

### 4.1 引用约定

- ADR 是「为什么」与「决策边界」。HOMEPAGE-ARCHITECTURE 是「做什么」。GLOSSARY 是「术语」。
- 任何对单元 4 设计的更改，先改 ADR → 再同步 HOMEPAGE-ARCHITECTURE → 必要时补 GLOSSARY。顺序不可乱。
- 这三份文档**不**在 AGENTS.md 里加规则；如需升级为硬规则，由人类审过后另写进 AGENTS.md。

### 4.2 单元 4 状态

- 单元 4 在本文 §1 表格中仍记为「⏳」——三份文档只记录方向与规格，未实现代码，未跑通。
- 单元 4 跑通条件（合并进 §1 之前）至少包括：所有依赖项到位（肖像资产、`BILIBILI_PROFILE_URL` 真值、引言真稿、`/listen` 是否进单元 4 的决定、占位内容 `testOnly` 标记）、`pnpm typecheck` 与 `pnpm build` 双双 exit 0、浏览器矩阵视觉与可达性复核 PASS。

### 4.3 变更日志

| 日期 | 变更 | 原因 |
| --- | --- | --- |
| 2026-08-22 | 新增 §4「参考与索引」；落 `ADR-amu-live-style-homepage.md` / `HOMEPAGE-ARCHITECTURE.md` / `GLOSSARY.md` 三份文档 | 单元 4 设计方向已确认，需要决策记录 + 组件规格 + 共享术语的稳定文档锚点；不实现代码，单元 4 状态保持 ⏳ |
