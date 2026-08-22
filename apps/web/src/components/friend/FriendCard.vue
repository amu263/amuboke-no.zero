<script setup lang="ts">
// AGENTS.md §4: <Domain><Role> + variant 字面量联合
// FriendCard: friends 列表页用 — 头像 + 名字 + bio + tags
import { computed, ref } from 'vue'

export type FriendCardVariant = 'inline' | 'compact'

const props = withDefaults(
  defineProps<{
    name: string
    url: string
    avatar?: string
    bio?: string
    tags?: string[]
    variant?: FriendCardVariant
  }>(),
  { variant: 'inline' }
)

const failedAvatarSources = ref<readonly string[]>([])
const avatarSrc = computed(() => {
  const avatar = props.avatar

  if (avatar === undefined || avatar.length === 0 || failedAvatarSources.value.includes(avatar)) {
    return undefined
  }

  return avatar
})

function markAvatarFailed(src: string) {
  if (failedAvatarSources.value.includes(src)) {
    return
  }

  failedAvatarSources.value = [...failedAvatarSources.value, src]
}
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener"
    :class="['friend-card', `friend-card--${variant}`]"
  >
    <span class="friend-card__avatar">
      <img v-if="avatarSrc" :src="avatarSrc" :alt="name" loading="lazy" @error="markAvatarFailed(avatarSrc)" />
      <span v-else class="friend-card__avatar-fallback">{{ name.slice(0, 1) }}</span>
    </span>
    <span class="friend-card__body">
      <span class="friend-card__name">{{ name }}</span>
      <span v-if="bio" class="friend-card__bio">{{ bio }}</span>
      <span v-if="tags?.length" class="friend-card__tags">
        <span v-for="t in tags" :key="t" class="friend-card__tag">#{{ t }}</span>
      </span>
    </span>
    <svg
      class="friend-card__arrow"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
    >
      <path d="M7 5h8v8" />
      <path d="M5 15 15 5" />
    </svg>
  </a>
</template>

<style scoped>
.friend-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-lg);
  background: transparent;
  color: var(--theme-on-surface);
  text-decoration: none;
  transition: border-color 160ms ease, transform 160ms ease;
}
.friend-card:hover {
  border-color: var(--theme-primary);
  transform: translateX(2px);
}

.friend-card__avatar {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: var(--theme-radius-pill);
  overflow: hidden;
  background: var(--theme-scrim);
  display: grid;
  place-items: center;
}
.friend-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.friend-card__avatar-fallback {
  font-family: var(--theme-font-mono);
  font-weight: 600;
}

.friend-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1 1 auto;
  min-width: 0;
}
.friend-card__name {
  font-weight: 600;
}
.friend-card__bio {
  font-size: var(--theme-font-size-sm);
  opacity: 0.7;
  line-height: 1.4;
  text-wrap: pretty;
}
.friend-card__tags {
  display: flex;
  gap: 0.35rem;
  margin-top: 0.15rem;
  flex-wrap: wrap;
}
.friend-card__tag {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.6;
}

.friend-card__arrow {
  flex: 0 0 auto;
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.4;
}
.friend-card:hover .friend-card__arrow {
  opacity: 1;
  color: var(--theme-primary);
}

/* compact: 单行，去掉 bio + tags */
.friend-card--compact .friend-card__bio,
.friend-card--compact .friend-card__tags {
  display: none;
}

@media (max-width: 420px) {
  .friend-card--inline {
    gap: 0.65rem;
    padding-inline: 0.75rem;
  }

  .friend-card--inline .friend-card__avatar {
    flex-basis: 40px;
    width: 40px;
    height: 40px;
  }

  .friend-card--inline .friend-card__bio {
    font-size: var(--theme-font-size-xs);
    word-break: keep-all;
    line-break: strict;
    text-wrap: balance;
  }
}
</style>
