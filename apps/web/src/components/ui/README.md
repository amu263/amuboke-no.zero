# components/ui — UI 基件库

> 单元 5 目标：新页面只用 `components/ui` + Vuetify 即可出风格。  
> AGENTS.md §1 单元 5 跑通条件。

## 设计原则

1. **极客风** — 等宽字体、单色系、边框、scrim 背景、光效点缀
2. **主题双稳** — 所有颜色走 `--theme-*` CSS 变量，暗/亮自动适配
3. **零第三方依赖** — 不引 icon font，不引 emoji，纯内联 SVG
4. **可组合** — 每个组件职责单一，接受 `class` / `style` / `$attrs`

## 组件清单

| 组件 | 说明 | 关键 CSS token |
|------|------|----------------|
| `GlowButton` | 发光按钮（primary/secondary/ghost） | `--theme-primary` |
| `TerminalCard` | 终端风格卡片（顶栏 + prompt） | `--theme-scrim` |
| `MonoChip` | 等宽标签 chip | `--theme-font-mono` |
| `StatusBadge` | 状态徽章（active/archived/wip/deprecated） | `--theme-success` |
| `SectionHeader` | 区域标题 + 装饰渐变线 | `--theme-primary` → `--theme-accent` |
| `DividerDecorate` | 装饰分割线（带可选标签） | `--theme-border` |
| `AvatarWithFallback` | 头像（网络失败 → 首字母 fallback） | `--theme-primary` |
| `GlitchText` | 故障艺术文字动画 | `--theme-error` / `--theme-primary` |
| `TickerText` | 滚动字幕（基于 requestAnimationFrame） | `--theme-font-mono` |
| `CodeBlock` | 代码块（彩虹 conic-gradient + 玻璃） | `--theme-scrim-strong` |
| `InlineCode` | 行内代码 | `--theme-accent` |
| `IconWrapper` | 图标包装器（内联 SVG） | `--theme-primary` |
| `MetaLine` | 元数据行（date + tags + reading-time） | `--theme-font-mono` |

## 按钮使用规范

> AGENTS.md §5 #8

- **主强调按钮**：`variant="flat"` 或 `variant="elevated"` → 用 `GlowButton variant="primary"`
- **次强调按钮**：`variant="tonal"`（半透明底、无边框）→ `GlowButton variant="secondary"`
- **低强调按钮**：`variant="text"` → `GlowButton variant="ghost"`

```vue
<!-- 主强调 -->
<GlowButton variant="primary">部署</GlowButton>

<!-- 次强调 -->
<GlowButton variant="secondary">取消</GlowButton>

<!-- 低强调 -->
<GlowButton variant="ghost">了解更多</GlowButton>
```

## 组合示例

```vue
<script setup>
import { GlowButton, TerminalCard, MonoChip, StatusBadge, SectionHeader, MetaLine } from '@/components/ui'
import { IconWrapper } from '@/components/ui'
</script>

<template>
  <SectionHeader label="PROJECTS" title="我的项目" />

  <TerminalCard title="hello.sh" prompt="$">
    <p>构建状态：<StatusBadge status="active">进行中</StatusBadge></p>
    <p><MonoChip>#Vue</MonoChip> <MonoChip>#TypeScript</MonoChip></p>
    <MetaLine :date="project.date" :tags="project.tech" :reading-time="5" />
  </TerminalCard>

  <GlowButton variant="primary" href="https://github.com">查看源码</GlowButton>
</template>
```

## 与 Vuetify 配合

`components/ui` 组件**只做风格**，Vuetify 做**布局/网格/弹窗**。

```vue
<template>
  <v-container>
    <v-row>
      <v-col v-for="p in projects" :key="p.slug" cols="12" md="6">
        <!-- UI 组件负责极客风视觉 -->
        <TerminalCard :title="p.name">
          <p>{{ p.summary }}</p>
          <StatusBadge :status="p.status" />
        </TerminalCard>
      </v-col>
    </v-row>
  </v-container>
</template>
```

## CSS 层序

所有组件样式在 `@layer components` 内（由 `base.css` 的 `@layer` 声明顺序保证 preflight → vuetify → base → **components** → utilities）。

组件**不**在 `@layer utilities` 声明样式，以避免覆盖 Vuetify 组件样式。

## AGENTS.md §5 陷阱清单（UI 组件相关）

- **#8**: 按钮边框色在暗色下失控 → 主强调用 `flat`/`elevated`，次强调用 `tonal`，低强调用 `text`；本库已按此规范实现 GlowButton
- **#22**: `<v-icon>` 默认空 → 本库统一用内联 SVG（IconWrapper），零运行时依赖
- **#23**: CJK 混排断行 → MetaLine / MonoChip 等文本组件已用 `word-break: keep-all` / `line-break: strict`

---

> 上次更新：单元 5 实现
