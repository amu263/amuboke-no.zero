<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigationLoading } from '@/router-loading'
import AppBar from '@/components/layout/AppBar.vue'
import SearchModal from '@/components/search/SearchModal.vue'

const searchOpen = ref(false)
const router = useRouter()
const { status: navigationStatus } = useNavigationLoading()

// The static #app-loading element in index.html owns the pre-hydration pixels.
// Remove it only after the initial route and the first hydrated DOM are ready.
onMounted(async () => {
  await router.isReady()
  await nextTick()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await new Promise<void>((resolve) => window.setTimeout(resolve, reducedMotion ? 120 : 2500))
  const overlay = document.getElementById('app-loading')
  if (!overlay) return
  if (reducedMotion) {
    document.documentElement.classList.remove('booting')
    overlay.remove()
    return
  }
  // Remove the opaque curtain in one step; no two animation layers overlap.
  document.documentElement.classList.remove('booting')
  overlay.remove()
})
function openSearch() {
  searchOpen.value = true
}
</script>

<template>
  <!-- AGENTS.md §5 #18: tokenized real DOM grid layer must sit behind Vuetify.
       Must be BEFORE <v-app> in template order (Vue template order = DOM order). -->
  <div class="grid-bg" aria-hidden="true"></div>
  <v-app :aria-busy="navigationStatus === 'loading'">
    <div
      v-if="navigationStatus === 'loading'"
      class="route-loading"
      role="status"
      aria-live="polite"
      aria-label="页面加载中"
    >
      <span class="route-loading__mark" aria-hidden="true"></span>
      <span>加载中…</span>
    </div>
    <AppBar @open-search="openSearch" />
    <v-main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </v-main>
    <SearchModal v-model="searchOpen" />
  </v-app>
</template>

<style>
/* AGENTS.md §5 #18 / docs/grid-bg-methodology.md §3.1:
   .grid-bg 在 @layer utilities（base.css 顶层 layer 序的最后一层），
   !important 赢过 UnoCSS reset。style 不带 scoped（Vue Fragment 静态缓存
   会让第一个子节点缺 data-v-xxx，scoped 选择器漏命中）。 */
@layer utilities {
  .grid-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    /* grid 自身是不透明深色背景（body 背景已改为透明）——
       这样即使页面内容有半透明背景，网格线依然清晰可见 */
    background-color: var(--theme-background) !important;
    background-image:
      repeating-linear-gradient(
        to right,
        var(--theme-grid) 0px,
        var(--theme-grid) 2px,
        transparent 2px,
        transparent 28px
      ),
      repeating-linear-gradient(
        to bottom,
        var(--theme-grid) 0px,
        var(--theme-grid) 2px,
        transparent 2px,
        transparent 28px
      ) !important;
    background-size: 28px 28px !important;
    background-repeat: repeat !important;
  }
}

@layer base {
  /* Cloudflare Pages / SSG 首屏兜底：显式提供 Vuetify 所需的 RGB 主题变量，
     避免运行时主题样式注入延迟时退回默认白黑色。 */
  .v-application.v-theme--light {
    --v-theme-background: 240, 242, 245;
    --v-theme-surface: 250, 251, 253;
    --v-theme-surface-variant: 232, 235, 240;
    --v-theme-primary: 47, 181, 160;
    --v-theme-secondary: 107, 114, 128;
    --v-theme-accent: 47, 181, 160;
    --v-theme-on-background: 26, 29, 36;
    --v-theme-on-surface: 26, 29, 36;
    --v-theme-error: 217, 69, 69;
    --v-theme-info: 59, 110, 245;
    --v-theme-success: 47, 181, 160;
    --v-theme-warning: 212, 146, 10;
  }

  .v-application.v-theme--dark {
    --v-theme-background: 9, 11, 14;
    --v-theme-surface: 17, 21, 32;
    --v-theme-surface-variant: 24, 29, 40;
    --v-theme-primary: 232, 168, 62;
    --v-theme-secondary: 122, 133, 153;
    --v-theme-accent: 61, 217, 196;
    --v-theme-on-background: 212, 216, 224;
    --v-theme-on-surface: 212, 216, 224;
    --v-theme-error: 255, 107, 107;
    --v-theme-info: 122, 162, 255;
    --v-theme-success: 61, 217, 196;
    --v-theme-warning: 240, 192, 96;
  }

  .v-application {
    position: relative;
    z-index: 1;
    background: transparent !important;
  }
}

/* Route navigation owns the visual hand-off; this layer never covers the grid. */
.route-loading {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  color: var(--theme-on-background);
  background: var(--theme-background);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  letter-spacing: 0.04em;
  pointer-events: all;
}
.route-loading__mark {
  width: 2.25rem;
  height: 2.25rem;
  margin: 0 auto;
  border: 2px solid var(--theme-border);
  border-top-color: var(--theme-primary);
  border-radius: 50%;
  animation: route-loading-spin 700ms linear infinite;
}
@keyframes route-loading-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .route-loading__mark { animation: none; }
}
</style>
