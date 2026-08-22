<script setup lang="ts">
// pages/friends/index.vue — 友链列表页（极客风 Unit 5）
import { FRIENDS } from '@/content/build-time-index'
import {
  GlowButton,
  TerminalCard,
  AvatarWithFallback,
  MonoChip,
  SectionHeader,
  DividerDecorate,
} from '@/components/ui'
</script>

<template>
  <div class="friends-page">
    <div class="friends-page__header">
      <SectionHeader label="NETWORK" title="友链" align="center" />
      <p class="friends-page__desc">共 {{ FRIENDS.length }} 位同频的朋友</p>
    </div>

    <v-container max-width="900" class="friends-page__content">
      <div class="friends-page__list">
        <TerminalCard
          v-for="friend in FRIENDS"
          :key="friend.url"
          :title="friend.name"
          prompt="@"
        >
          <div class="friend-item">
            <div class="friend-item__main">
              <AvatarWithFallback
                :name="friend.name"
                :src="friend.avatar"
                size="lg"
                shape="circle"
              />
              <div class="friend-item__body">
                <h2 class="friend-item__name">{{ friend.name }}</h2>
                <p v-if="friend.bio" class="friend-item__bio">{{ friend.bio }}</p>
                <div v-if="friend.tags?.length" class="friend-item__tags">
                  <MonoChip v-for="t in friend.tags.slice(0, 4)" :key="t">{{ t }}</MonoChip>
                </div>
              </div>
            </div>
            <div class="friend-item__actions">
              <GlowButton variant="secondary" size="sm" :href="friend.url" target="_blank" rel="noopener">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 5h8v8M5 15 15 5"/>
                </svg>
                访问
              </GlowButton>
            </div>
          </div>
        </TerminalCard>
      </div>

      <div v-if="!FRIENDS.length" class="friends-page__empty">
        <TerminalCard title="friends" prompt="$">
          <p>还没有友链。</p>
        </TerminalCard>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.friends-page {
  min-height: 100vh;
  background: transparent;
  color: var(--theme-on-background);
  padding-top: var(--theme-spacing-xl);
}

.friends-page__header {
  text-align: center;
  margin-bottom: var(--theme-spacing-lg);
}

.friends-page__desc {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.7;
  margin-top: -0.5rem;
}

.friends-page__content {
  padding-bottom: var(--theme-spacing-xxl);
}

.friends-page__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--theme-spacing-md);
}

.friend-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.friend-item__main {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.friend-item__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.friend-item__name {
  font-size: var(--theme-font-size-lg);
  font-weight: 600;
  color: var(--theme-on-surface);
  margin: 0;
}

.friend-item__bio {
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.8;
  line-height: 1.5;
  margin: 0;
}

.friend-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.friend-item__actions {
  display: flex;
  justify-content: flex-end;
}

.friends-page__empty {
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .friends-page__list {
    grid-template-columns: 1fr;
  }
}
</style>
