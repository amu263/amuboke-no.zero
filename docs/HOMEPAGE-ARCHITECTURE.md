# HOMEPAGE-ARCHITECTURE — AMU LIVE STYLE 主页规格

> 本文是单元 4 主页 `/` 与受其影响的 `/gallery`、`/listen` 的「实现可读」规格文档。
> 不含实现代码;不含新依赖;不在 AGENTS.md 追加新规则;不把单元 4 标为已完成。
> 设计语言来源见 `docs/ADR-amu-live-style-homepage.md`;术语见 `docs/GLOSSARY.md`。

## 0. 文档约定

- 「组件 X」指将要实现的 Vue SFC,落在 `apps/web/src/components/<domain>/`。
- 「区块」指主页的一个顶层视觉区域。
- 「槽位」指组件内可注入内容的命名区域。
- 所有颜色 / 间距 / 字号 / 圆角 / 阴影 / 字号阶梯消费 `apps/web/src/styles/tokens.ts` 与 `tokens.scss` 既有的 `--theme-*` 变量。不在本规格中重新声明数值。
- 视觉目标色感:亮色以纸张米白、雾面浅蓝、主蓝、深蓝灰文字和灰蓝细线为核心;暗色以深蓝灰底、雾蓝高光和低对比米白文字为核心。实现时将这些目标统一写入既有主题 token,不在组件内散写颜色。
- 减弱动画特指 `@media (prefers-reduced-motion: reduce)`。下文简称「减弱动画」。
- 「非减弱动画」即默认动画行为。

## 1. 页面结构(自上而下)

1. 固定磨砂导航(Fixed frosted navigation)
2. 无缝双栏 hero(Seamless two-column hero)
3. 最近更新(CD-label rows + magnifier preview)
4. 活动热力图(24-week × 24-cell, 5 levels)
5. 四通道网格(Four channels grid)
6. 友链条(Friends strip,沿用单元 3 现有组件)
7. 单行页脚(Monospace single-line footer)

区块 6 与 7 在本文中不重复规格,沿用既有 `FriendCard` 与基础 footer;如需调整样式,在后续会话中按 ADR 一致性原则补记。

## 2. 固定磨砂导航

### 2.1 容器

- 位置:`position: fixed; top: 0; left: 0; right: 0`。
- 背景:`var(--theme-surface)` 半透明 + `backdrop-filter: blur(<token>)`。具体 blur 值由实现会话定,以「滚动内容可辨但被压暗」为准。
- 底边:`1px var(--theme-border)` 细线。
- z-index 高于主页网格背景(`.grid-bg`),低于模态层(全屏预览)。

### 2.2 内容槽位(顺序自左向右)

- 无品牌槽位(品牌词标 AMU LIVE STYLE 只在 hero 出现,详见 §3)。
- 四通道链接槽:文章 / 图集 / 项目 / 听见。各自是 router-link,激活态高亮(用 `--theme-primary` + `var(--theme-scrim)` 背景)。
- 无 Bilibili 按钮槽(Bilibili CTA 只在 hero 身份栏出现,详见 §3.2)。
- 主题切换胶囊槽:沿用单元 2 既有实现,行为与外观不变。

### 2.3 移动端(< 640px)

- 四链接槽改为水平滚动 row;超出时用省略号提示。
- 主题切换槽保持;品牌槽位继续省略。
- 容器内边距收紧,使用 `--theme-spacing-sm`。

### 2.4 键盘与可达性

- 全部交互元素 Tab 可达,可见焦点环(2px `--theme-primary`,offset 2px)。
- Tab 顺序:四链接自左向右 → 主题切换。
- 导航包裹 `<nav aria-label="主导航">`。

## 3. 无缝双栏 hero

### 3.1 容器

- 桌面(≥ 768px):身份栏在左、肖像栏在右,无 `gap`(两栏无缝)。
- 窄屏(< 768px):堆叠,身份栏在上,肖像在下;单列。
- 容器背景:`var(--theme-background)`,与 body 背景连续;两栏之间无 border / 无 separator / 无内 gutter。
- 容器外边距:`--theme-spacing-xl`;两栏各自内部 padding:`--theme-spacing-lg`。
- 容器圆角:仅在窄屏堆叠时给身份栏 `var(--theme-radius-lg)`;桌面版无圆角。

### 3.2 肖像栏(Portrait column)

- 单图:创作者提供的肖像 / 专辑封面。
- 资产路径占位:`apps/web/public/images/home/portrait-hero.<ext>`。
  - `<ext>` 与最终文件名由所有者提供资产后写入。
  - 占位阶段,实现层渲染「`var(--theme-background)` 同色 + 居中的小标签 Portrait, pending asset」的中性占位块。
- 图片必须 `alt`;占位阶段固定 alt:`Creator portrait, pending asset`。
- 图片尺寸通过 `width` / `height` 属性显式声明以防 CLS。
- 桌面端图片向左侧(身份栏一侧)有极轻 ambient gradient,从 `--theme-background` 渐变到 `--theme-surface`,让两栏交界看起来是连续的同一画面。
- 加载属性:首屏图,`loading="eager"` + `fetchpriority="high"` + `decoding="async"`。
- 弱网与缺失资产的回退:不抛 console error,不显示破图 icon;渲染占位块。

### 3.3 身份 / 引言 / 通道栏(Identity / quote / channels column)

内容自上而下:

1. 品牌词标 `AMU LIVE STYLE`
   - 使用字体设计 skill 形成专属字标;具体字形在实现阶段落地,颜色消费 `--theme-primary`。
2. 副标(eyebrow):一行中文,字号 `--theme-font-size-sm`,颜色 `--theme-on-background` 半透明。
3. 引言(quote):
    - 中文主「过人的智慧是人类最大的财富」:`--theme-font-size-2xl` display 字号,`--theme-on-background`。
    - 英文次分两行「Wit beyond measure / is man’s greatest treasure.」:`--theme-font-size-base` 斜体 body 字号,`--theme-on-background` 70% 不透明。
   - 两行共享同一 `<blockquote>` 容器,垂直层级为「大中文 → 小英文」。
   - 文案未到位阶段:占位文本必须明确标注为 placeholder(视觉上以小一号 + 50% 不透明区分),绝不冒充真稿。
4. 通道 chips:四枚 chip(折腾 / 观察 / 听见 / 看见),各自 router-link 到对应索引路由。
   - chip 视觉:圆角 `var(--theme-radius-md)`,padding `--theme-spacing-xs` `--theme-spacing-md`。
   - 颜色:背景 `var(--theme-scrim)`,文字 `--theme-on-background`;hover 时背景 `--theme-surfaceVariant`。
   - 字号:`--theme-font-size-sm`,font-family 走 mono token。
   - 不用 Vuetify 的 `outlined` variant(按 AGENTS.md §5 #8 在暗色下边框刺眼)。
5. Bilibili CTA 锚:
   - 出站锚,`target="_blank" rel="noopener noreferrer"`。
   - 文本 `Bilibili` + 内联 SVG 图标(不引第三方图标字体)。
    - URL 常量 `BILIBILI_PROFILE_URL`,值为 `https://space.bilibili.com/233594416`。

## 4. 入场动画生命周期

仅在 `/` 路由首次绘制时播放一次。序列五步:

| 步 | 内容 | 起 | 持续 | 缓动 |
| --- | --- | --- | --- | --- |
| 1 | 肖像栏淡入 + 上移 8px | 0ms | 360ms | ease-out cubic |
| 2a | 词标淡入 | 240ms | 280ms | ease-out cubic |
| 2b | 副标淡入 | 320ms | 240ms | ease-out cubic |
| 2c | 引言中文淡入 | 400ms | 280ms | ease-out cubic |
| 2d | 引言英文淡入 | 480ms | 240ms | ease-out cubic |
| 2e | 通道 chips 整体淡入 | 560ms | 240ms | ease-out cubic |
| 2f | Bilibili CTA 淡入 | 640ms | 240ms | ease-out cubic |
| 3 | 最近更新行错落(每行 40ms 间隔) | 760ms | 每行 200ms | ease-out cubic |
| 4 | 热力图按列错落(每列 30ms 间隔) | 1000ms | 每列 180ms | ease-out cubic |
| 5 | 四通道卡淡入 | 1240ms | 320ms | ease-out cubic |

实现路径:CSS `@keyframes` + 类切换,或 `transition` + 类切换。不引 JS 动画库。

减弱动画(`@media (prefers-reduced-motion: reduce)`):

- 五步序列全部跳过,内容在首帧完整可见。
- 热力图单元同时全亮,无错落。
- 最近更新行同时出现。

## 5. 最近更新(CD-label rows + magnifier preview)

### 5.1 数据源

- 来自 SSG 期构建的四通道最近条目合并,按日期 desc 排序。
- 上限 8 条。
- 同一 slug 在多个通道出现时,在最近更新列表中只显示一次(显示其主通道);但构建期索引在每个通道索引页都列出该 slug。
- 当前无任何通道的 `listen` 条目时,`channels` 字段仍生效,但 `LISTENS` 为空数组,热力图与最近更新都不引用 listen 数据。

### 5.2 行形态

- 行宽最大约 480px;超长单行省略号(`text-overflow: ellipsis`)。
- 单行三段结构:通道小标(约 60px) + 日期 ISO 短(约 90px,等宽) + 标题(剩余空间)。
- 字体:`--theme-font-mono`;字号 `--theme-font-size-sm`。
- 颜色:文字 `--theme-on-background`,hover 时背景 `var(--theme-scrim)`。
- 通道小标颜色与对应通道的 chip 视觉一致(都用 `--theme-primary` 或同等 token;不新增 token)。

### 5.3 magnifier 预览

- 浮层 div,尺寸约 360 × 220px,内容为该条目详情页的真实渲染内容,不是「封面 + 一行摘要」的替代卡片。
- hover 时沿条目横向跟随指针位置,120ms 缓动;指针移出行内时(`mouseleave`)立即隐藏。内容窗口随焦点平移,形成放大镜扫读效果。
- focus 时:锁定在固定位置(行右侧 16px offset),不跟随指针;`blur` 时隐藏。
- 视觉:背景 `var(--theme-scrimStrong)` + `backdrop-filter: blur(...)` + 边框 `var(--theme-border)` 细线 + 圆角 `var(--theme-radius-md)`。
- 内容来源:构建期已索引并编译的 Markdown、图像、项目内容或音乐元数据;不调用远端接口,不加载第三方嵌入。
- 减弱动画:浮层仍出现,仅取消 hover 时的缓动跟随。

### 5.4 键盘与可达性

- 每行是 `<a>`(router-link),Tab 可达,Enter 跳转。
- focus 时同步显示 magnifier 锁定版本(详见 §5.3)。

## 6. 活动热力图

### 6.1 网格形态

- 24 列 × 1 行;每单元约 12px × 12px(桌面),10px × 10px(移动)。
- 单元间距 2px。
- 整行宽 = 24 × 12 + 23 × 2 = 334px(桌面),24 × 10 + 23 × 2 = 286px(移动)。
- 行放在 `<section>` 内,标题 `data-level="8"` eyebrow 形式的「活动密度」(具体文案待所有者定)。

### 6.2 5 级强度

- Level 0(无活动):背景 `var(--theme-scrim)`。
- Level 1–4:在 `--theme-primary` 上叠加递进透明度(0.20 / 0.40 / 0.65 / 0.90)。最终透明度值由实现会话在两主题下用对比度工具校验,需满足 WCAG AA 对应文字色与背景色的对比。
- 单元边框:`1px transparent`,focus 时改为 `var(--theme-primary)` 2px outline(在外侧,不占单元 box)。

### 6.3 数据生成

- SSG 期从 `POSTS / GALLERIES / PROJECTS / LISTENS`(`listen` 到位时)按 ISO 周聚合。
- 单元代表「那一周的总条目数」,映射到 0–4 等级(0 / 1 / 2–3 / 4–6 / 7+ 等阈值由实现会话定)。
- 当所有通道都为空时,整行 24 个单元都是 Level 0,仍渲染(以保持占位形态)。

### 6.4 液态玻璃 tooltip

- 触发:单元 hover 或 focus。
- 内容:那一周的日期区间(ISO 周,周一–周日)、条目计数和该周条目标题。
- 视觉:背景 `var(--theme-scrimStrong)` 半透明 + `backdrop-filter: blur(...)` + `1px var(--theme-border)` 细边 + 圆角 `var(--theme-radius-md)` + padding `--theme-spacing-sm` `--theme-spacing-md`。
- 跟随行为:
  - 非减弱动画:tooltip 跟随指针,约 60ms 缓动。
  - 减弱动画:tooltip 不跟随指针,固定在聚焦单元下方 8px offset,直接显隐。
- 可达性:聚焦单元使用 `aria-describedby` 把 tooltip 内容挂上去;tooltip 元素自身 `role="tooltip"`。

### 6.5 键盘交互

- 单元是 `<button type="button">`,Tab 可达。
- 箭头键 ← / → 在单元之间移动焦点;Home / End 跳到行首 / 行尾。
- Enter / Space 触发 tooltip 锁定显示(等同 hover 行为)。

## 7. 四通道网格

### 7.1 容器

- CSS grid,`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`,间距 `--theme-spacing-md`。
- 四枚卡;卡片视觉权重相等(尺寸、字号、间距一致)。
- 视觉上沿用单元 3 的 `entry-card` 原语(圆角、border、hover 抬升),不另立新组件。

### 7.2 卡片内容

- 顶部小标:通道 mono 缩写(`#TINKER` / `#OBSERVE` / `#LISTEN` / `#SEE`),字号 `--theme-font-size-xs`,色 `--theme-primary`。
- 标题:通道中文名(折腾 / 观察 / 听见 / 看见),字号 `--theme-font-size-xl`,weight 600。
- 计数:`getContentSummary().posts` 等,字号 `--theme-font-size-sm`,`--theme-on-background` 60% 不透明。
- 一行说明:与通道定位对应(例:图集 → 「一组照片」),字号 `--theme-font-size-sm`,`--theme-on-background` 70% 不透明。
- 卡片整体是 `<router-link>`;`focus-visible` 显示焦点环。

### 7.3 排序

- 顺序固定:折腾 → 观察 → 听见 → 看见。无需因内容数量动态调整。

## 8. `/gallery` 白色圆角凸起框 + 全屏预览

### 8.1 卡片视觉(覆盖单元 3 既有 `GalleryGrid` 的视觉)

- 表面:`var(--theme-surface)`。亮主题下为白,暗主题下为近黑,但视觉一致性靠 token,不强写 hex。
- 圆角:`var(--theme-radius-lg)`。
- 阴影:`var(--theme-shadow-md)`(静止),`var(--theme-shadow-lg)` + `translateY(-2px)`(hover)。
- 内画框边:在 border 内侧再加 1px `var(--theme-surface)` 内边,形成「框中框」层次。
- 边框:外 1px `var(--theme-border)` 细线。

### 8.2 全屏预览(Fullscreen preview)

- 触发:点击卡片封面图,或在封面图聚焦状态下按 Enter。
- 容器:`position: fixed; inset: 0`,背景 `var(--theme-scrimStrong)` + `backdrop-filter: blur(...)`。
- 内容:单图,viewport 居中,`object-fit: contain`,最大宽高 ≤ viewport - 2 × `--theme-spacing-xl`。
- 关闭按钮:右上角,内联 SVG 「×」图标,`var(--theme-on-background)`。
- 关闭方式:Escape 键 / 遮罩点击 / 关闭按钮。
- 焦点圈:打开时焦点落在关闭按钮;Tab 在预览内循环;预览关闭后焦点返回触发元素。
- 不轮播、不嵌入第三方图床、不引入灯箱库。

### 8.3 卡片非交互例外

- `GalleryGrid` 的卡片 figure 本身**不**挂 `<a>`(沿用 ARCHITECTURE.md §3 单元 3 决策 #5:索引卡片非交互)。
- 全屏预览通过卡片内的独立 `<button class="gallery-grid__open">` 触发,不通过卡片本身触发。

## 9. `/listen` schema

### 9.1 文件位置与命名

- 位置:`apps/web/src/content/listen/*.json`。
- 文件名 kebab-case;`slug` 字段与文件名一致(无 `.json` 后缀)。

### 9.2 必填字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `slug` | `string` | 与文件名一致 |
| `title` | `string` | 作品标题 |
| `artist` | `string` | 艺术家 / 演出者 |
| `album` | `string` | 专辑名 |
| `year` | `number` | 四位数年份 |
| `genres` | `string[]` | 类型 / 流派标签 |

### 9.3 可选字段

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `date` | `string` | — | ISO 发布日期 |
| `cover` | `string` | `apps/web/public/images/listen/<slug>/cover.<ext>` | 封面图路径 |
| `summary` | `string` | — | 一行说明 |
| `links` | `{ external?: string }` | — | 出站外链(只锚,不嵌第三方播放器) |
| `tracks` | `Array<{ title: string; duration?: string }>` | — | 曲目列表 |
| `channels` | `string[]` | `["听见"]` | 多通道聚合 |

### 9.4 与构建期索引的衔接

实现会话需扩展 `apps/web/src/content/build-time-index.ts`:

- 新增 `ListenMeta` 接口,字段与 §9.2 / §9.3 对齐。
- 新增 `LISTENS` glob:`import.meta.glob<ListenMeta>('./listen/*.json', { eager: true })`。
- 扩展 `getContentSummary()` 增加 `listens` 字段。
- 扩展 `ContentSummary` 接口。
- 路由:`router.ts` 新增 `/listen` 索引路由。

## 10. 内容字段 `channels`

### 10.1 取值集合

固定:`"折腾" | "观察" | "听见" | "看见"`。

### 10.2 行为

- 缺省:条目仅出现在自身主通道索引页。
- 显式列出:条目出现在所列通道的索引页(去重按 slug)。
- 友链不属于四频道,`channels` 字段对其不生效,友链条目始终只在 `/friends` 出现。
- 在最近更新列表中,同一 slug 即使属于多个通道,只出现一次(取主通道)。

### 10.3 校验

构建期索引对 `channels` 字段做白名单校验:任何不在取值集合内的字符串在 SSG 阶段直接抛错(`channels contains unknown value "<x>"`),阻止带病构建。

## 11. 测试内容策略

- 现有 `hello-world.md` 文章只是布局测试内容,设计验收前保留,用于验证文章卡片、八级标题、代码块和最近更新放大镜。
- 本次不修改或自动过滤现有测试内容。
- 设计验收后由所有者删除测试文章并创建正式内容,再进行生产构建复核。

## 12. 八级视觉标题

### 12.1 HTML 边界

- h1–h6 共 6 级,语义由页面 / 区段结构决定。
- 视觉级 7 与级 8 通过 `<span class="heading" data-level="7|8">…</span>` 实现,纯装饰。

### 12.2 用途

- 级 8:eyebrow / lede / 极小号副标。
- 级 7:小号副标题,比正文略大,比 h6 略小。
- 两者都不承载语义,不能成为按钮或锚的内容。

### 12.3 样式钩子

- `.heading[data-level="7"]` 与 `.heading[data-level="8"]` 消费同一字号 token 阶梯,与 h1–h6 视觉节奏一致。
- 不在 AGENTS.md 追加新规则;本约定仅限本文。

## 13. 代码块处理

- `<pre><code>` 沿用单元 2 彩虹玻璃基线。
- 长代码行:`overflow-x: auto` 横向滚动;滚动条在聚焦时可见,供键盘用户使用。
- 外层 `<div role="region" aria-label="Code">` 包裹,便于屏幕阅读器发现。
- 新页面不引入替代方案。

## 14. 媒体加载

- 所有非首屏图像:`loading="lazy"` + `decoding="async"`。
- 首屏图像(hero 肖像、各通道卡首图若用图):`loading="eager"` + `fetchpriority="high"` + `decoding="async"`。
- 图像不放 base64,不引 CDN。
- 图像必须 `width` + `height`,防止 CLS。

## 15. 可达性总览

- 所有交互元素键盘可达,可见焦点环。
- WCAG AA 对比度在亮 / 暗双主题下都满足(尤其热力图 5 级、tooltip 玻璃叠层)。
- 主页 landmarks:`<header>`(hero)、`<main>`(热力图 / 通道 / 最近更新)、`<aside>`(友链)、`<footer>`(页脚)。
- 减弱动画与焦点环共存(焦点环不因减弱动画被抑制)。

## 16. 范围边界

本文规格范围内:

- `/`、`/gallery`、`/listen` 三个路由的视觉与组件规格。
- `ListenMeta` schema 与 build-time-index 衔接的字段扩展。
- `channels` 字段在 SSG 期的行为与校验。
- 测试内容策略。

本文规格范围外:

- 任何实现代码 / PR / commit。
- 任何新依赖、远端字体、图标字体、第三方播放器、iframe、统计脚本、分享脚本。
- AGENTS.md 的新规则。
- 把单元 4 标为已完成。
- 克隆参考站点(https://blog.fqzlr.top/)的任何具体版式或文案。

## 17. 未解决的实现依赖

| 项 | 阻塞什么 | 解决路径 |
| --- | --- | --- |
| `BILIBILI_PROFILE_URL` 代码位置 | Hero 的 Bilibili CTA 的唯一 URL 来源 | 实现会话写入 `apps/web/src/data/social.ts`,值为 `https://space.bilibili.com/233594416` |
| 肖像资产文件 | Hero 肖像栏真图渲染 | 所有者提供后放入 `apps/web/public/images/home/portrait-hero.<ext>`;占位壳可先落地 |
| 引言真稿(中文主 + 英文次) | Hero 引言区显示真稿 | 已确认文案,实现会话直接落地 |
| `/listen` 页面与 schema | 第五个内容类型的实现 | 单元 4 按本文 §9 实现 |
| 现有测试文章 | 正式内容上线前替换 | 所有者在设计验收后删除并重写 |
| 减弱动画下热力图 Level 1–4 的最终透明度数值 | 减弱动画 + 两主题下的对比度达标 | 实现会话用对比度工具校验后定值 |
