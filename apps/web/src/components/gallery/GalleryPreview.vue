<script setup lang="ts">
// AGENTS.md §5 #22: <v-icon> 默认空 — 一律用内联 SVG
// AGENTS.md §5 #8: 暗色下 outlined 边框刺眼，关闭按钮走 tonal 风格
// 单元 4 / Todo 4: 单图全屏预览模态框
//   - role="dialog" aria-modal="true"  + 语义化 aria-label
//   - 焦点圈定（关闭按钮初始聚焦 + Tab/Shift+Tab 在模态内循环）
//   - 四种关闭方式：Escape / 点击遮罩 / 点击关闭按钮 / 触发按钮再次触发
//   - 关闭后焦点恢复到打开它的按钮
//   - 模态打开时其它节点 inert，避免 Tab 越界
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { GalleryPhoto } from '@/content/build-time-index'

const props = defineProps<{
  open: boolean
  photo: GalleryPhoto | null
  galleryTitle: string
  triggerId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const dialogRef = ref<HTMLDivElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const imageFailed = ref(false)
const previousActiveElement = ref<HTMLElement | null>(null)
const inertedSiblings = ref<HTMLElement[]>([])

const ariaLabel = computed(
  () => `${props.galleryTitle || '图集'} 图集预览`
)

function focusables(): HTMLElement[] {
  const dialog = dialogRef.value
  if (!dialog) {
    return []
  }
  const selector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  return Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
  )
}

function applyInertToSiblings(): void {
  const root = document.getElementById('app') ?? document.body
  const dialog = dialogRef.value
  const siblings = Array.from(root.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el !== dialog
  )
  inertedSiblings.value = siblings.filter((el) => !el.hasAttribute('inert'))
  inertedSiblings.value.forEach((el) => el.setAttribute('inert', ''))
}

function removeInertFromSiblings(): void {
  inertedSiblings.value.forEach((el) => el.removeAttribute('inert'))
  inertedSiblings.value = []
}

function trapTab(e: KeyboardEvent): void {
  if (e.key !== 'Tab') {
    return
  }
  const items = focusables()
  if (items.length === 0) {
    e.preventDefault()
    closeBtnRef.value?.focus()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement as HTMLElement | null
  const dialog = dialogRef.value
  if (!dialog) {
    return
  }
  if (e.shiftKey) {
    if (active === first || !dialog.contains(active)) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (active === last || !dialog.contains(active)) {
      e.preventDefault()
      first.focus()
    }
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (!props.open) {
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
    return
  }
  trapTab(e)
}

function closePreview(): void {
  emit('close')
}

function onBackdropClick(e: MouseEvent): void {
  // 只有当点击落在 dialog 自身（遮罩），而不是内部内容上时才关闭
  if (e.target === e.currentTarget) {
    closePreview()
  }
}

function onImageError(): void {
  imageFailed.value = true
}

function restoreFocus(): void {
  if (props.triggerId) {
    const trigger = document.getElementById(props.triggerId)
    if (trigger) {
      trigger.focus()
      return
    }
  }
  if (previousActiveElement.value && document.contains(previousActiveElement.value)) {
    previousActiveElement.value.focus()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      imageFailed.value = false
      previousActiveElement.value = (document.activeElement as HTMLElement) ?? null
      await nextTick()
      applyInertToSiblings()
      await nextTick()
      closeBtnRef.value?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      removeInertFromSiblings()
      await nextTick()
      restoreFocus()
    }
  }
)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  removeInertFromSiblings()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="dialogRef"
      class="gallery-preview"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel"
      @click="onBackdropClick"
    >
      <div class="gallery-preview__frame" @click.stop>
        <button
          ref="closeBtnRef"
          type="button"
          class="gallery-preview__close"
          aria-label="关闭预览"
          @click="closePreview"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" focusable="false" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <figure class="gallery-preview__figure">
          <img
            v-if="photo && photo.src && !imageFailed"
            :src="photo.src"
            :alt="photo.alt"
            width="1600"
            height="1067"
            class="gallery-preview__img"
            loading="eager"
            decoding="async"
            @error="onImageError"
          />
          <span
            v-else
            class="gallery-preview__fallback"
            role="img"
            :aria-label="photo?.alt || '图片加载失败'"
          >
            <svg viewBox="0 0 24 24" width="40" height="40" focusable="false" aria-hidden="true">
              <path
                d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3h9A2.75 2.75 0 0 1 19.25 5.75v9.5c0 .54-.16 1.04-.43 1.46M6.2 18.25h10.3m-8.7-3.5 2.7-3 2.15 2.4 1.15-1.25m4.7 6.85-15-15"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="gallery-preview__fallback-hint">图片加载失败</span>
          </span>
          <figcaption
            v-if="photo && photo.caption"
            tabindex="0"
            class="gallery-preview__caption"
          >
            {{ photo.caption }}
          </figcaption>
        </figure>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 单元 4 / Todo 4: 模态遮罩 = token 化 scrim + 真实 backdrop-filter；
   不使用 <dialog>::backdrop，因为我们需要精确控制关闭按钮与遮罩的层级。 */
.gallery-preview {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background-color: var(--theme-scrim-strong);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  /* AGENTS.md §5: 出现/消失走 opacity 过渡；reduced-motion 用户自动降级 */
  animation: gallery-preview-fade 180ms ease-out;
}

@keyframes gallery-preview-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.gallery-preview__frame {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  max-width: min(92vw, 1200px);
  max-height: 90vh;
  width: min(92vw, 1200px);
  background: transparent;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-lg);
  overflow: hidden;
}

.gallery-preview__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 0;
  border-radius: var(--theme-radius-pill);
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  cursor: pointer;
  font: inherit;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.gallery-preview__close:hover {
  background: var(--theme-surface-variant);
  color: var(--theme-primary);
  transform: scale(1.05);
}

.gallery-preview__close:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: 2px;
}

.gallery-preview__close svg {
  display: block;
  width: 100%;
  height: 100%;
}

.gallery-preview__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
}

.gallery-preview__img {
  display: block;
  width: 100%;
  max-height: min(80vh, 75vw);
  object-fit: contain;
  background: var(--theme-scrim);
}

.gallery-preview__fallback {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 320px;
  padding: 2rem;
  background: var(--theme-scrim);
  color: var(--theme-on-surface);
  opacity: 0.6;
}

.gallery-preview__fallback-hint {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  opacity: 0.85;
}

.gallery-preview__caption {
  padding: 0.75rem 1rem;
  background: transparent;
  border-top: 1px solid var(--theme-border);
  color: var(--theme-on-surface);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  line-height: 1.5;
  word-break: keep-all;
  line-break: strict;
  text-wrap: pretty;
}

.gallery-preview__caption:focus {
  outline: none;
}

.gallery-preview__caption:focus-visible {
  outline: 2px solid var(--theme-primary);
  outline-offset: -2px;
  border-radius: var(--theme-radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  .gallery-preview {
    animation: none;
  }
  .gallery-preview__close {
    transition: none;
  }
}

@media (max-width: 640px) {
  .gallery-preview {
    padding: 0.75rem;
  }
  .gallery-preview__frame {
    max-height: 95vh;
    max-width: 100vw;
    width: 100vw;
    border-radius: var(--theme-radius-md);
  }
}
</style>
