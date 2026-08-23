<script setup lang="ts">
/**
 * GiscusComments.vue — GitHub Discussions 评论系统
 * 
 * 使用 giscus (@giscus/vue) 渲染评论区，样式与博客极客风保持一致。
 * 配置从 src/config/giscus.ts 读取（只需要改那一个文件）。
 * 
 * giscus 官网: https://giscus.app/zh-CN
 * 配置生成: https://giscus.app/zh-CN
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { giscusConfig } from '@/config/giscus'

const { theme } = useTheme()
const containerRef = ref<HTMLDivElement | null>(null)

// 计算当前 giscus 主题名称
// giscus 内置主题：dark=transparent_dark, light=noborder_light（无边框浅色）
function getThemeUrl(isDark: boolean): string {
  return isDark ? 'transparent_dark' : 'noborder_light'
}

// 注入 giscus script 并初始化
function loadGiscus() {
  if (!containerRef.value) return

  // 清空已有内容
  containerRef.value.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', giscusConfig.repo)
  script.setAttribute('data-repo-id', giscusConfig.repoId)
  script.setAttribute('data-category', giscusConfig.category)
  script.setAttribute('data-category-id', giscusConfig.categoryId)
  script.setAttribute('data-mapping', giscusConfig.mapping)
  script.setAttribute('data-strict', giscusConfig.strict)
  script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled)
  script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata)
  script.setAttribute('data-input-position', giscusConfig.inputPosition)
  script.setAttribute('data-theme', 'transparent_dark')
  script.setAttribute('data-lang', giscusConfig.lang)
  script.setAttribute('data-loading', 'lazy')
  script.crossOrigin = 'anonymous'
  script.async = true

  containerRef.value.appendChild(script)
}

// 切换 giscus 主题（不重新加载 iframe，只换 CSS）
function updateGiscusTheme(isDark: boolean) {
  const iframe = containerRef.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  if (!iframe?.contentWindow) return
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme: getThemeUrl(isDark) } } },
    'https://giscus.app'
  )
}

// 监听来自 giscus 的消息
function handleMessage(event: MessageEvent) {
  if (event.origin !== 'https://giscus.app') return
  const data = event.data
  if (typeof data !== 'object' || !data.giscus) return
  // 可在这里处理评论数更新等事件
}

onMounted(() => {
  loadGiscus()
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

// 监听主题切换，同步更新 giscus 主题
watch(() => theme.value, (newTheme) => {
  updateGiscusTheme(newTheme === 'dark')
})
</script>

<template>
  <section class="giscus-wrapper">
    <h2 class="giscus-wrapper__title">
      <svg class="giscus-wrapper__icon" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-4 4v-4H4a2 2 0 0 1-2-2V5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
      评论
    </h2>
    <div ref="containerRef" class="giscus-wrapper__container" />
  </section>
</template>

<style scoped>
.giscus-wrapper {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--theme-border, currentColor);
}
.giscus-wrapper__title {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-lg);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.giscus-wrapper__icon {
  width: 1.25em;
  height: 1.25em;
  color: var(--theme-accent);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.giscus-wrapper__container {
  /* giscus iframe 容器 */
  min-height: 200px;
}
</style>
