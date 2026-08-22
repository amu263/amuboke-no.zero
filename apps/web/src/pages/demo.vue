<script setup lang="ts">
// Demo page for Unit 5 UI components
// This page showcases all components in components/ui/
import {
  GlowButton,
  TerminalCard,
  MonoChip,
  StatusBadge,
  SectionHeader,
  DividerDecorate,
  AvatarWithFallback,
  GlitchText,
  TickerText,
  CodeBlock,
  InlineCode,
  IconWrapper,
  MetaLine,
} from '@/components/ui'

const tickerItems = ['构建成功', 'TypeScript 检查通过', 'Vite HMR 就绪', '极客风格组件库']

const sampleTags = ['Vue', 'TypeScript', 'Vite', 'Vuetify', 'SSG']
</script>

<template>
  <v-app>
    <v-main class="demo-page">
      <v-container max-width="900" class="demo-container">

        <!-- Page Header -->
        <header class="demo-header">
          <GlitchText>UI COMPONENTS LAB</GlitchText>
          <p class="demo-subtitle">components/ui + Vuetify = 极客风</p>
        </header>

        <!-- Ticker -->
        <div class="demo-ticker">
          <TickerText :items="tickerItems" :speed="50" />
        </div>

        <DividerDecorate label="SECTION" />

        <!-- Section: Buttons -->
        <SectionHeader label="COMPONENT" title="GlowButton 按钮" />
        
        <TerminalCard title="glow-button-demo.tsx" prompt="$">
          <div class="demo-row">
            <GlowButton variant="primary">主要按钮</GlowButton>
            <GlowButton variant="secondary">次要按钮</GlowButton>
            <GlowButton variant="ghost">幽灵按钮</GlowButton>
            <GlowButton variant="primary" disabled>禁用</GlowButton>
          </div>
          <div class="demo-row">
            <GlowButton variant="primary" size="sm">Small</GlowButton>
            <GlowButton variant="primary" size="md">Medium</GlowButton>
            <GlowButton variant="primary" size="lg">Large</GlowButton>
          </div>
        </TerminalCard>

        <DividerDecorate />

        <!-- Section: Status Badges -->
        <SectionHeader label="COMPONENT" title="StatusBadge 状态徽章" />
        
        <div class="demo-row">
          <StatusBadge status="active">进行中</StatusBadge>
          <StatusBadge status="wip">WIP</StatusBadge>
          <StatusBadge status="archived">已归档</StatusBadge>
          <StatusBadge status="deprecated">已废弃</StatusBadge>
          <StatusBadge status="active" size="sm">Small</StatusBadge>
        </div>

        <DividerDecorate />

        <!-- Section: MonoChip -->
        <SectionHeader label="COMPONENT" title="MonoChip 等宽标签" />
        
        <TerminalCard title="chips.ts" prompt="#">
          <div class="demo-row demo-row--wrap">
            <MonoChip v-for="t in sampleTags" :key="t">{{ t }}</MonoChip>
            <MonoChip accent>#TypeScript</MonoChip>
            <MonoChip>#Rust</MonoChip>
            <MonoChip>#WebGL</MonoChip>
          </div>
        </TerminalCard>

        <DividerDecorate />

        <!-- Section: MetaLine -->
        <SectionHeader label="COMPONENT" title="MetaLine 元数据行" />
        
        <div class="demo-meta">
          <MetaLine 
            date="2026-08-25" 
            :tags="['Vue', 'TypeScript', 'UI']" 
            :reading-time="8" 
          />
        </div>

        <DividerDecorate />

        <!-- Section: Avatar -->
        <SectionHeader label="COMPONENT" title="AvatarWithFallback 头像" />
        
        <div class="demo-row">
          <AvatarWithFallback name="王小极" size="sm" />
          <AvatarWithFallback name="张三丰" size="md" />
          <AvatarWithFallback name="李四维" size="lg" />
          <AvatarWithFallback name="数据不存在" size="md" :src="undefined" />
        </div>

        <DividerDecorate />

        <!-- Section: CodeBlock -->
        <SectionHeader label="COMPONENT" title="CodeBlock 代码块" />
        
        <CodeBlock lang="typescript">
const greeting = (name: string): string => {
  return `Hello, ${name}! 🦊`
}</CodeBlock>

        <DividerDecorate />

        <!-- Section: InlineCode -->
        <SectionHeader label="COMPONENT" title="InlineCode 行内代码" />
        
        <p class="demo-paragraph">
          在 <InlineCode>setup()</InlineCode> 函数中使用 
          <InlineCode>defineProps</InlineCode> 定义组件属性。
          推荐使用 <InlineCode>TypeScript</InlineCode> 获得完整类型提示。
        </p>

        <DividerDecorate />

        <!-- Section: IconWrapper -->
        <SectionHeader label="COMPONENT" title="IconWrapper 图标包装器" />
        
        <div class="demo-row">
          <IconWrapper color="default">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </IconWrapper>
          <IconWrapper color="primary">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </IconWrapper>
          <IconWrapper color="accent">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </IconWrapper>
          <IconWrapper color="error">
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </IconWrapper>
        </div>

        <DividerDecorate />

        <!-- Section: GlitchText + TerminalCard combo -->
        <SectionHeader label="COMBO" title="组合示例：TerminalCard + GlitchText" />
        
        <TerminalCard title="system.log" prompt=">" monochrome>
          <GlitchText>SYSTEM ONLINE</GlitchText>
          <p class="demo-mono">> All services operational</p>
          <p class="demo-mono">> Theme: <span style="color: var(--theme-success)">DARK</span></p>
          <p class="demo-mono">> UI Components: <span style="color: var(--theme-primary)">LOADED</span></p>
        </TerminalCard>

        <DividerDecorate />

        <!-- Section: Dark/Light aware -->
        <SectionHeader label="FEATURE" title="主题双稳演示" />
        
        <div class="demo-theme-demo">
          <div class="demo-theme-box demo-theme-box--light">
            <span class="demo-theme-label">Light Mode</span>
            <GlowButton variant="primary">Primary</GlowButton>
            <StatusBadge status="active">Active</StatusBadge>
            <MonoChip accent>#accent</MonoChip>
          </div>
          <div class="demo-theme-box demo-theme-box--dark">
            <span class="demo-theme-label">Dark Mode</span>
            <GlowButton variant="primary">Primary</GlowButton>
            <StatusBadge status="active">Active</StatusBadge>
            <MonoChip accent>#accent</MonoChip>
          </div>
        </div>

        <footer class="demo-footer">
          <p>AMU LIVE STYLE — 极客风 UI 基件库 · Unit 5</p>
        </footer>

      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: transparent;
  color: var(--theme-on-background);
  padding: var(--theme-spacing-xl) 0;
}

.demo-container {
  display: flex;
  flex-direction: column;
  gap: var(--theme-spacing-sm);
}

.demo-header {
  text-align: center;
  margin-bottom: var(--theme-spacing-lg);
}

.demo-subtitle {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.7;
  margin-top: 0.5rem;
}

.demo-ticker {
  background: transparent;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-md);
  padding: 0.5rem 1rem;
  margin-bottom: var(--theme-spacing-md);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.demo-row--wrap {
  flex-wrap: wrap;
}

.demo-meta {
  padding: var(--theme-spacing-md);
  background: transparent;
  border-radius: var(--theme-radius-md);
  border: 1px solid var(--theme-border);
}

.demo-paragraph {
  line-height: 1.8;
  color: var(--theme-on-surface);
}

.demo-mono {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  margin: 0.25rem 0;
}

.demo-theme-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.demo-theme-box {
  border-radius: var(--theme-radius-lg);
  padding: var(--theme-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  border: 1px solid var(--theme-border);
}

.demo-theme-box--light {
  background: #f6f7f9;
}

.demo-theme-box--dark {
  background: #0d1014;
}

.demo-theme-label {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.6;
  letter-spacing: 0.1em;
}

.demo-footer {
  text-align: center;
  margin-top: var(--theme-spacing-xl);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-secondary);
  opacity: 0.5;
}

@media (max-width: 600px) {
  .demo-theme-demo {
    grid-template-columns: 1fr;
  }
}
</style>
