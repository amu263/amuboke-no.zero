# ADR: AMU LIVE STYLE 主页（单元 4 设计语言）

> 人类维护；AI 可以起草条目，由人类审过后合入。
> 本 ADR 描述「AMU LIVE STYLE」主页设计语言作为单元 4 的方向。
> 本文档不实现任何代码；不增加依赖、远端字体、iframe、第三方播放器、统计脚本；
> 不在 AGENTS.md 追加新规则；不把单元 4 标为已完成。

| 字段 | 值 |
| --- | --- |
| 状态 | Proposed（已确认方向，未实现） |
| 日期 | 2026-08-22 |
| 决策者 | 项目所有者（阿木） |
| 适用范围 | 单元 4 主页 `/`；附带 `/gallery` 详情样式、`/listen` 新通道与内容 schema、构建期 `channels` 字段、测试内容策略 |
| 关联单元 | 上游 1–3（已跑通，详见 `docs/ARCHITECTURE.md` §1）；下游 5（UI 基件）、7（路由/主题/搜索/SEO） |

---

## 1. 背景

- 项目是阿木的个人站点。阿木是一位有 Bilibili 主页的创作者。
  本 ADR 只使用这一条可观察事实；其它创作者背景（题材、领域、作品清单）一概不写入设计决策。
- 单元 1–3 已落地：项目骨架、主题与设计 token、四类内容（posts / gallery / projects / friends）构建期定型。
  单元 4「页面组件」是下一会话单元。
- 既有主页 `apps/web/src/pages/index.vue` 是一个占位 entry-grid，不是最终形态。
- 参考站点 https://blog.fqzlr.top/ 只在「可迁移设计原则」层面被研究过：创作者优先身份、定制字体与个性、模块化内容平台、克制的卡片与列表基元。
  本 ADR 不克隆该站点的具体版式、配色、字体或文案，也不主张从该站引用任何具体事实。
- 设计 token 单一来源在 `apps/web/src/styles/tokens.ts`（TS）与 `tokens.scss`（SCSS）；本 ADR 不引入并行的调色板或字体栈。

## 2. 决策

本节是「AMU LIVE STYLE 主页设计语言」的条目化决策清单。每条都用一句陈述句写明决定本身；具体规范（尺寸、动画时长、token 字段）落在 `docs/HOMEPAGE-ARCHITECTURE.md`。

### 2.1 创作者优先身份

- 主页第一屏的视觉中心是创作者本人（肖像）与创作者本人的话（引言），不是项目名、技术栈、内容计数。
- 项目名 `amuboke-no.zero` 不出现在第一屏；只以「AMU LIVE STYLE」品牌词标出现。
- 技术栈、构建工具、版本号不出现在第一屏。

### 2.2 品牌词标 AMU LIVE STYLE

- 「AMU LIVE STYLE」作为品牌词标横贯全站四个通道，位置在导航下方的 hero。
- 词标在亮/暗双主题下都使用相同字号比例，色相跟随主题主色 token（`--theme-primary`）。
- 词标使用专属字体设计，成为首页最醒目的字标；不额外添加未确认的装饰指示点。

### 2.3 引言与双语处理

- Hero 的引言包含一行中文（主）与一行英文（次）。中文先读；英文是「对应表达」，不是逐字翻译。
- 当前文案为「过人的智慧是人类最大的财富」，英文为两行斜体小字「Wit beyond measure / is man’s greatest treasure.」。
- 中文走 display 字阶；英文走斜体 body 字阶。两行共享同一个引言容器，视觉层级是「大中文、小英文」。
- 在文案未定稿前，hero 渲染带占位文本的实现层壳，但占位文本必须明确标注为 placeholder，绝不能在视觉上冒充真稿。

### 2.4 提供的肖像 hero 处理

- Hero 由创作者提供的肖像 / 专辑封面图驱动。该资产在实现时由所有者提供；本 ADR 不臆造文件名或缩略图。
- 资产路径占位：`apps/web/public/images/home/portrait-hero.<ext>`，扩展名与文件名在资产到位时由实现会话写入。
- 在资产未到位期间，hero 渲染中性占位块（与主题 `background` 同色 + 居中的小标签「Portrait, pending asset」），不抛错、不显示破图 icon。
- 图片必须有 `alt`；占位阶段的 alt 为「Creator portrait, pending asset」。

### 2.5 无缝双栏 hero

- Hero 由「肖像栏」与「身份 / 引言 / 通道栏」两列构成。两列共享同一背景，无可见分隔、无边框、无内沟槽。
- 两列在桌面端并列，身份栏在左、肖像栏在右；在窄屏（< 768px）堆叠为身份栏在上、肖像在下。
- 肖像栏向身份栏一侧有极轻的 ambient gradient，让两列交界看起来是连续的一张图，而不是两块并排的图。
- 两栏内部使用 `--theme-spacing-xl` 外边距、`--theme-spacing-lg` 列内间距；该间距是「内部呼吸」，不是「列间沟槽」。

### 2.6 默认亮 / 暗调色板

- 不引入并行调色板。所有新增样式消费 `apps/web/src/styles/tokens.ts` 与 `tokens.scss` 既有的 `--theme-*` 变量。
- 亮色目标气质为纸张米白、雾面浅蓝、主蓝、深蓝灰文字与灰蓝细线；暗色目标气质为深蓝灰底、雾蓝高光与低对比米白文字。最终值统一落入上述 token，不在组件内散写。
- 暗 / 亮切换行为不变；既有的 `.v-theme--dark` / `.v-theme--light` 选择器策略不变。
- 任何新增的「玻璃」「磨砂」「叠层」效果只用 `backdrop-filter` + 现有 `scrim` / `scrimStrong` token，不新增颜色 token。

### 2.7 固定磨砂导航，无品牌按钮、无 Bilibili 按钮

- 顶部导航变更为 `position: fixed`，背景是磨砂玻璃（`backdrop-filter: blur(...)` + `var(--theme-surface)` 半透明），下方滚动内容可见但被压暗。
- 导航不显示品牌按钮（品牌词标 AMU LIVE STYLE 只在 hero 显示）。
- 导航不显示 Bilibili 按钮（Bilibili CTA 只在 hero 的身份栏出现，详见 §2.8）。
- 导航内只保留四通道链接（文章 / 图集 / 项目 / 听见）+ 主题切换胶囊（沿用单元 2 既有实现，不变）。
- 移动端（< 640px）：四链接水平滚动；品牌槽位继续省略。

### 2.8 Bilibili CTA URL

- Hero 的身份栏内有一个指向创作者 Bilibili 主页的 CTA 锚。
- URL 以常量 `BILIBILI_PROFILE_URL` 暴露在主页实现代码外的唯一来源（推荐位于 `apps/web/src/data/social.ts` 与 `apps/web/src/data/nav.ts` 同一目录）。
- 当前真值为 `https://space.bilibili.com/233594416`；实现通过 `BILIBILI_PROFILE_URL` 唯一来源消费，不在组件内重复硬编码。
- CTA 是普通出站锚（`target="_blank" rel="noopener noreferrer"`）+ 内联 SVG 图标；不嵌第三方 iframe、不引第三方播放器、不调第三方统计脚本。

### 2.9 入场动画生命周期

- 入场动画仅在 `/` 路由首次绘制时播放一次，不可循环、不可滚动再次触发。
- 入场序列五步：肖像淡入上移 → 词标 / 副标 / 引言 / 通道 / CTA 级联 → 最近更新行错落出现 → 热力图按列错落出现 → 四通道卡淡入。
- 每步时长、缓动、错落间隔的具体数值在 `docs/HOMEPAGE-ARCHITECTURE.md` §4 中给出（实现会话写入 CSS keyframes / transition）。
- 全部动画走 CSS keyframes 或类切换 transition；不引 JS 动画库。

### 2.10 减弱动画行为

- 在 `@media (prefers-reduced-motion: reduce)` 下：五步序列全部跳过，内容在首帧完整可见；热力图单元同时全亮（无错落）；最近更新行同时出现。
- 减弱动画下仍保留必要的焦点提示（如焦点环），仅抑制装饰性位移与透明度脉冲。

### 2.11 四通道与路由映射

- 四通道：折腾（Projects）、观察（Posts）、听见（Listen）、看见（Gallery）。
- 路由映射：
  - `/posts`、`/posts/:slug`（既有，沿用）
  - `/gallery`（既有索引；本 ADR 在 §2.14 强化卡片样式与全屏预览，不新增详情路由）
  - `/projects`（既有索引）
  - `/listen`（新增音乐档案页；本 ADR 在 §2.16 给出 schema）
- `/friends` 保持既有友链页，不被纳入四通道「内容入口」网格，但友链条仍可出现在主页底部。

### 2.12 `channels` 内容字段

- posts / gallery / projects / listen 内容条目可声明可选字段 `channels: string[]`。
- 取值集合固定为：`"折腾" | "观察" | "听见" | "看见"`。
- 缺省视为「仅在条目自身主通道出现」；一条内容可以归属多个频道。
- friends 不属于四频道，始终只在 `/friends` 出现，不使用 `channels`。
- 构建期 `apps/web/src/content/build-time-index.ts` 据此把同一 slug 聚合到多个频道列表；最近更新列表去重。

### 2.13 SSG 全量索引 + 媒体懒加载

- 构建期索引保持 eager `import.meta.glob` 形态（沿用单元 3 决策）。
- 所有图像走原生 `loading="lazy"` + `decoding="async"`；hero 肖像与首屏通道卡首图设 `loading="eager"` + `fetchpriority="high"`。
- 图像不放 base64，不引 CDN，所有图像落在 `apps/web/public/images/<kind>/...`。

### 2.14 `/gallery` 白色圆角凸起框 + 全屏预览

- 卡片表面：浅色主题下为白（`var(--theme-surface)`），深色主题下为近黑但仍走同一 token；卡片是「凸起」感（`var(--theme-shadow-md)`，悬停提升到 `var(--theme-shadow-lg)` + `translateY(-2px)`）。
- 卡片边角：`var(--theme-radius-lg)`。
- 在边框内侧再加一条 1px 的内白「画框边」（同样消费 `--theme-surface`），让卡片在缩略图缩放时有「框中框」层次。
- 点击缩略图（或键盘聚焦后按 Enter）打开全屏预览：viewport 填满的单图，关闭走 Escape / 点击遮罩 / 关闭按钮；焦点被圈在预览内直到关闭。
- 全屏预览不轮播、不嵌入第三方图床、不引入灯箱库。

### 2.15 24 周 / 24 格 / 5 级热力图

- 主页热力图为 24 列 × 1 行 ≈ 半年活动密度图。
- 5 个强度等级（0–4）。等级 0 用 `var(--theme-scrim)`；1–4 用 `--theme-primary` 的递进透明度（最终透明度值由实现会话挑定，需在两主题下都满足 WCAG AA 对比度）。
- 数据源：SSG 期从 `POSTS / GALLERIES / PROJECTS / LISTENS`（listen 到位时）按 ISO 周聚合。
- 每个单元是 `<button>`，可 Tab 聚焦；左右箭头在单元之间移动，Home / End 跳到行首 / 行尾。

### 2.16 鼠标跟随液态玻璃 tooltip

- 热力图单元 hover 或 focus 时显示 tooltip：玻璃质感（`backdrop-filter` + 低透明背景 + `var(--theme-border)` 细边）。
- 在非减弱动画下，tooltip 以约 60ms 缓动跟随指针；减弱动画下，tooltip 不跟随指针，固定在聚焦单元的下方偏移处显示。
- tooltip 显示本周日期区间与条目计数，使用 `aria-describedby` 把内容挂到触发单元上。

### 2.17 CD 标签形态最近更新行

- 「最近更新」是一个紧凑列表，每行是一条窄长 CD 标签形态的条目（通道小标 + 日期 + 标题）。
- 行宽不超过约 480px，单行超出截断为省略号；hover 或键盘 focus 时弹出 magnifier 预览，复用该条目详情页的真实渲染内容。

### 2.18 渲染内容 magnifier 预览

- magnifier 是约 360 × 220px 的浮层 div，复用对应详情页的真实渲染内容，不是纯文本摘要卡。
- hover 时沿条目横向跟随指针位置（约 120ms 缓动），内容窗口随焦点平移，像液态玻璃放大镜扫过真实内容；focus 时锁在固定位置。
- magnifier 不加载第三方嵌入，不调用远端接口，仅消费构建期已有的渲染 HTML 与静态媒体。

### 2.19 桌面 / 移动 / 键盘行为

- 桌面（≥ 1024px）：完整版式，导航四链接全部显示，热力图 12px 单元。
- 平板（768–1023px）：导航四链接全部显示，热力图 10px 单元。
- 移动（< 768px）：导航四链接横向滚动省略号提示；hero 改双栏堆叠为单栏；热力图保持 24 列但单元格缩到 10px。
- 键盘：所有交互元素 Tab 可达且可见焦点环；hero CTA、通道卡、最近更新行、热力图单元的 Enter / Space 行为符合其语义（按钮触发、链接跳转）。

### 2.20 `/listen` schema

- 新内容类型：音乐作品 / 专辑清单。
- 文件位置：`apps/web/src/content/listen/*.json`，文件名 kebab-case，`slug` 字段与文件名一致。
- 必填字段：
  - `slug: string`
  - `title: string`
  - `artist: string`
  - `album: string`
  - `year: number`（四位数年份）
  - `genres: string[]`
- 可选字段：
  - `date?: string`（ISO 发布日期）
  - `cover?: string`（封面图路径，默认 `apps/web/public/images/listen/<slug>/cover.<ext>`）
  - `summary?: string`
  - `links?: { external?: string }`（出站外链，仅锚，不嵌第三方播放器）
  - `tracks?: Array<{ title: string; duration?: string }>`
  - `channels?: string[]`（见 §2.12）
- 构建期需要的扩展（实现会话做）：`ListenMeta` 接口、`LISTENS` glob、`getContentSummary()` 增加 `listens` 字段、router.ts 新增 `/listen` 索引路由。

### 2.21 八级视觉标题

- HTML 仅有 h1–h6 共 6 级；多出的视觉级 7、级 8 通过 `<span class="heading" data-level="7|8">…</span>` 实现。
- data-level 只用于装饰性 eyebrow / lede，不承载语义，永远不是按钮或锚的内容。
- 样式钩子 `.heading[data-level="7"]` 与 `.heading[data-level="8"]` 消费同一字号 token 阶梯，与 h1–h6 视觉节奏一致。

### 2.22 测试内容策略

- 当前仓库内的文章只是布局测试内容。设计验收前保留，用于验证文章卡片、八级标题、代码块和最近更新预览；设计验收后由所有者删除并重写正式文章。
- 本次不修改现有测试内容，也不新增自动过滤策略。正式内容上线前，由所有者完成内容替换与生产构建复核。

### 2.23 代码块处理

- 沿用单元 2 已落地的 `<pre><code>` 彩虹玻璃基线（在 `.markdown-body` 与对应自定义组件内）。
- 新增页面不引入替代代码块样式。
- 长代码行走横向滚动（`overflow-x: auto`）；滚动必须在聚焦时可见，供键盘用户使用。
- 外层包裹 `role="region"` + `aria-label="Code"`，便于屏幕阅读器发现。

## 3. 影响

### 3.1 正面影响

- 主页第一屏的视觉重心是创作者本人与品牌词标，不再是项目结构图。
- 四通道在导航、hero 通道卡、最近更新条、热力图等多处重复出现，单一身份可被读者快速识别。
- 减弱动画与键盘用户拿到的仍是完整、可导航的主页。

### 3.2 风险与依赖

- `/listen` 是第五个内容类型。加入它要求同时改 build-time-index.ts、router.ts、`getContentSummary()`、依赖图。
- Hero 依赖所有者提供的肖像资产；Bilibili 真值已经确认，资产未到位期间实现可先落布局壳。
- `channels` 字段会让同一 slug 在多个通道出现，需要明确「不重复出现」的渲染策略（按通道分组显示 + 同一 slug 在最近更新列表中只出现一次）。

## 4. 范围边界

本 ADR 范围内：

- 单元 4 主页 `/` 的视觉与组件规范（落在 `docs/HOMEPAGE-ARCHITECTURE.md`）。
- 公共术语表（落在 `docs/GLOSSARY.md`）。
- `docs/ARCHITECTURE.md` §4 的索引指针。

本 ADR 范围外：

- 任何实现代码、PR、commit。
- 任何新依赖（无远程字体、无图标字体、无第三方播放器、无统计脚本）。
- AGENTS.md 的新规则。
- 把单元 4 标为已完成。
- 克隆参考站点的具体版式或文案。

## 5. 未解决的实现依赖

| 项 | 阻塞什么 | 谁提供 |
| --- | --- | --- |
| `BILIBILI_PROFILE_URL` 代码位置 | Hero 的 Bilibili CTA 的唯一 URL 来源 | 实现会话 |
| 肖像资产文件 | Hero 肖像栏的真图渲染（占位壳可先落地） | 所有者 |
| 引言真稿（中文主 + 英文次） | Hero 引言区显示真稿 | 已确认文案 |
| `/listen` 页面与 schema | 第五个内容类型的引入时机 | 实现会话 |
| 现有测试文章 | 正式内容上线前替换 | 所有者 |

## 6. 变更日志

| 日期 | 变更 | 原因 |
| --- | --- | --- |
| 2026-08-22 | 创建本 ADR | 记录「AMU LIVE STYLE」主页设计语言，作为单元 4 的方向（不实现代码） |
