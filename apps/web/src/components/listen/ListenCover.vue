<script setup lang="ts">
// ListenCover owns local cover rendering and failed-image fallback for ListenCard.
import { computed, ref } from 'vue'

const props = defineProps<{
  title: string
  cover?: string
}>()

const failedCoverSources = ref<readonly string[]>([])
const coverSrc = computed(() => {
  const cover = props.cover

  if (cover === undefined || cover.length === 0 || failedCoverSources.value.includes(cover)) {
    return undefined
  }

  return cover
})

function markCoverFailed(src: string) {
  if (failedCoverSources.value.includes(src)) {
    return
  }

  failedCoverSources.value = [...failedCoverSources.value, src]
}
</script>

<template>
  <figure class="listen-card__cover">
    <img
      v-if="coverSrc"
      :src="coverSrc"
      :alt="`${title} 封面`"
      width="320"
      height="320"
      loading="lazy"
      decoding="async"
      @error="markCoverFailed(coverSrc)"
    />
    <span v-else class="listen-card__cover-fallback" aria-hidden="true">
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M30 9v21.5a6 6 0 1 1-3-5.2V13l13-3v17.5a6 6 0 1 1-3-5.2V8.5L30 9Z" />
      </svg>
    </span>
  </figure>
</template>

<style scoped>
.listen-card__cover {
  margin: 0;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-md);
  background: var(--theme-scrim);
}

.listen-card__cover img,
.listen-card__cover-fallback {
  display: block;
  inline-size: 100%;
  block-size: 100%;
}

.listen-card__cover img {
  object-fit: cover;
}

.listen-card__cover-fallback {
  display: grid;
  place-items: center;
  color: var(--theme-primary);
}

.listen-card__cover-fallback svg {
  inline-size: 42%;
  block-size: 42%;
  fill: currentColor;
  opacity: 0.72;
}

@media (max-width: 42rem) {
  .listen-card__cover {
    max-inline-size: 12rem;
  }
}
</style>
