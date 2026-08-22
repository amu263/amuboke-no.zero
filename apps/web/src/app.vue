<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AppBar from '@/components/layout/AppBar.vue'
import SearchModal from '@/components/search/SearchModal.vue'

const { syncRootClass } = useTheme()

const searchOpen = ref(false)
function openSearch() {
  searchOpen.value = true
}
</script>

<template>
  <!-- AGENTS.md §5 #18: tokenized real DOM grid layer must sit behind Vuetify.
       Must be BEFORE <v-app> in template order (Vue template order = DOM order). -->
  <div class="grid-bg" aria-hidden="true"></div>
  <v-app>
    <AppBar @open-search="openSearch" />
    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
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
  .v-application {
    position: relative;
    z-index: 1;
    background: transparent !important;
  }
}

/* ── Page Transition — 极客风快速淡入淡出 ────────────────────────── */
.page-fade-enter-active {
  animation: page-fade-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.page-fade-leave-active {
  animation: page-fade-out 120ms cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes page-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes page-fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-3px);
  }
}
</style>
