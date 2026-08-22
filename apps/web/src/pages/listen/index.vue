<script setup lang="ts">
// pages/listen/index.vue — 音乐档案列表页（极客风 Unit 5）
import { LISTENS } from '@/content/build-time-index'
import {
  GlowButton,
  TerminalCard,
  SectionHeader,
  DividerDecorate,
} from '@/components/ui'
import ListenCard from '@/components/listen/ListenCard.vue'
</script>

<template>
  <div class="listen-page">
    <div class="listen-page__header">
      <SectionHeader label="#LISTEN" title="听见" align="center" />
      <p class="listen-page__desc">共 {{ LISTENS.length }} 张音乐档案 · 只保存元数据</p>
    </div>

    <v-container max-width="1200" class="listen-page__content">
      <div v-if="LISTENS.length" class="listen-page__grid">
        <ListenCard
          v-for="item in LISTENS"
          :key="item.slug"
          :listen="item"
          variant="card"
        />
      </div>

      <div v-if="!LISTENS.length" class="listen-page__empty">
        <TerminalCard title="listen" prompt="$">
          <p>还没有音乐档案。</p>
        </TerminalCard>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.listen-page {
  min-height: 100vh;
  background: transparent;
  color: var(--theme-on-background);
  padding-top: var(--theme-spacing-xl);
}

.listen-page__header {
  text-align: center;
  margin-bottom: var(--theme-spacing-lg);
}

.listen-page__desc {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.7;
  margin-top: -0.5rem;
}

.listen-page__content {
  padding-bottom: var(--theme-spacing-xxl);
}

.listen-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--theme-spacing-lg);
}

.listen-page__empty {
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .listen-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
