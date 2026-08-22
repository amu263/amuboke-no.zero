<script setup lang="ts">
/**
 * SearchModal — Cmd/Ctrl+K 唤起的静态搜索弹窗
 * AGENTS.md §8: 静态搜索，Fuse.js 客户端模糊搜索，零网络请求
 */
// searchOpen is passed via v-model (modelValue prop) from parent App.vue
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch, type SearchResult } from '@/composables/useSearch'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const router = useRouter()
const { query, results, search, clear } = useSearch()
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

function close() {
  emit("update:modelValue", false)
  clear()
  selectedIndex.value = 0
}

function navigate(result: SearchResult) {
  const { href, type } = result.item
  // Friends open in new tab; internal routes use router
  if (type === 'friend') {
    window.open(href, "_blank", "noopener,noreferrer")
  } else {
    router.push(href)
  }
  close()
}

// Focus input when dialog opens
watch(() => props.modelValue, async (open) => {
  if (open) {
    selectedIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

// Reset selection when results change
watch(results, () => {
  selectedIndex.value = 0
})

function onInput(e: Event) {
  search((e.target as HTMLInputElement).value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (results.value[selectedIndex.value]) {
      navigate(results.value[selectedIndex.value])
    }
  } else if (e.key === 'Escape') {
    close()
  }
}

const typeLabel: Record<string, string> = {
  post: '文章',
  gallery: '图集',
  project: '项目',
  friend: '友链',
  listen: '音乐',
}
const typeColor: Record<string, string> = {
  post: 'primary',
  gallery: 'accent',
  project: 'warning',
  friend: 'success',
  listen: 'secondary',
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="580"
    :scrim="'rgb(0 0 0 / 0.7)'"
    transition="dialog-bottom-transition"
    @update:model-value="v => !v && close()"
  >
    <v-card class="search-modal" rounded="xl">
      <!-- Search input -->
      <div class="search-modal__input-row">
        <svg class="search-modal__icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="M15 15 18 18" stroke-linecap="round" />
        </svg>
        <input
          ref="inputRef"
          class="search-modal__input"
          type="text"
          placeholder="搜索文章、图集、项目…"
          autocomplete="off"
          spellcheck="false"
          :value="query"
          @input="onInput"
          @keydown="onKeydown"
        />
        <kbd class="search-modal__esc-hint" @click="close">ESC</kbd>
      </div>

      <v-divider />

      <!-- Results -->
      <div v-if="query.length >= 2" class="search-modal__results">
        <div v-if="results.length === 0" class="search-modal__empty">
          <p>没有找到与「{{ query }}」相关的内容</p>
        </div>

        <ul v-else class="search-modal__list" role="listbox">
          <li
            v-for="(result, i) in results"
            :key="result.item.slug + result.item.type"
            class="search-modal__item"
            :class="{ 'is-selected': i === selectedIndex }"
            role="option"
            :aria-selected="i === selectedIndex"
            @click="navigate(result)"
            @mouseenter="selectedIndex = i"
          >
            <div class="search-modal__item-left">
              <v-chip
                :color="typeColor[result.item.type]"
                size="x-small"
                label
                class="search-modal__type-chip"
              >{{ typeLabel[result.item.type] }}</v-chip>
              <span class="search-modal__item-title">{{ result.item.title }}</span>
            </div>
            <svg class="search-modal__item-arrow" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </li>
        </ul>
      </div>

      <!-- Hint when empty -->
      <div v-else class="search-modal__hint">
        <p>输入至少 2 个字符开始搜索</p>
        <p class="search-modal__hint-shortcuts">
          <kbd>↑↓</kbd> 导航 &nbsp; <kbd>Enter</kbd> 跳转 &nbsp; <kbd>ESC</kbd> 关闭
        </p>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.search-modal {
  background: var(--theme-surface) !important;
  border: 1px solid var(--theme-border, currentColor);
  overflow: hidden;
}

.search-modal__input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
}

.search-modal__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--theme-secondary);
  flex-shrink: 0;
}

.search-modal__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--theme-font-mono, monospace);
  font-size: 1rem;
  color: var(--theme-on-surface);
  caret-color: var(--theme-primary);
}

.search-modal__input::placeholder {
  color: var(--theme-secondary);
  opacity: 0.6;
}

.search-modal__esc-hint {
  font-family: var(--theme-font-mono, monospace);
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--theme-border, currentColor);
  border-radius: 4px;
  color: var(--theme-secondary);
  cursor: pointer;
  user-select: none;
}

.search-modal__results {
  max-height: 420px;
  overflow-y: auto;
}

.search-modal__empty {
  padding: 2rem;
  text-align: center;
  color: var(--theme-secondary);
  font-size: 0.9rem;
}

.search-modal__list {
  list-style: none;
  margin: 0;
  padding: 0.375rem 0;
}

.search-modal__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.25rem;
  cursor: pointer;
  gap: 0.75rem;
  transition: background 0.1s;
}

.search-modal__item.is-selected,
.search-modal__item:hover {
  background: var(--theme-scrim);
}

.search-modal__item-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.search-modal__type-chip {
  flex-shrink: 0;
  font-family: var(--theme-font-mono, monospace);
  font-size: 0.65rem;
}

.search-modal__item-title {
  font-size: 0.9rem;
  color: var(--theme-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-modal__item-arrow {
  width: 1rem;
  height: 1rem;
  color: var(--theme-secondary);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
}

.search-modal__item.is-selected .search-modal__item-arrow,
.search-modal__item:hover .search-modal__item-arrow {
  opacity: 1;
}

.search-modal__hint {
  padding: 1.5rem 1.25rem;
  text-align: center;
  color: var(--theme-secondary);
  font-size: 0.875rem;
}

.search-modal__hint-shortcuts {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.7;
}

.search-modal__hint-shortcuts kbd {
  font-family: var(--theme-font-mono, monospace);
  padding: 0.1rem 0.3rem;
  border: 1px solid var(--theme-border, currentColor);
  border-radius: 3px;
  font-size: 0.7rem;
}
</style>