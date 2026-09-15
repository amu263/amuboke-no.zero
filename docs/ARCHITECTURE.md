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
- **Gallery 索引卡片非交互**：当前没有 gallery 详情页，卡片本身不挂 `<a>`（载体：`TerminalCard` + 页面内联 `.gallery-item__*`；原 `GalleryGrid` 组件已于 2026-09-15 随死代码清理删除，契约不变，详见 §3 单元 3 决策 #5）。
- **Project 索引卡片非交互（repo 外链例外）**：当前没有 project 详情页，卡片不设 `:to`、不用 `link` prop（载体：`TerminalCard`；原 `ProjectCard` 已删除）；但卡片内**保留** `links.repo` 锚点——这是真外链，跳到 GitHub 等，不受"非交互"约束。
- **Friend 索引卡片是真外链**：每个友链卡片是 outbound，渲染 `<a href>` 指向朋友站点，**不**走"非交互"模式——友链本质就是对外跳转（载体：`TerminalCard` + `AvatarWithFallback`；原 `FriendCard` 已删除）。
- **Gallery 索引预览 fallback**：当前**没有** gallery 详情页，只有图集索引预览走 fallback——`<img>` **缺 `src`** 时用 `v-else` 渲染内联 SVG 占位块（`.gallery-item__photo-placeholder`），**不**渲染 broken image icon、**不**抛 console error（详见 §3 单元 3 决策 #6）。
  - **两条触发路径（2026-09-15 已补齐）**：`src` 缺失走 `v-if`，加载失败（404）走 `@error` → 登记进 `failedPhotos` 集合 → 切**同一个**占位块。单元 5 重写索引页时只留了「缺 `src`」一条，会露破图；本次在**索引页 + 详情页图条 + lightbox** 三处补齐 `@error` 守卫，并新增 `.gallery-cell__fallback` / `.lightbox__fallback` 两个 token 化占位块。实测（CDP 挡掉 `/images/gallery/*`）：索引页 12 个图位中 8 个走占位、`brokenStillRendered = 0`；详情页 8 个图位全部走占位、`brokenStillRendered = 0`；无未捕获异常。

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
- **载体修订（2026-09-15）**：本节提到的 `GalleryGrid` / `ProjectCard` / `FriendCard` 三个组件已作为死代码删除，**决策本身不变**，行为契约由 `@/components/ui` 基件（`TerminalCard` / `AvatarWithFallback` 等）与页面内联结构继承。

### 单元 3：Gallery 索引预览 fallback（资源缺席）
- 当前**没有** gallery 详情页，**只**有 `GalleryGrid` 索引预览有 fallback——不涉及"详情图位"。
- 实现：图位用**原生 `<img>` + `onerror`**——图片加载失败时切换到**内联 SVG 占位 slot**（项目 token 派生的色块 + 形状，**不**是 `<v-img>`、**不**渲染 caption 文本），**不**抛 console error、**不**渲染 broken image icon。
- 静态页面的可信度优先于"视觉完整"——读者看到 SVG 占位框比看到带 alt 的 broken icon 更稳。
- **载体修订 + 实现补齐（2026-09-15）**：`GalleryGrid` 已删除，现行实现见 §2 最后一条——fallback 的触发条件由单一 `onerror` 变成「缺 `src` **或** `@error`」两条，两条都切同一个占位块。本决策的**意图**（任何加载失败都不露破图）已完整实现（索引页 + 详情页图条 + lightbox 三处守卫）。

### 单元 7：UI 组件实验室页改为 dev-only

- `/demo`（`apps/web/src/pages/demo.vue`，单元 5 的组件预览页）**只在开发环境注册**：`router.ts` 里改成 `...(import.meta.env.DEV ? [demoRoute] : [])` 条件展开，`vite.config.ts` 的 `PAGE_SEO` 同步删掉 `/demo` 条目。
- 实测结果：生产构建不再产出 `dist/demo/index.html`；路由名 `"demo"` 与 demo.vue 的独有字符串都不在 bundle 里（整块被静态摇掉）；预渲染页 15 → 14；线上访问 `/demo` 落到 catch-all 重定向回首页。
- 附带收益：build 日志里那 9 条 `vue-router` 的 `TypeError: Cannot read properties of undefined (reading 'path')` **降到 0**——它们正是 SSG 阶段解析 `/demo` 这条路由时抛出来的（此前一直被当成「既有噪音」，其实是这条路由引起的）。
- 理由：组件实验室是开发工具，不是给读者的页面；留在线上等于给静态站挂一个没有内容承诺的空路由。

### 单元 7（子项）：全局启动 Splash

- 范围：本会话只实现「网站首次进入时的全局启动 Splash」。单元 7 的其余部分（路由 / 搜索 / SEO）未动，§1 表格里单元 7 仍记 ⏳。
- 归属：帘幕 DOM 与关键 CSS 都在 `apps/web/index.html`（静态节点 `#app-loading`，**在 `<div id="app">` 之外**）——Vue 从不 hydrate 它，所以结构上不可能产生 hydration mismatch；退出时序由 `apps/web/src/composables/useBootSplash.ts` 接管，`app.vue` 只调用它。
- 播放策略：**每个 tab 会话播放一次**（`sessionStorage['amuboke-no.zero:boot-splash']`，key 常量在 `src/styles/tokens.ts` 的 `BOOT_SPLASH_STORAGE_KEY`，index.html 引导脚本里以字面量同步一份）。因此：新开标签 / 关掉重进 → 播放；**刷新 → 跳过**；SPA 路由切换 → 永不重播。跳过判定发生在首绘之前（`<html>` 加 `boot-splash-off`），所以刷新是零闪烁而不是「先闪一下再撤」。
- 时间轴（2026-09-15 人类要求「加长动画时间」后定为 3.8s + 0.6s）：`router.isReady()` 与 2.5s 超时赛跑 → 补足「从 navigation start 起算的 3800ms」→ 加 `boot-splash--leaving`（只做 opacity 淡出 600ms）→ 移除节点并解锁滚动。基准是 `performance.now()`，所以 bundle 慢时不会人为多等。序列本身由 5 条 boot log（500/1250/2000/2700/3300ms 错落）与一条 3800ms 走满的进度条铺开。另有 inline watchdog（6s）与 `<noscript>` 规则兜底，保证 JS 失败时帘幕不会永久卡住。
- 视觉：复用博客既有的 HUD 语言（28px token 网格 + 等宽字 + 琥珀 / 青绿强调色），**不使用任何 Steam 图形、商标或第三方启动动画库**。中央核心是 `素材/阿木头像新.png` 派生的 `apps/web/public/img/amu-avatar.webp`（512×512，75KB；原图 1254²/2.1MB 只作源）；图片失败时空 alt 的 `<img>` 不画 broken icon，自动露出底下的 token 化 `AMU` 字标。
- 主题：全部颜色消费 `--theme-*` 并带同主题字面 fallback；亮色主题用 `color-mix()` 从 `--theme-primary` 推一个 AA 级强调文字色（在 `#f0f2f5` 上约 5.4:1），小字正文一律走 `--theme-on-background`（约 14:1）。
- 减弱动画：**启动帘幕不参与 `prefers-reduced-motion` 降级**（人类 2026-09-15 最终拍板，中间经历过「整段跳过」→「静止首帧」两个中间态）。理由是现实场景：Windows「动画效果」关闭（`MinAnimate=0` / `SPI_GETCLIENTAREAANIMATION=False`）会让本机所有 Chromium 恒报 reduce，「按规范降级」直接等于「作者永远看不到这个功能」。站内其它动效（单元 4 主页入场、route-loading 环）仍各自遵守 reduce。
- 预览入口：`?boot=full` 绕过 sessionStorage 标记强制重放，且**不写**标记（预览不消耗「首访」）。
- 归位交接（2026-09-15 人类要求「头像向右平滑滑动到首页阿木头像的位置，然后平滑放大贴合」）：帘幕在 3.8s 序列结束后不再整体淡出，而是把**中央头像当作共享元素**飞向首页肖像：先滑到位（`translate`），再展开贴合（`scale` 落后于位移，58% 关键帧只到 0.76 倍），同时帷幕与信号环/文字/HUD 各自溶解。落点按「contain 后可见的图片矩形」计算，并补偿入场动画冻结帧的 `translateY(8px)`；飞完还会**复测一次**目标（飞行这一秒里页面仍在入场，实测移动端漂 12px、桌面 0px），用 160ms 过渡补掉差值 —— 桌面与 390×844 移动端实测落点 delta 均 = 0.00px。首页肖像在飞行期间用 `visibility: hidden` 等待，落地帧同一 tick 恢复并移除帘幕。帘幕头像与首页肖像共用同一张 `/img/amu-portrait.webp`（1024² WebP，199KB；替换掉原来 1.88MB 的 `portrait-hero.png`，旧文件与死组件 `HomeHero.vue` 同日删除），并且**首页肖像改为圆盘**（`border-radius: 50%` 挂在 `img` 上），归位飞行因此全程保持圆形裁剪、落地就是同一个圆（落点 delta 仍 0.00px）。圆盘外另加一圈 `.home-page__portrait-halo`：`::before` 是静止的「间隔刻度圆框」（`repeating-conic` 刻度 + `closest-side` 环带遮罩），`::after` 是水蓝流星（conic 尾部渐隐 + 亮头，6.4s 绕行一圈），颜色由 `color-mix(in srgb, var(--theme-accent) 52%, var(--theme-info))` 从现有 token 推出，暗/亮自动跟随。这是「同一个信号锁定环」从启动帘幕延续到常驻首页——归位之后，环留在肖像上。首访完整链路变为：3.8s 启动序列 → 0.6s 帷幕溶解 + 1.15s 飞行归位 → 头像落定即页面可交互，主页入场序列同时跑完。
- 主页入场交接（2026-09-15 人类要求「第一次进首页时完整展示」）：`app.vue` 全局样式写 `html.booting #app * { animation-play-state: paused !important }`，帘幕期间冻结 `#app` 内所有入场动画；`html.booting` 在**淡出开始**那一刻被移除，于是单元 4 的五步入场序列从帘幕透明化的同时开跑、完整展开。释放时机不能再晚：入场动画大量使用 `animation-fill-mode: both`，冻过头会让淡出露出停在 `opacity:0` 的空页面。首访完整链路：3.8s 启动序列 + 0.6s 淡出 → 入场序列 ~1.6s 跑完。

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
| 2026-09-15 | `/demo` 组件实验室改为 **dev-only**（`import.meta.env.DEV` 条件注册 + 删 `PAGE_SEO` 条目）：生产不再产出该路由、bundle 里整块被摇掉、预渲染 15 → 14；并**修掉 build 里 9 条 vue-router `reading 'path'` TypeError**（根因就是这条路由）。同时补齐 `/gallery` 破图守卫（索引页 + 详情页图条 + lightbox 三处 `@error`） | 人类要求「解决会露破图、搞定 /demo 线上可访问」；组件实验室属开发工具，线上可访问等于挂了个空路由 |
| 2026-09-15 | 三份单元 4 文档同步「实现载体修订」：ADR 新增 §2.24 + §6 变更日志；HOMEPAGE-ARCHITECTURE 改 §0 载体约定 / §1 区块 6-7 / §8.1 / §8.3 / §17 肖像资产行；GLOSSARY 改「Icon」条目。ARCHITECTURE §2 四条与 §3 单元 3 两条决策加载体修订注，并记录一处**行为漂移**（`/gallery` 预览 fallback 从 `onerror` 变成「缺 `src`」，`onerror` 守卫缺失） | 单元 5 用 `components/ui` 基件重写索引页与主页后，规格文档中的 8 个旧组件名成为悬空引用；按 §4.1 顺序（ADR → HOMEPAGE-ARCHITECTURE → GLOSSARY）同步，并把发现的漂移显式记录而不是悄悄改写 |
