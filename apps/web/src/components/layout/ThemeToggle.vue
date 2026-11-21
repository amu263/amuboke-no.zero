<script setup lang="ts">
// 右上角三主题切换：经典档案 / 新艾利都 / 提瓦特。
// 按钮几何固定（与另两个主题一致），几何中心就是圆形扩散圆心；
// 具体路由映射、payload 和导航见 composables/useThemeSwitch.ts。
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { prefetchTheme, switchTheme, type ThemeId } from '@/composables/useThemeSwitch'

const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const open = ref(false)

const themes: Array<{ id: ThemeId; cn: string; en: string }> = [
  { id: 'classic', cn: '经典档案', en: 'CLASSIC' },
  { id: 'zzz', cn: '新艾利都', en: 'ZZZ' },
  { id: 'genshin', cn: '提瓦特', en: 'TEYVAT' }
]

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  open.value = false
}

function choose(target: ThemeId): void {
  close()
  if (target === 'classic' || !button.value) return
  switchTheme(target, button.value)
}

function onIntent(): void {
  prefetchTheme('zzz')
  prefetchTheme('genshin')
}

function onDocumentPointer(event: PointerEvent): void {
  if (!open.value) return
  if (root.value && !root.value.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) {
    close()
    button.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="theme-picker" :class="{ 'is-open': open }">
    <button
      ref="button"
      type="button"
      class="theme-picker__trigger"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
      aria-label="切换主题：经典档案 / 新艾利都 / 提瓦特"
      title="切换主题"
      @click="toggle"
      @pointerenter="onIntent"
      @pointerdown="onIntent"
      @touchstart.passive="onIntent"
      @focus="onIntent"
    >
      <span class="theme-picker__dots" aria-hidden="true">
        <i class="theme-dot theme-dot--classic is-current"></i>
        <i class="theme-dot theme-dot--zzz"></i>
        <i class="theme-dot theme-dot--genshin"></i>
      </span>
      <span class="theme-picker__label">主题</span>
      <svg class="theme-picker__chev" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <div v-if="open" class="theme-picker__menu" role="menu" aria-label="选择主题">
      <button
        v-for="theme in themes"
        :key="theme.id"
        type="button"
        role="menuitem"
        class="theme-picker__option"
        :class="{ 'is-active': theme.id === 'classic' }"
        @click="choose(theme.id)"
        @pointerenter="theme.id !== 'classic' && prefetchTheme(theme.id)"
        @focus="theme.id !== 'classic' && prefetchTheme(theme.id)"
      >
        <i class="theme-dot" :class="`theme-dot--${theme.id}`" aria-hidden="true"></i>
        <span class="theme-picker__cn">{{ theme.cn }}</span>
        <span class="theme-picker__en">{{ theme.en }}</span>
        <span v-if="theme.id === 'classic'" class="theme-picker__now">当前</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-picker {
  position: fixed;
  top: 10px;
  right: 16px;
  z-index: 1001;
  font-family: var(--theme-font-mono);
}
.theme-picker__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 116px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  font-family: var(--theme-font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  line-height: 1;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
}
.theme-picker__trigger:hover,
.theme-picker.is-open .theme-picker__trigger {
  color: var(--theme-primary);
  border-color: color-mix(in srgb, var(--theme-primary) 55%, transparent);
  background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
}
.theme-picker__dots {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.theme-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid currentColor;
  background: transparent;
}
.theme-dot--classic {
  color: #1f7a6b;
}
.theme-dot--zzz {
  color: #e23a1e;
}
.theme-dot--genshin {
  color: #a8895a;
}
.theme-dot.is-current,
.theme-picker__option.is-active .theme-dot {
  background: currentColor;
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 18%, transparent);
}
.theme-picker__chev {
  width: 12px;
  height: 12px;
  transition: transform 160ms ease;
}
.theme-picker.is-open .theme-picker__chev {
  transform: rotate(180deg);
}
.theme-picker__menu {
  position: absolute;
  top: 42px;
  right: 0;
  width: 218px;
  padding: 6px;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface);
  box-shadow: var(--theme-shadow-lg);
  z-index: 1002;
}
.theme-picker__option {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--theme-on-surface);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.theme-picker__option:hover,
.theme-picker__option:focus-visible {
  background: color-mix(in srgb, var(--theme-primary) 9%, transparent);
  outline: none;
}
.theme-picker__option.is-active {
  background: color-mix(in srgb, var(--theme-primary) 12%, transparent);
}
.theme-picker__cn {
  font-family: var(--theme-font-body);
  font-size: 13px;
  letter-spacing: 0.04em;
}
.theme-picker__en {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--theme-on-surface-muted, var(--theme-on-surface));
  opacity: 0.55;
}
.theme-picker__now {
  grid-column: 3;
  font-size: 9px;
  color: var(--theme-primary);
}
.theme-picker__option .theme-dot {
  grid-row: 1 / span 2;
}
.theme-picker__option .theme-picker__cn {
  grid-column: 2;
}
.theme-picker__option .theme-picker__en {
  grid-column: 2;
}
@media (max-width: 720px) {
  .theme-picker {
    top: 8px;
    right: 8px;
  }
  .theme-picker__trigger {
    width: 44px;
    height: 34px;
    padding: 0;
    gap: 4px;
  }
  .theme-picker__label,
  .theme-picker__chev {
    display: none;
  }
  .theme-picker__menu {
    top: 40px;
    width: min(218px, calc(100vw - 16px));
  }
}
</style>
