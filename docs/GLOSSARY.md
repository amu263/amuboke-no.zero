# GLOSSARY

> 公共术语表。本文档定义在 `docs/ADR-amu-live-style-homepage.md`、`docs/HOMEPAGE-ARCHITECTURE.md`、`docs/ARCHITECTURE.md` 与未来实现会话之间共享的术语。
> 与 `AGENTS.md` 的关系：本表对 AGENTS.md 已定义的术语做「项目内延伸」,不重写也不冲突；AGENTS.md 未定义的术语在此首次落地。

## A

**AMU LIVE STYLE**
项目的品牌词标。在亮 / 暗双主题下保持同一字号比例，色相跟随 `--theme-primary` token，字形由字体设计方案确定。

**Alt text (alt 文本)**
图像元素的替代文本。本项目中所有 `<img>` 必须有非空 `alt`。占位阶段的固定 alt 文案见 `HOMEPAGE-ARCHITECTURE.md` §3.1。

## B

**Backdrop-filter**
CSS 属性,用于玻璃 / 磨砂效果。本项目在导航条、tooltip、最近更新行的 magnifier 等多处使用,只消费既有 token,不引第三方库。

**Bilibili CTA**
Hero 身份栏内指向创作者 Bilibili 主页的出站锚。URL 常量为 `BILIBILI_PROFILE_URL`,值为 `https://space.bilibili.com/233594416`。CTA 是普通锚 + 内联 SVG,不嵌第三方 iframe。

**Brand (品牌)**
本项目中,品牌面是创作者阿木本人,不是框架名或工具链。`AMU LIVE STYLE` 与任何 tagline 都指向创作者,而不是 Vue / Vuetify / Vite 等。

## C

**CD-label row (CD 标签行)**
最近更新条目的窄长单行形态:通道小标 + 日期 + 标题,monospace 字体,单行省略号。hover / focus 触发 magnifier 预览。

**Channel (通道)**
四通道内容入口之一:折腾 (Projects) / 观察 (Posts) / 听见 (Listen) / 看见 (Gallery)。每个通道有自己的索引路由与组件族。

**Channels field**
内容条目可选字段 `channels: string[]`,取值集合固定为 `"折腾" | "观察" | "听见" | "看见"`。缺省视为主通道。友链不属于四频道,不使用此字段。

**Code block treatment**
`<pre><code>` 的视觉处理。本项目沿用单元 2 已落地的彩虹玻璃基线,不在新页面引入替代方案。

**Cover**
条目封面图。`gallery` 用 `cover` 或第一张 `photos[0].src`;`listen` 用 `cover`;`posts` 用 frontmatter `cover`。所有封面图落在 `apps/web/public/images/<kind>/<slug>/`。

**Creator-first identity (创作者优先身份)**
主页设计语言,把创作者本人(肖像)与本人话语(引言)放在第一屏的视觉中心,先于项目名、技术栈、内容计数。

## D

**Data-level 7 / 8**
超出 h6 的额外视觉级,通过 `<span class="heading" data-level="7|8">…</span>` 实现。不可用于按钮 / 锚的内容,仅作装饰 eyebrow / lede。

**Documented (已记录)**
文档已经写明一项决策的状态。它不意味着「已实现」。

**Drafts may be human-reviewed (AI 起草,可由人类审过)**
本仓库的文档协作约定:AI 可以起草条目,人类审过后合入。详见 `ARCHITECTURE.md` 顶部声明。

## E

**Eager build-time index**
构建期全量导入内容的索引模式,使用 `import.meta.glob(..., { eager: true })`。运行时不再 fetch / parse。定义见 `apps/web/src/content/build-time-index.ts`。

**Entrance animation lifecycle (入场动画生命周期)**
主页 `/` 路由首次绘制时一次性播放的五步序列:肖像淡入上移 → 词标 / 副标 / 引言 / 通道 / CTA 级联 → 最近更新行错落 → 热力图按列错落 → 四通道卡淡入。减弱动画下五步全部跳过。

**External link (出站链接)**
指向站外的链接。本项目中所有出站锚都带 `target="_blank" rel="noopener noreferrer"`。

## F

**Fixed frosted navigation (固定磨砂导航)**
顶部导航条以 `position: fixed` 固定,背景是磨砂玻璃(`backdrop-filter: blur(...)` + `--theme-surface` 半透明)。导航不含品牌按钮、不含 Bilibili 按钮,只含四通道链接 + 主题切换。

**Four channels (四通道)**
折腾 / 观察 / 听见 / 看见。导航、hero 通道卡、最近更新条、热力图统计均围绕这四通道。

**Fullscreen preview (全屏预览)**
`/gallery` 卡片点击缩略图后打开的 viewport 填满单图遮罩。Escape / 遮罩点击 / 关闭按钮均可关闭;焦点被圈在预览内。

## G

**Galleries**
项目内对图集集合的命名(见 `build-time-index.ts` 的 `GALLERIES` 常量)。

**Glass (玻璃效果)**
以 `backdrop-filter: blur(...)` 实现的半透明叠层。本项目仅在磨砂导航、热力图 tooltip、最近更新 magnifier 等少量位置使用,不用作全局风格。

**Glossary (本文档)**
跨文档共享术语的索引。任何在 ADR / HOMEPAGE-ARCHITECTURE / ARCHITECTURE 中使用的项目专有术语,都应在本表中给出定义。

## H

**Heatmap (热力图)**
主页上 24 列 × 1 行的活动密度图,5 个强度等级,SSG 期从内容条目按 ISO 周聚合生成。

**Hero**
主页第一屏的视觉区域,由「肖像栏 + 身份 / 引言 / 通道栏」无缝双栏构成。

## I

**Icon (图标)**
本项目不使用图标字体或第三方图标包。Hero 的 Bilibili CTA、AppBar 的主题切换、GalleryGrid 的占位 icon、热力图 tooltip 等所有图标都是内联 SVG。

**In scope / out of scope (范围内 / 范围外)**
ADR / HOMEPAGE-ARCHITECTURE 中的「本 ADR 不做什么」「本 spec 不实现什么」段落,用于防止 scope creep。

## K

**Kebab-case**
文件名的全小写、连字符分隔风格。`AGENTS.md §9.3` 与 `§3` 已有约定;`listen/*.json` 同样遵守。

## L

**Lazy media (懒加载媒体)**
本项目所有非首屏图像使用 `loading="lazy"` + `decoding="async"`;首屏图像用 `loading="eager"` + `fetchpriority="high"`。

**Listen (听见)**
四通道之一,内容类型为音乐作品 / 专辑清单。schema 详见 ADR §2.20 与 HOMEPAGE-ARCHITECTURE §9。

**Liquid-glass tooltip (液态玻璃 tooltip)**
热力图单元 hover / focus 时显示的玻璃质感浮层。在非减弱动画下跟随指针;减弱动画下固定在单元下方偏移处。

## M

**Magnifier preview (放大镜预览)**
最近更新行 hover / focus 时显示的约 360 × 220px 浮层,复用对应详情页的真实渲染内容,并随鼠标在条目上横向扫动。

**Mutual exclusion (互斥)**
构建期索引去重的策略:同一 slug 在多个通道的最近更新列表中只出现一次,但在每个通道的索引页都出现。

## N

**Navigation (导航)**
顶部固定磨砂条。本项目的导航不含品牌按钮、不含 Bilibili 按钮,只含四通道链接 + 主题切换。

**No third-party (不引第三方)**
本项目的硬约束:无远端字体、无图标字体、无第三方播放器、无统计、无分享脚本、无 iframe。详见 `AGENTS.md §0` 与 `§9.5`。

## O

**Open dependency (未解决的实现依赖)**
实现某项决策所必需的外部输入(资产 URL、真值、决定),由所有者或上游决策提供。本 ADR 在 §5 列出。

## P

**Pending asset (占位资产)**
文档 / 实现中尚未到位、由所有者提供的资产(肖像图)。Bilibili URL 已由所有者提供,不是待定资产。占位阶段显示中性占位块,绝不臆造具体内容。

**Portrait hero (肖像 hero)**
Hero 区域由创作者肖像驱动的部分。资产路径占位:`apps/web/public/images/home/portrait-hero.<ext>`。

## Q

**Quote (引言)**
Hero 身份栏内的双语引言:中文主、英文次;中文 display,英文斜体 body;共享同一引言容器。

## R

**Reduced motion (减弱动画)**
`@media (prefers-reduced-motion: reduce)` 媒介查询。本项目所有装饰性动画在该查询下退化为静态或全部跳过。

**Reference site (参考站点)**
https://blog.fqzlr.top/。仅在「可迁移设计原则」层面被研究:创作者优先身份、定制字体与个性、模块化内容平台、克制的卡片与列表基元。本项目不克隆其具体版式。

**Routing (路由)**
本项目使用 vue-router + vite-ssg,SSG 期预渲染所有静态路由。`/posts/:slug` 由现有构建期索引派生; `/gallery`、`/projects`、`/listen` 采用索引页与预览层,不额外承诺详情路由。

## S

**Seamless two-column hero (无缝双栏 hero)**
Hero 由「身份 / 引言 / 通道栏 + 肖像栏」两列构成。身份栏在左,肖像栏在右;两列共享同一背景,无边框 / 无分隔 / 无内沟槽,通过 ambient gradient 让交界看起来连续。

**SSG (Static Site Generation)**
静态站点生成。本项目使用 vite-ssg 在构建期把所有路由预渲染成 HTML 文件,媒体懒加载。

## T

**Test content (测试内容)**
开发期占位内容(如 `hello-world.md`)。本次设计验收前保留,验收后由所有者删除并替换为正式内容,不在本次设计阶段引入自动过滤策略。

**Transferable principle (可迁移原则)**
从参考站点提炼的、不绑定具体版式的设计教训。本项目采用的四条:创作者优先身份、定制字体与个性、模块化内容平台、克制的卡片与列表基元。

**Two-column hero**
见 Seamless two-column hero。

## U

**Unit (单元)**
本项目的迭代单位。详见 `AGENTS.md §1` 与 `ARCHITECTURE.md §1`。

**Unresolved implementation dependency (未解决的实现依赖)**
见 Open dependency。

## V

**Variant (变体)**
AGENTS.md §4 定义的多皮肤组件 prop。本项目主页所用的卡片 / 列表 / 网格组件继续遵守该约定;不另立新约定。

**Vertical rhythm (垂直节奏)**
字号、行高、外边距之间的视觉一致性。本项目所有新组件消费既有 `--theme-*` token,不引入新阶梯。

## W

**Wordmark (品牌词标)**
「AMU LIVE STYLE」作为品牌标记的呈现:使用字体设计方案形成独特字形,亮 / 暗双主题下使用主色 token。
