<script setup lang="ts">
// AGENTS.md §1 §3: 文章页 — 构建期定型（数据来自 build-time-index，不再 import.meta.glob）
// AGENTS.md §4: 页面壳只决定 variant；子组件决定皮肤
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { POSTS_BY_SLUG, type PostMeta } from '@/content/build-time-index'
import PostHero from '@/components/post/PostHero.vue'
import { useLike } from '@/composables/useLike'
import LikeButton from '@/components/like/LikeButton.vue'
import GiscusComments from '@/components/comment/GiscusComments.vue'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const hit = computed<PostMeta | null>(() => POSTS_BY_SLUG[slug.value] ?? null)
const backHref = computed(() => '/posts')

// 点赞（单元 6）：纯前端 localStorage 追踪，不需要后端
const { count, hasLiked, fetchCount, doLike } = useLike(slug.value)

onMounted(() => {
  fetchCount()
})

// PostHeroVariant: 文章页壳用「terminal / newspaper / card」三选一
export type PostHeroVariant = 'terminal' | 'newspaper' | 'card'
withDefaults(defineProps<{ variant?: PostHeroVariant }>(), { variant: 'card' })
</script>

<template>
  <v-container class="py-10" max-width="800">
    <v-btn
      :to="backHref"
      variant="text"
      size="small"
      class="mb-4"
    >
      <template #prepend>
        <svg
          class="post-page__back-icon"
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12.5 4.5 7 10l5.5 5.5" />
        </svg>
      </template>
      回到列表
    </v-btn>

    <article v-if="hit" class="post-page">
      <header class="post-page__head">
        <PostHero :post="hit" :variant="variant" />
        <!-- 点赞按钮（单元 6）-->
        <div class="post-page__meta-row">
          <div />
          <LikeButton
            :count="count"
            :has-liked="hasLiked"
            @like="doLike"
          />
        </div>
      </header>

      <div class="markdown-body" v-html="hit.html" />

      <!-- Giscus 评论系统（GitHub Discussions）-->
      <GiscusComments />
    </article>

    <v-alert
      v-else
      type="warning"
      variant="tonal"
      title="文章不存在"
      :text="`找不到 slug 为 ${slug} 的文章`"
    />
  </v-container>
</template>

<style scoped>
.post-page__back-icon {
  width: 1em;
  height: 1em;
  color: currentColor;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
.post-page__head {
  margin-bottom: 1.5rem;
}
.post-page__meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0.75rem;
}
</style>