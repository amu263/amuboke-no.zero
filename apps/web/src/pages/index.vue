<script setup lang="ts">
import { computed } from 'vue'
import { BILIBILI_PROFILE_URL } from '@/data/social'
import { POSTS, PROJECTS, GALLERIES, FRIENDS, LISTENS, POST_TAG_CLOUD, getContentSummary, ACTIVITY_HEATMAP } from '@/content/build-time-index'
import ActivityHeatmap from '@/components/home/ActivityHeatmap.vue'
import TagCloud from '@/components/home/TagCloud.vue'
import {
  GlowButton,
  TerminalCard,
  MonoChip,
  StatusBadge,
  SectionHeader,
  DividerDecorate,
  AvatarWithFallback,
  GlitchText,
  TickerText,
  MetaLine,
  ContributorScroll,
} from '@/components/ui'

const summary = getContentSummary()
const recentPosts = computed(() => [...POSTS].slice(0, 3))
const tickerItems = computed(() => [
  summary.posts + ' 篇文章',
  summary.projects + ' 个项目',
  summary.galleries + ' 组图集',
  summary.listens + ' 张专辑',
  summary.friends + ' 位友链',
])
const channelLinks = [
  { to: '/posts', label: '观察', desc: '文章与笔记' },
  { to: '/projects', label: '折腾', desc: '项目与实验' },
  { to: '/gallery', label: '看见', desc: '图集与照片' },
  { to: '/listen', label: '听见', desc: '音乐档案' },
]
const contributors = [
  { name: 'DeepSeek Harness' },
  { name: 'OpenCode' },
  { name: 'Codex' },
  { name: 'MiniMax M2.7' },
  { name: 'ChatGPT 5.6' },
  { name: 'DeepSeek v4 Flash' },
  { name: 'Grok 4.5' },
]
const socialLinks = [
  { name: '哔哩哔哩', href: BILIBILI_PROFILE_URL, kind: 'bilibili' },
  { name: '网易云音乐', href: 'https://music.163.com/#/user/home?id=1695448500', kind: 'netease' },
  { name: 'GitHub', href: 'https://github.com/amu263', kind: 'github' },
  { name: 'QQ', href: 'https://qm.qq.com/q/27n5EEQVsM', kind: 'qq' },
]
</script>

<template>
  <div class="home-page">
    <div class="home-page__ticker">
      <TickerText :items="tickerItems" :speed="40" />
    </div>

    <header class="home-page__hero">
      <div class="home-page__hero-identity">
        <GlitchText class="home-page__brand" tone="primary">AMU LIVE STYLE</GlitchText>
        <p class="home-page__tagline">一个人的长期档案，持续更新中</p>
        <blockquote class="home-page__quote">
          <span class="home-page__quote-zh">过人的智慧是人类最大的财富</span>
          <span class="home-page__quote-en">Wit beyond measure is man's greatest treasure.</span>
        </blockquote>
        <nav class="home-page__channels">
          <GlowButton
            v-for="ch in channelLinks"
            :key="ch.to"
            variant="secondary"
            size="sm"
            :to="ch.to"
          >{{ ch.label }}</GlowButton>
        </nav>
        <div class="home-page__stats">
          <span class="home-page__stat">
            <span class="home-page__stat-num">{{ summary.posts }}</span>
            <span class="home-page__stat-label">文章</span>
          </span>
          <span class="home-page__stat">
            <span class="home-page__stat-num">{{ summary.projects }}</span>
            <span class="home-page__stat-label">项目</span>
          </span>
          <span class="home-page__stat">
            <span class="home-page__stat-num">{{ summary.galleries }}</span>
            <span class="home-page__stat-label">图集</span>
          </span>
          <span class="home-page__stat">
            <span class="home-page__stat-num">{{ summary.listens }}</span>
            <span class="home-page__stat-label">专辑</span>
          </span>
        </div>
        <nav class="home-page__socials" aria-label="社交主页">
          <a
            v-for="social in socialLinks"
            :key="social.href"
            class="home-page__social-link"
            :class="'is-' + social.kind"
            :href="social.href"
            :aria-label="social.name"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img v-if="social.kind === 'bilibili'" src="/icons/bilibili.svg" alt="" aria-hidden="true" />
            <img v-else-if="social.kind === 'netease'" src="/icons/netease.svg" alt="" aria-hidden="true" />
            <svg v-else-if="social.kind === 'github'" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.2-.3-4.5-1.1-4.5-4.8 0-1.1.4-1.9 1-2.6-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.1 9.1 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.5 1 2.6 0 3.7-2.3 4.5-4.5 4.8.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2Z"/></svg>
            <img v-else src="/icons/qq.svg" alt="" aria-hidden="true" />
          </a>
        </nav>
      </div>
      <section class="home-page__tag-cloud" aria-label="文章标签云">
        <TagCloud :tags="POST_TAG_CLOUD" />
      </section>
      <div class="home-page__hero-portrait">
        <div class="home-page__portrait-disc">
          <!-- 间隔刻度圆框 + 水蓝流星：纯装饰，两个伪元素，不参与布局与命中测试 -->
          <span class="home-page__portrait-halo" aria-hidden="true"></span>
          <!-- data-boot-dock: 启动帘幕的归位锚点（见 composables/useBootSplash.ts）。
               与帘幕中央的头像必须是同一张素材；圆角由这张 img 自己承担，
               归位飞行因此一路保持圆形裁剪，落地即同一个圆。 -->
          <img
            data-boot-dock
            src="/img/amu-portrait.webp"
            alt="Creator portrait"
            width="1024"
            height="1024"
            loading="eager"
            fetchpriority="high"
            decoding="sync"
          />
        </div>
        <div class="home-page__portrait-overlay">
          <GlitchText class="home-page__portrait-label">// ARCHIVE OWNER</GlitchText>
        </div>
      </div>
    </header>

    <v-container max-width="1100" class="home-page__content">

      <!-- Code Contributors — danmaku scrolling -->
      <section class="home-page__section home-page__contributor">
        <ContributorScroll :contributors="contributors" :rows="3" :speed="22" />
      </section>

      <section class="home-page__section">
        <SectionHeader label="RECENT" title="最新文章" />
        <div class="home-page__posts">
          <TerminalCard
            v-for="post in recentPosts"
            :key="post.slug"
            :title="post.slug + '.md'"
            prompt=">"
          >
            <div class="post-item">
              <MetaLine :date="post.date" :tags="(post.tags ?? []).slice(0, 3)" />
              <h3 class="post-item__title">{{ post.title ?? post.slug }}</h3>
              <p v-if="post.summary" class="post-item__summary">{{ post.summary }}</p>
              <GlowButton variant="ghost" size="sm" :to="'/posts/' + post.slug">阅读全文</GlowButton>
            </div>
          </TerminalCard>
        </div>
        <div class="home-page__section-footer">
          <GlowButton variant="secondary" to="/posts">查看全部 {{ summary.posts }} 篇</GlowButton>
        </div>
      </section>

      <section class="home-page__section home-page__heatmap">
        <SectionHeader label="ACTIVITY" title="活动热力图" />
        <TerminalCard title="activity-heatmap.json" prompt="$">
          <ActivityHeatmap :years="ACTIVITY_HEATMAP" />
        </TerminalCard>
      </section>

      <DividerDecorate label="CHANNEL" />

      <section class="home-page__section">
        <SectionHeader label="PROJECTS" title="折腾项目" />
        <div class="home-page__projects">
          <TerminalCard
            v-for="project in PROJECTS.slice(0, 4)"
            :key="project.slug"
            :title="project.slug + '.json'"
            prompt="$"
          >
            <div class="project-item">
              <div class="project-item__header">
                <h3 class="project-item__name">{{ project.name }}</h3>
                <StatusBadge
                  v-if="project.status"
                  :status="project.status === 'active' ? 'active' : project.status === 'wip' ? 'wip' : 'archived'"
                  size="sm"
                />
              </div>
              <p class="project-item__summary">{{ project.summary }}</p>
              <div class="project-item__tech">
                <MonoChip v-for="t in (project.tech ?? []).slice(0, 4)" :key="t">{{ t }}</MonoChip>
              </div>
            </div>
          </TerminalCard>
        </div>
        <div class="home-page__section-footer">
          <GlowButton variant="secondary" to="/projects">查看全部 {{ summary.projects }} 个</GlowButton>
        </div>
      </section>

      <DividerDecorate label="NETWORK" />

      <section class="home-page__section">
        <SectionHeader label="FRIENDS" title="友链网络" />
        <div class="home-page__friends">
          <div
            v-for="friend in FRIENDS"
            :key="friend.url"
            class="home-page__friend-item"
          >
            <AvatarWithFallback :name="friend.name" :src="friend.avatar" size="sm" />
            <div class="home-page__friend-info">
              <span class="home-page__friend-name">{{ friend.name }}</span>
              <span v-if="friend.bio" class="home-page__friend-bio">{{ friend.bio }}</span>
            </div>
            <a :href="friend.url" target="_blank" rel="noopener" class="home-page__friend-link" :aria-label="'访问 ' + friend.name">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 5h8v8M5 15 15 5"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="home-page__section-footer">
          <GlowButton variant="secondary" to="/friends">查看 friends 页面</GlowButton>
        </div>
      </section>

      <footer class="home-page__footer">
        <GlitchText class="home-page__footer-brand">AMU LIVE STYLE</GlitchText>
        <p class="home-page__footer-desc">保存想长期留下的东西，认识同频的人。</p>
        <p class="home-page__footer-meta">
          <MonoChip>{{ summary.posts }} entries</MonoChip>
          <MonoChip>{{ summary.friends }} friends</MonoChip>
        </p>
      </footer>
    </v-container>
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; background: transparent; color: var(--theme-on-background); }

.home-page__ticker { border-bottom: 1px solid var(--theme-border); background: var(--theme-surface); }

.home-page__hero {
  position: relative;
  isolation: isolate;
  display: flex; min-height: min(580px, 85vh);
  /* 调整一: 去掉 hero 区和下方 section 之间的贴边线 */
  animation: home-rise 360ms cubic-bezier(.2,.8,.2,1) both;
}
.home-page__hero-identity {
  flex: 1.1; display: flex; flex-direction: column; justify-content: center;
  padding: var(--theme-spacing-xl) var(--theme-spacing-xl) var(--theme-spacing-xl) max(2rem, calc((100vw - 1100px) / 2));
  gap: var(--theme-spacing-md);
}
.home-page__tag-cloud { position: absolute; left: 38%; right: 36%; top: 64%; height: 250px; z-index: 0; overflow: hidden; contain: layout paint; pointer-events: none; }
.home-page__hero-identity, .home-page__hero-portrait { position: relative; z-index: 2; }
.home-page__hero-portrait {
  flex: 0.9;
  display: grid;
  place-items: center;
  gap: var(--theme-spacing-sm);
  padding: var(--theme-spacing-lg);
  /* 圆盘与光晕环共用的尺寸；环靠 inset 负值外扩，所以容器不能 overflow: hidden */
  --portrait-size: min(100%, 460px);
  /* 水蓝：主强调色与信息色按 token 混出来，不引入脱离主题的固定色 */
  --portrait-aqua: color-mix(in srgb, var(--theme-accent) 52%, var(--theme-info));
}
.home-page__portrait-disc {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--portrait-size);
  aspect-ratio: 1 / 1;
}
.home-page__portrait-disc img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 50%;
}
/* ── 间隔圆框 + 水蓝流星 ─────────────────────────────────────────────
   两个伪元素都靠 mask 裁成一圈很窄的环带：
     ::before = repeating-conic 刻度，静止不动的「间隔圆框」
     ::after  = conic 流星（尾部渐隐 + 亮头），绕环匀速公转
   都消费 --portrait-aqua，随主题自动改对比度；不引第三方动画库。 */
.home-page__portrait-halo {
  position: absolute;
  inset: -22px;
  border-radius: 50%;
  pointer-events: none;
}
.home-page__portrait-halo::before,
.home-page__portrait-halo::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
}
.home-page__portrait-halo::before {
  background: repeating-conic-gradient(
    from 0deg,
    var(--portrait-aqua) 0deg 1.4deg,
    transparent 1.4deg 12deg
  );
  /* closest-side 是关键：radial-gradient 默认 farthest-corner，百分比按**对角**
     距离算，环带会被推到四个角上、正交方向一个像素都看不到（本会话真实踩到）。
     用了 closest-side 之后 100% = 元素半径，照片半径 = 100% - 22px，
     于是环带落在 100%-20px ~ 100%-6px，正好贴着照片外侧。 */
  -webkit-mask: radial-gradient(circle closest-side, transparent calc(100% - 20px), #000 calc(100% - 19px), #000 calc(100% - 6px), transparent calc(100% - 5px));
  mask: radial-gradient(circle closest-side, transparent calc(100% - 20px), #000 calc(100% - 19px), #000 calc(100% - 6px), transparent calc(100% - 5px));
  opacity: 0.55;
  /* 与启动帘幕的 .boot-core__ticks 同向同速（逆时针 9s 一圈），
     归位之后刻度环继续以同一角速度转——帘幕与首页是同一个环的两次现身。 */
  animation: home-portrait-ticks 9s linear infinite;
}
.home-page__portrait-halo::after {
  background: conic-gradient(
    from 0deg,
    transparent 0deg 278deg,
    color-mix(in srgb, var(--portrait-aqua) 38%, transparent) 322deg,
    var(--portrait-aqua) 356deg,
    transparent 360deg
  );
  -webkit-mask: radial-gradient(circle closest-side, transparent calc(100% - 19px), #000 calc(100% - 18px), #000 calc(100% - 7px), transparent calc(100% - 6px));
  mask: radial-gradient(circle closest-side, transparent calc(100% - 19px), #000 calc(100% - 18px), #000 calc(100% - 7px), transparent calc(100% - 6px));
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--portrait-aqua) 65%, transparent));
  animation: home-portrait-meteor 6.4s linear infinite;
}
@keyframes home-portrait-meteor {
  to { transform: rotate(360deg); }   /* 流星顺时针 */
}
@keyframes home-portrait-ticks {
  to { transform: rotate(-360deg); }  /* 刻度环逆时针（与帘幕一致） */
}
.home-page__portrait-overlay { position: absolute; bottom: 0.35rem; right: 0.85rem; }
.home-page__portrait-label { font-size: var(--theme-font-size-xs) !important; opacity: 0.5; }

.home-page__brand { font-size: clamp(2.5rem, 7vw, 5.5rem) !important; font-weight: 900; color: var(--theme-primary); letter-spacing: -0.02em; line-height: 0.9; animation: home-rise 280ms 200ms cubic-bezier(.2,.8,.2,1) both; }
.home-page__tagline { font-family: var(--theme-font-mono); font-size: var(--theme-font-size-sm); color: var(--theme-secondary); opacity: 0.7; animation: home-rise 240ms 300ms cubic-bezier(.2,.8,.2,1) both; }
.home-page__quote { display: grid; gap: var(--theme-spacing-sm); padding-left: var(--theme-spacing-md); border-left: 2px solid var(--theme-primary); margin: var(--theme-spacing-sm) 0; }
.home-page__quote-zh { font-size: clamp(1.3rem, 2.5vw, 2.2rem); font-weight: 650; line-height: 1.35; animation: home-rise 280ms 380ms cubic-bezier(.2,.8,.2,1) both; }
.home-page__quote-en { color: var(--theme-secondary); font-size: var(--theme-font-size-sm); font-style: italic; line-height: 1.45; opacity: 0.7; animation: home-rise 240ms 460ms cubic-bezier(.2,.8,.2,1) both; }
.home-page__channels { display: grid; grid-template-columns: repeat(4, 62px); gap: 0.5rem; width: max-content; animation: home-rise 240ms 540ms cubic-bezier(.2,.8,.2,1) both; }
.home-page__channels > * { width: 62px; justify-content: center; }
.home-page__stats { display: grid; grid-template-columns: repeat(4, 62px); gap: 0.5rem; width: max-content; animation: home-rise 240ms 620ms cubic-bezier(.2,.8,.2,1) both; margin-top: var(--theme-spacing-sm); }
.home-page__stat { display: flex; flex-direction: column; align-items: center; text-align: center; }
.home-page__stat-num { font-family: var(--theme-font-mono); font-size: var(--theme-font-size-2xl); font-weight: 700; color: var(--theme-primary); line-height: 1; }
.home-page__stat-label { font-family: var(--theme-font-mono); font-size: var(--theme-font-size-xs); color: var(--theme-secondary); opacity: 0.6; }
.home-page__socials { display: flex; align-items: center; gap: 0.75rem; height: 26px; margin-top: var(--theme-spacing-sm); }
.home-page__social-link { display: inline-grid; place-items: center; flex: 0 0 48px; width: 48px !important; height: 48px !important; min-width: 48px; min-height: 48px; padding: 0 !important; color: var(--theme-secondary); border: 1px solid var(--theme-border); border-radius: 50%; background: var(--theme-surface); opacity: 0.78; overflow: hidden; transition: color 160ms ease, border-color 160ms ease, transform 160ms ease, opacity 160ms ease; }
.home-page__social-link svg, .home-page__social-link img { display: block; width: 30px !important; height: 30px !important; max-width: 30px; max-height: 30px; object-fit: contain; }
.home-page__social-link:hover, .home-page__social-link:focus-visible { color: var(--theme-primary); border-color: var(--theme-primary); opacity: 1; transform: translateY(-2px); outline: none; }
.home-page__social-link:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-primary) 35%, transparent); }

.home-page__content { padding-top: var(--theme-spacing-xl); padding-bottom: var(--theme-spacing-xxl); }
.home-page__section { margin-bottom: var(--theme-spacing-xl); }
.home-page__posts, .home-page__projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--theme-spacing-md); margin-bottom: var(--theme-spacing-md); }
.post-item, .project-item { display: flex; flex-direction: column; gap: 0.5rem; }
.post-item__title, .project-item__name { font-size: var(--theme-font-size-lg); font-weight: 600; color: var(--theme-on-surface); margin: 0; }
.post-item__summary, .project-item__summary { font-size: var(--theme-font-size-sm); opacity: 0.7; line-height: 1.5; flex: 1; }
.project-item__header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.project-item__tech { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.home-page__section-footer { display: flex; justify-content: flex-end; margin-top: var(--theme-spacing-sm); }

.home-page__contributor { margin-bottom: var(--theme-spacing-lg); }

.home-page__heatmap :deep(.activity-heatmap) { padding: var(--theme-spacing-sm) 0; }
.home-page__heatmap :deep(.ah-header) { margin-bottom: var(--theme-spacing-sm); }
.home-page__heatmap :deep(.ah-grid) { padding-left: 0; }
.home-page__heatmap :deep(.ah-year-nav) { flex-direction: row; flex-wrap: wrap; }
.home-page__heatmap :deep(.ah-year-btn) { height: 24px; min-width: 36px; }

.home-page__friends { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--theme-spacing-sm); margin-bottom: var(--theme-spacing-md); }
.home-page__friend-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.85rem; background: var(--theme-surface); border: 1px solid var(--theme-border); border-radius: var(--theme-radius-md); transition: border-color 160ms ease, transform 160ms ease; }
.home-page__friend-item:hover { border-color: var(--theme-primary); transform: translateX(2px); }
.home-page__friend-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.home-page__friend-name { font-weight: 600; font-size: var(--theme-font-size-sm); }
.home-page__friend-bio { font-size: var(--theme-font-size-xs); opacity: 0.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.home-page__friend-link { color: var(--theme-secondary); opacity: 0.5; transition: opacity 160ms, color 160ms; flex-shrink: 0; }
.home-page__friend-link:hover { color: var(--theme-primary); opacity: 1; }

.home-page__footer { text-align: center; padding-top: var(--theme-spacing-xl); border-top: 1px solid var(--theme-border); display: flex; flex-direction: column; align-items: center; gap: var(--theme-spacing-sm); }
.home-page__footer-brand { font-size: var(--theme-font-size-xl) !important; }
.home-page__footer-desc { font-size: var(--theme-font-size-sm); color: var(--theme-secondary); opacity: 0.6; }
.home-page__footer-meta { display: flex; gap: 0.5rem; }

@keyframes home-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .home-page__hero { flex-direction: column; min-height: auto; }
  .home-page__hero-identity { padding: var(--theme-spacing-lg) var(--theme-spacing-md); align-items: flex-start; }
  .home-page__hero-portrait { height: 260px; max-height: 260px; flex: none; order: 2; }
  .home-page__tag-cloud { position: relative; inset: auto; width: 100%; height: 180px; flex: none; order: 3; padding: 0 var(--theme-spacing-md); }
  .home-page__posts, .home-page__projects { grid-template-columns: 1fr; }
  .home-page__channels,
  .home-page__stats { grid-template-columns: repeat(4, minmax(0, 1fr)); width: 100%; }
  .home-page__channels > * { width: 100%; }
  .home-page__stats { gap: 0.5rem; }
}
</style>
