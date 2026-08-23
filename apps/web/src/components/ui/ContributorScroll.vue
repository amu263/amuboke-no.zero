<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

export interface Contributor {
  name: string
  url?: string
}

const props = withDefaults(defineProps<{
  contributors?: Contributor[]
  rows?: number
  speed?: number  // base speed in seconds for one complete scroll
  /** SVG 彗星绕一圈的秒数 */
  cometSpeed?: number
}>(), {
  contributors: () => [
    { name: 'DeepSeek Harness' },
    { name: 'OpenCode' },
    { name: 'Codex' },
    { name: 'MiniMax M2.7' },
    { name: 'ChatGPT 5.6' },
    { name: 'DeepSeek v4 Flash' },
    { name: 'Grok 4.5' },
  ],
  rows: 3,
  speed: 18,
  cometSpeed: 6,
})

// ─────────────────────────────────────────────────────────────────────
// 边框彩虹彗星: 跟踪 .contributor-scroll__frame 的实际尺寸 + 圆角
// 生成 SVG rounded-rect 路径,用 stroke-dasharray + stroke-dashoffset
// 动画实现"沿外边框顺时针旋转的彗星流光"。
// ─────────────────────────────────────────────────────────────────────
const frameSize = ref({ w: 600, h: 120 })
const FRAME_BORDER_RADIUS = 8 // 与 CSS .contributor-scroll__frame border-radius 一致

let ro: ResizeObserver | null = null
const frameEl = ref<HTMLElement | null>(null)

onMounted(() => {
  // .contributor-scroll__frame 在 template 里第二个子元素
  const el = (frameEl.value ?? document.querySelector('.contributor-scroll__frame')) as HTMLElement | null
  if (!el) return
  frameEl.value = el
  const measure = () => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      frameSize.value = { w: Math.round(r.width), h: Math.round(r.height) }
    }
  }
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(el)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})

/**
 * 沿圆角矩形外边框的 SVG path
 * 起点在左上角圆角终点 (radius, 0)，顺时针走一圈回到起点。
 * path 总长 = 2(w + h) - 8r + 2πr ≈ perimeter
 */
const cometPath = computed(() => {
  const w = frameSize.value.w
  const h = frameSize.value.h
  const r = FRAME_BORDER_RADIUS
  // 不让 r > w/2 或 h/2 引起路径异常
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  if (w === 0 || h === 0) return ''
  return [
    `M ${rr} 0`,
    `H ${w - rr}`,
    `A ${rr} ${rr} 0 0 1 ${w} ${rr}`,
    `V ${h - rr}`,
    `A ${rr} ${rr} 0 0 1 ${w - rr} ${h}`,
    `H ${rr}`,
    `A ${rr} ${rr} 0 0 1 0 ${h - rr}`,
    `V ${rr}`,
    `A ${rr} ${rr} 0 0 1 ${rr} 0`,
    'Z',
  ].join(' ')
})

/**
 * 彗星 dasharray (使用 SVG pathLength="1" 归一化):
 *   - pathLength="1" 让所有 stroke-* 长度都以 path 总长 = 1 为单位
 *   - dasharray "tail gap" → 拖尾 = tail, gap = 1 - tail (留出彗星之间空白)
 *   - dashoffset 0 → -1 永远对应完整一圈 (与实际像素长度无关)
 */
const cometTailRatio = 0.35
const cometDashArray = `${cometTailRatio} ${1 - cometTailRatio + 0.05}` // 0.35 + 0.70 ≈ 1.05 (留出彗星之间空白)

const cometDashOffsetStart = 0

// Distribute contributors into rows for staggered effect
const scrollRows = computed(() => {
  const result: Contributor[][] = []
  const contributors = [...props.contributors, ...props.contributors] // duplicate for seamless loop

  for (let i = 0; i < props.rows; i++) {
    result.push(contributors.slice(i * Math.ceil(contributors.length / props.rows), (i + 1) * Math.ceil(contributors.length / props.rows)))
  }
  return result
})

// Animation timing for each row (staggered)
const rowStyles = computed(() => {
  return scrollRows.value.map((_, index) => {
    const duration = props.speed + index * 4  // each row has different duration
    const delay = -(index * (props.speed / props.rows))  // negative delay for staggered start
    return {
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    }
  })
})

function getItemStyle(rowIndex: number, itemIndex: number) {
  const baseDelay = rowStyles.value[rowIndex].animationDelay
  const itemDelay = -(itemIndex * 0.8)  // each item slightly offset
  return {
    animationDelay: `calc(${baseDelay} + ${itemDelay}s)`,
  }
}
</script>

<template>
  <div class="contributor-scroll">
    <!-- Rainbow comet flow border frame -->
    <div class="contributor-scroll__frame">
      <!-- 调整: SVG 实现的「沿外边框顺时针旋转的彩虹彗星流光」 -->
      <!-- 原理: SVG rect 给外框 + linearGradient 作为彗星拖尾颜色 -->
      <!--       animateMotion 沿 rect 路径旋转,SVG stroke 是彗星本体 -->
      <svg
        class="contributor-scroll__border-comet"
        :viewBox="`0 0 ${frameSize.w} ${frameSize.h}`"
        :width="frameSize.w"
        :height="frameSize.h"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <!--
            彩虹彗星拖尾渐变:
            - 头部(右端)亮白/亮金 → 中段彩虹(红橙黄绿青蓝紫)→ 尾部(左端)透明
            - gradient 是从「彗星尾部」到「彗星亮头」的方向 (offset 0% = tail, 100% = head)
            - stroke-dasharray "tail gap" 让 dasharray 一段 = 一颗彗星,
              这段 stroke 渲染时按 path 方向涂渐变,所以 path 起点(tail)=渐变 0% 端,path 终点(head)=渐变 100% 端
            - 由于 stroke 沿 path 方向连续涂色,彗星亮头在 dasharray 的「末端」,呈现"头白尾彩"的彗星形态
          -->
          <linearGradient id="cometGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stop-color="#a855f7" stop-opacity="0" />
            <stop offset="15%"  stop-color="#3b82f6" stop-opacity="0.4" />
            <stop offset="30%"  stop-color="#06b6d4" stop-opacity="0.7" />
            <stop offset="45%"  stop-color="#22c55e" stop-opacity="0.85" />
            <stop offset="60%"  stop-color="#eab308" stop-opacity="0.95" />
            <stop offset="75%"  stop-color="#f97316" stop-opacity="1" />
            <stop offset="88%"  stop-color="#ef4444" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="1" />
          </linearGradient>
        </defs>
        <!-- 1. 边框路径(静态, 琥珀色细描边作为「基础边框」 — 暗/亮双稳) -->
        <path
          :d="cometPath"
          fill="none"
          stroke="var(--theme-primary)"
          stroke-width="1"
          pathLength="1"
          stroke-opacity="0.4"
        />
        <!-- 2. 彗星本体(白光亮线, 沿同一路径顺时针旋转) -->
        <path
          :d="cometPath"
          fill="none"
          stroke="url(#cometGradient)"
          stroke-width="2.5"
          stroke-linecap="round"
          pathLength="1"
          :stroke-dasharray="cometDashArray"
          :style="`stroke-dashoffset: ${cometDashOffsetStart}; animation-duration: ${cometSpeed}s;`"
          class="contributor-scroll__comet-path"
        />
      </svg>
      <div class="contributor-scroll__content">
        <!-- Header -->
        <div class="contributor-scroll__header">
          <span class="contributor-scroll__label">// CONTRIBUTORS</span>
          <span class="contributor-scroll__count">{{ contributors.length }} AGENTS</span>
        </div>
        
        <!-- Scrolling rows -->
        <div class="contributor-scroll__tracks">
          <div
            v-for="(row, rowIndex) in scrollRows"
            :key="rowIndex"
            class="contributor-scroll__track"
            :style="rowStyles[rowIndex]"
          >
            <div class="contributor-scroll__row">
              <template v-for="(item, itemIndex) in row" :key="itemIndex">
                <span
                  class="contributor-scroll__item"
                  :style="getItemStyle(rowIndex, itemIndex)"
                >
                  <template v-if="item.url">
                    <a :href="item.url" target="_blank" rel="noopener" class="contributor-scroll__link">
                      {{ item.name }}
                    </a>
                  </template>
                  <template v-else>
                    <span class="contributor-scroll__name">{{ item.name }}</span>
                  </template>
                  <span class="contributor-scroll__separator" aria-hidden="true">◆</span>
                </span>
              </template>
              <!-- Duplicate set for seamless loop -->
              <template v-for="(item, itemIndex) in row" :key="'dup-' + itemIndex">
                <span
                  class="contributor-scroll__item"
                  :style="getItemStyle(rowIndex, itemIndex + row.length)"
                >
                  <template v-if="item.url">
                    <a :href="item.url" target="_blank" rel="noopener" class="contributor-scroll__link">
                      {{ item.name }}
                    </a>
                  </template>
                  <template v-else>
                    <span class="contributor-scroll__name">{{ item.name }}</span>
                  </template>
                  <span class="contributor-scroll__separator" aria-hidden="true">◆</span>
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contributor-scroll {
  width: 100%;
  overflow: hidden;
}

/* ── Frame with animated rainbow border ─────────────────────── */
.contributor-scroll__frame {
  position: relative;
  /* 边框由 SVG 彗星画, 这里不再用 border (否则会盖住彗星) */
  border-radius: var(--theme-radius-md);
  padding: 0;
  overflow: hidden;
  isolation: isolate;
}

/* SVG 彩虹彗星外框 */
.contributor-scroll__border-comet {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}

/* 彗星本体: 用 stroke-dasharray + stroke-dashoffset 动画
   - dasharray = 拖尾长度 + gap (template 已经绑定)
   - dashoffset 从 0 → -pathLength 让彗星沿 path 顺时针走一圈
   - 视觉上像一颗亮头 + 长尾巴沿外边框跑 */
.contributor-scroll__comet-path {
  animation-name: comet-orbit;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  /* 暗色背景: 暖色光晕衬托彩虹 */
  filter: drop-shadow(0 0 3px rgba(255, 220, 140, 0.8))
          drop-shadow(0 0 8px rgba(255, 180, 80, 0.4));
}

/* 亮色背景: 深棕琥珀色光晕 — 让彩虹彗星在浅底色上仍能看清 */
.v-theme--light .contributor-scroll__comet-path {
  filter: drop-shadow(0 0 3px rgba(120, 80, 30, 0.6))
          drop-shadow(0 0 8px rgba(160, 110, 50, 0.4));
}

@keyframes comet-orbit {
  from { stroke-dashoffset: 0; }
  /* pathLength="1" 归一化: 0 → -1 永远对应完整一圈 */
  to   { stroke-dashoffset: -1; }
}

/* ── Content layer ─────────────────────────────────────────── */
/* 调整二: 透明底，让 grid-bg 网格从下方透出来 */
.contributor-scroll__content {
  position: relative;
  z-index: 1;
  background: transparent;
  border-radius: calc(var(--theme-radius-md) - 1px);
  padding: 0.75rem 1rem;
}

/* ── Header ───────────────────────────────────────────────── */
.contributor-scroll__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--theme-border);
}

.contributor-scroll__label {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-secondary);
  opacity: 0.7;
}

.contributor-scroll__count {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  font-weight: 600;
}

/* ── Scroll tracks ────────────────────────────────────────── */
.contributor-scroll__tracks {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.contributor-scroll__track {
  overflow: hidden;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 5%,
    black 95%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 5%,
    black 95%,
    transparent 100%
  );
}

.contributor-scroll__row {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  animation: scroll-horizontal linear infinite;
}

.contributor-scroll__track:nth-child(1) .contributor-scroll__row {
  animation-duration: v-bind('rowStyles[0]?.animationDuration');
  animation-delay: v-bind('rowStyles[0]?.animationDelay');
}

.contributor-scroll__track:nth-child(2) .contributor-scroll__row {
  animation-duration: v-bind('rowStyles[1]?.animationDuration');
  animation-delay: v-bind('rowStyles[1]?.animationDelay');
}

.contributor-scroll__track:nth-child(3) .contributor-scroll__row {
  animation-duration: v-bind('rowStyles[2]?.animationDuration');
  animation-delay: v-bind('rowStyles[2]?.animationDelay');
}

@keyframes scroll-horizontal {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* ── Individual items ─────────────────────────────────────── */
.contributor-scroll__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.15rem 0;
}

.contributor-scroll__name,
.contributor-scroll__link {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-on-surface);
  text-decoration: none;
  transition: color 150ms ease;
}

.contributor-scroll__link:hover {
  color: var(--theme-primary);
}

.contributor-scroll__separator {
  font-size: 0.5rem;
  color: var(--theme-primary);
  opacity: 0.5;
  margin: 0 0.75rem;
}
</style>
