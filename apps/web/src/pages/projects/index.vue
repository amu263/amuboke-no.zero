<script setup lang="ts">
// pages/projects/index.vue — 项目列表页（极客风 Unit 5）
import { PROJECTS } from '@/content/build-time-index'
import {
  GlowButton,
  TerminalCard,
  MonoChip,
  StatusBadge,
  SectionHeader,
  DividerDecorate,
} from '@/components/ui'

function getStatusType(status?: string): 'active' | 'wip' | 'archived' | 'deprecated' {
  switch (status) {
    case 'active': return 'active'
    case 'wip': return 'wip'
    case 'archived': return 'archived'
    default: return 'archived'
  }
}

function getStatusLabel(status?: string): string {
  switch (status) {
    case 'active': return '进行中'
    case 'wip': return 'WIP'
    case 'archived': return '已归档'
    default: return '未知'
  }
}

function getProjectUrl(project: { links?: Record<string, string | undefined> }): string | undefined {
  return project.links?.demo || project.links?.repo || project.links?.github
}

function openProject(project: { links?: Record<string, string | undefined> }): void {
  const url = getProjectUrl(project)
  if (url && typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="projects-page">
    <div class="projects-page__header">
      <SectionHeader label="PROJECTS" title="折腾" align="center" />
      <p class="projects-page__desc">共 {{ PROJECTS.length }} 个项目 · 长期维护</p>
    </div>

    <v-container max-width="1100" class="projects-page__content">
      <div class="projects-page__grid">
        <TerminalCard
          v-for="project in PROJECTS"
          :key="project.slug"
          :title="project.slug + '.json'"
          prompt="$ ls -la"
        >
          <div
            class="project-item project-item--clickable"
            :class="{ 'project-item--has-link': getProjectUrl(project) }"
            :role="getProjectUrl(project) ? 'link' : undefined"
            :tabindex="getProjectUrl(project) ? 0 : undefined"
            @click="openProject(project)"
            @keydown.enter.prevent="openProject(project)"
            @keydown.space.prevent="openProject(project)"
          >
            <header class="project-item__header">
              <h2 class="project-item__name">{{ project.name }}</h2>
              <StatusBadge
                v-if="project.status"
                :status="getStatusType(project.status)"
                size="sm"
              >
                {{ getStatusLabel(project.status) }}
              </StatusBadge>
            </header>

            <p v-if="project.summary" class="project-item__summary">{{ project.summary }}</p>

            <div v-if="project.tech?.length" class="project-item__tech">
              <MonoChip v-for="t in project.tech.slice(0, 5)" :key="t">{{ t }}</MonoChip>
            </div>

            <div v-if="getProjectUrl(project)" class="project-item__links">
              <a
                :href="project.links?.repo || project.links?.github || project.links?.demo"
                target="_blank"
                rel="noopener"
                class="project-item__link"
                @click.stop
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.78.4.08.55-.18.55-.4v-1.52c-2.23.5-2.7-.98-2.7-.98-.36-.95-.89-1.2-.89-1.2-.73-.51.06-.5.06-.5.8.06 1.23.85 1.23.85.72 1.26 1.87.9 2.33.69.07-.53.28-.9.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.9.31-1.63.82-2.2-.08-.21-.36-1.04.08-2.17 0 0 .67-.22 2.2.84A7.45 7.45 0 0 1 8 3.96c.68 0 1.36.09 2 .28 1.52-1.06 2.19-.84 2.19-.84.44 1.13.16 1.96.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.85-3.65 4.05.29.25.54.76.54 1.54v2.22c0 .22.15.48.55.4A8.13 8.13 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z"/>
                </svg>
                源码
              </a>
              <a
                v-if="project.links?.demo"
                :href="project.links?.demo"
                target="_blank"
                rel="noopener"
                class="project-item__link"
                @click.stop
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                演示
              </a>
            </div>
          </div>
        </TerminalCard>
      </div>

      <div v-if="!PROJECTS.length" class="projects-page__empty">
        <TerminalCard title="projects" prompt="$">
          <p>还没有项目。去 <MonoChip>src/content/projects/</MonoChip> 添加一个试试。</p>
        </TerminalCard>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.projects-page {
  min-height: 100vh;
  background: transparent;
  color: var(--theme-on-background);
  padding-top: var(--theme-spacing-xl);
}

.projects-page__header {
  text-align: center;
  margin-bottom: var(--theme-spacing-lg);
}

.projects-page__desc {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.7;
  margin-top: -0.5rem;
}

.projects-page__content {
  padding-bottom: var(--theme-spacing-xxl);
}

.projects-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--theme-spacing-md);
}

.project-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-item--has-link {
  cursor: pointer;
  border-radius: var(--theme-radius-sm);
  transition: background-color 160ms, transform 160ms;
}
.project-item--has-link:hover,
.project-item--has-link:focus-visible {
  background: var(--theme-scrim);
  outline: none;
}
.project-item--has-link:focus-visible {
  box-shadow: 0 0 0 2px var(--theme-primary);
}

.project-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.project-item__name {
  font-size: var(--theme-font-size-lg);
  font-weight: 600;
  color: var(--theme-on-surface);
  margin: 0;
}

.project-item__summary {
  font-size: var(--theme-font-size-sm);
  opacity: 0.7;
  line-height: 1.5;
  flex: 1;
}

.project-item__tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.project-item__links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.project-item__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-primary);
  text-decoration: none;
  transition: opacity 160ms;
}
.project-item__link:hover {
  opacity: 0.75;
  text-decoration: underline;
}

.projects-page__empty {
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .projects-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
