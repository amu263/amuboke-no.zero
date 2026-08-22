<script setup lang="ts">
// AGENTS.md §4: <Domain><Role> + variant 字面量联合
// ProjectCard: projects 列表页用 — 卡片 + tech chips
import { computed } from 'vue'
import type { ProjectMeta } from '@/content/build-time-index'

export type ProjectCardVariant = 'card' | 'compact'

const props = withDefaults(
  defineProps<{
    project: ProjectMeta
    variant?: ProjectCardVariant
  }>(),
  { variant: 'card' }
)

const repoLink = computed(() => props.project.links?.repo)
const statusLabel = computed(() => {
  switch (props.project.status) {
    case 'active': return '进行中'
    case 'archived': return '已归档'
    case 'wip': return 'WIP'
    default: return null
  }
})
</script>

<template>
  <v-card
    :class="['project-card', `project-card--${variant}`]"
    variant="tonal"
  >
    <v-card-item>
      <div class="project-card__head">
        <v-card-title class="project-card__name">{{ project.name }}</v-card-title>
        <span v-if="statusLabel" class="project-card__status" :class="`is-${project.status}`">
          {{ statusLabel }}
        </span>
      </div>
      <v-card-subtitle class="project-card__summary">{{ project.summary }}</v-card-subtitle>
    </v-card-item>

    <v-card-text v-if="project.tech?.length" class="project-card__tech">
      <span v-for="t in project.tech" :key="t" class="project-card__chip">{{ t }}</span>
    </v-card-text>

    <v-card-actions v-if="repoLink">
      <a
        class="project-card__link"
        :href="repoLink"
        target="_blank"
        rel="noopener"
        @click.stop
      >
        <svg
          class="project-card__repo-icon"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.4v-1.52c-2.23.5-2.7-.98-2.7-.98-.36-.95-.89-1.2-.89-1.2-.73-.51.06-.5.06-.5.8.06 1.23.85 1.23.85.72 1.26 1.87.9 2.33.69.07-.53.28-.9.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.9.31-1.63.82-2.2-.08-.21-.36-1.04.08-2.17 0 0 .67-.22 2.2.84A7.45 7.45 0 0 1 8 3.96c.68 0 1.36.09 2 .28 1.52-1.06 2.19-.84 2.19-.84.44 1.13.16 1.96.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.85-3.65 4.05.29.25.54.76.54 1.54v2.22c0 .22.15.48.55.4A8.13 8.13 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"
          />
        </svg>
        代码仓库
      </a>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.project-card {
  border: 1px solid var(--theme-border);
  background: transparent;
  color: var(--theme-on-surface);
}

.project-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.project-card__name {
  font-weight: 600;
  font-size: var(--theme-font-size-lg);
}
.project-card__status {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  padding: 0.1em 0.5em;
  border-radius: var(--theme-radius-pill);
  border: 1px solid var(--theme-border);
}
.project-card__status.is-active {
  color: var(--theme-success);
  border-color: var(--theme-success);
}
.project-card__status.is-archived {
  opacity: 0.55;
}
.project-card__status.is-wip {
  color: var(--theme-warning);
  border-color: var(--theme-warning);
}

.project-card__summary {
  opacity: 0.75;
  line-height: 1.5;
  text-wrap: balance;
  word-break: keep-all;
  line-break: strict;
  hyphens: none;
  white-space: normal;
}

@media (max-width: 480px) {
  .project-card__summary {
    font-size: var(--theme-font-size-xs);
  }
}

.project-card__tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.project-card__chip {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  padding: 0.1em 0.5em;
  border-radius: var(--theme-radius-sm);
  background: var(--theme-scrim);
  color: var(--theme-accent);
}

.project-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-primary);
  text-decoration: none;
}
.project-card__repo-icon {
  inline-size: 1em;
  block-size: 1em;
  flex: 0 0 auto;
}

.project-card--compact .project-card__tech {
  display: none;
}
</style>
