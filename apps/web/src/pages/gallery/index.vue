<script setup lang="ts">
// pages/gallery/index.vue — 图集列表页（极客风 Unit 5）
import { GALLERIES } from '@/content/build-time-index'
import {
  GlowButton,
  TerminalCard,
  SectionHeader,
  DividerDecorate,
  AvatarWithFallback,
} from '@/components/ui'

const totalPhotos = GALLERIES.reduce((acc, g) => acc + (g.photos?.length ?? 0), 0)
</script>

<template>
  <div class="gallery-page">
    <div class="gallery-page__header">
      <SectionHeader label="GALLERY" title="看见" align="center" />
      <p class="gallery-page__desc">共 {{ GALLERIES.length }} 个图集 · {{ totalPhotos }} 张照片</p>
    </div>

    <v-container max-width="1100" class="gallery-page__content">
      <div class="gallery-page__grid">
        <TerminalCard
          v-for="gallery in GALLERIES"
          :key="gallery.slug"
          :title="gallery.slug"
          prompt="$ open"
        >
          <div class="gallery-item">
            <!-- Photo previews -->
            <div class="gallery-item__photos">
              <div
                v-for="(photo, i) in (gallery.photos ?? []).slice(0, 4)"
                :key="photo.src"
                class="gallery-item__photo"
                :class="{ 'gallery-item__photo--more': i === 3 && (gallery.photos?.length ?? 0) > 4 }"
              >
                <img
                  v-if="photo.src"
                  :src="photo.src"
                  :alt="photo.alt ?? gallery.title"
                  loading="lazy"
                />
                <div v-else class="gallery-item__photo-placeholder">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
                <span v-if="i === 3" class="gallery-item__photo-more">
                  +{{ (gallery.photos?.length ?? 0) - 4 }}
                </span>
              </div>
            </div>

            <header class="gallery-item__header">
              <h2 class="gallery-item__title">{{ gallery.title }}</h2>
              <time class="gallery-item__date">{{ gallery.date }}</time>
            </header>

            <p v-if="gallery.summary" class="gallery-item__summary">{{ gallery.summary }}</p>

            <div class="gallery-item__footer">
              <span class="gallery-item__count">{{ gallery.photos?.length ?? 0 }} 张</span>
              <GlowButton variant="ghost" size="sm" :to="'/gallery/' + gallery.slug">
                查看图集 →
              </GlowButton>
            </div>
          </div>
        </TerminalCard>
      </div>

      <div v-if="!GALLERIES.length" class="gallery-page__empty">
        <TerminalCard title="gallery" prompt="$">
          <p>还没有图集。</p>
        </TerminalCard>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background: transparent;
  color: var(--theme-on-background);
  padding-top: var(--theme-spacing-xl);
}

.gallery-page__header {
  text-align: center;
  margin-bottom: var(--theme-spacing-lg);
}

.gallery-page__desc {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-secondary);
  opacity: 0.7;
  margin-top: -0.5rem;
}

.gallery-page__content {
  padding-bottom: var(--theme-spacing-xxl);
}

.gallery-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--theme-spacing-md);
}

.gallery-item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.gallery-item__photos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.35rem;
  aspect-ratio: 4/3;
  border-radius: var(--theme-radius-md);
  overflow: hidden;
  background: var(--theme-scrim);
}

.gallery-item__photo {
  position: relative;
  overflow: hidden;
  background: var(--theme-surfaceVariant);
}

.gallery-item__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 200ms ease;
}
.gallery-item__photo:hover img {
  transform: scale(1.04);
}

.gallery-item__photo-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--theme-secondary);
  opacity: 0.4;
}

.gallery-item__photo--more {
  position: relative;
}
.gallery-item__photo-more img {
  filter: brightness(0.5);
}
.gallery-item__photo-more::after {
  content: '';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
.gallery-item__photo-more .gallery-item__photo-more {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,0.5);
  color: white;
  font-family: var(--theme-font-mono);
  font-weight: 700;
  font-size: var(--theme-font-size-lg);
}

.gallery-item__photo-more {
  position: relative;
}

.gallery-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.gallery-item__title {
  font-size: var(--theme-font-size-lg);
  font-weight: 600;
  color: var(--theme-on-surface);
  margin: 0;
}

.gallery-item__date {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-secondary);
  opacity: 0.7;
  flex-shrink: 0;
}

.gallery-item__summary {
  font-size: var(--theme-font-size-sm);
  opacity: 0.7;
  line-height: 1.5;
}

.gallery-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.gallery-item__count {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  color: var(--theme-secondary);
  opacity: 0.6;
}

.gallery-page__empty {
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .gallery-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
