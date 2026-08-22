<script setup lang="ts">
// components/ui/AvatarWithFallback.vue — 头像 + 首字母 fallback
// Usage: <AvatarWithFallback :src="avatar" :name="name" size="md" />
import { ref, computed } from 'vue'
const props = defineProps<{
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'square'
}>()

const failedSrcs = ref<readonly string[]>([])
const hasFailed = computed(() => props.src ? failedSrcs.value.includes(props.src) : true)

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (props.src && !failedSrcs.value.includes(props.src)) {
    failedSrcs.value = [...failedSrcs.value, props.src]
  }
}

const initials = computed(() => props.name.slice(0, 1).toUpperCase())
</script>

<template>
  <span
    :class="[
      'avatar-fb',
      `avatar-fb--${size ?? 'md'}`,
      `avatar-fb--${shape ?? 'circle'}`,
    ]"
    :aria-label="name"
  >
    <img
      v-if="src && !hasFailed"
      :src="src"
      :alt="name"
      loading="lazy"
      @error="onImgError"
    />
    <span v-else class="avatar-fb__fallback" aria-hidden="true">{{ initials }}</span>
  </span>
</template>

<style scoped>
.avatar-fb {
  display: inline-grid;
  place-items: center;
  background: var(--theme-scrim);
  border: 1px solid var(--theme-border);
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-fb--circle { border-radius: 50%; }
.avatar-fb--square { border-radius: var(--theme-radius-md); }

.avatar-fb--sm { width: 32px; height: 32px; font-size: var(--theme-font-size-xs); }
.avatar-fb--md { width: 44px; height: 44px; font-size: var(--theme-font-size-base); }
.avatar-fb--lg { width: 64px; height: 64px; font-size: var(--theme-font-size-xl); }

.avatar-fb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-fb__fallback {
  font-family: var(--theme-font-mono);
  font-weight: 700;
  color: var(--theme-primary);
  line-height: 1;
}
</style>
