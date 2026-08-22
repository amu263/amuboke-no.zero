<script setup lang="ts">
// AGENTS.md §1 §3: 文章页 — 构建期定型（数据来自 build-time-index，不再 import.meta.glob）
// AGENTS.md §4: 页面壳只决定 variant；子组件决定皮肤
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { POSTS_BY_SLUG, type PostMeta } from '@/content/build-time-index'
import { useLike } from '@/composables/useLike'
import LikeButton from '@/components/like/LikeButton.vue'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const hit = computed<PostMeta | null>(() => POSTS_BY_SLUG[slug.value] ?? null)
const backHref = computed(() => '/posts')

// 点赞 stub（单元 6）：纯前端 localStorage 追踪，不需要后端
const { count, hasLiked, fetchCount, doLike } = useLike(slug.value)

onMounted(() => {
  fetchCount()
})

// PostHeroVariant: 文章页壳用「terminal / newspaper / card」三选一
// 单元 3 只交付「card」一种实现，单元 4 会补齐
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
        <time class="post-page__date">{{ hit.date ?? '未注明日期' }}</time>
        <h1 class="post-page__title">{{ hit.title ?? hit.slug }}</h1>
        <p v-if="hit.summary" class="post-page__summary">{{ hit.summary }}</p>
        <div class="post-page__meta-row">
          <div v-if="hit.tags?.length" class="post-page__tags">
            <span v-for="t in hit.tags" :key="t" class="post-page__tag">#{{ t }}</span>
          </div>
          <LikeButton
            :count="count"
            :has-liked="hasLiked"
            class="post-page__like"
            @like="doLike"
          />
        </div>
      </header>

      <!--
        markdown-loader §5 #17: .md 的「默认形态」已是编译好的 Vue SFC，里面把
        marked.parse 的 html 渲染到 .markdown-body 下。这里直接 v-html。
      -->
      <div class="markdown-body" v-html="hit.html" />
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
  margin-bottom: 2rem;
}
.post-page__date {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  opacity: 0.6;
}
.post-page__title {
  margin-top: 0.25rem;
  font-size: var(--theme-font-size-3xl);
  font-weight: 700;
  line-height: 1.2;
}
.post-page__summary {
  margin-top: 0.5rem;
  opacity: 0.75;
  line-height: 1.6;
}
.post-page__meta-row {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.post-page__tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.post-page__tag {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  padding: 0.1em 0.5em;
  border-radius: var(--theme-radius-sm);
  background: var(--theme-scrim);
  color: var(--theme-accent);
}
.post-page__like {
  flex-shrink: 0;
}
</style>
