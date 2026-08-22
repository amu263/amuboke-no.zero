<script setup lang="ts">
import { BILIBILI_PROFILE_URL } from '@/data/social'
</script>
<template>
  <header class="home-hero" aria-labelledby="home-title">
    <div class="home-hero__identity">
      <span id="home-title" class="home-hero__brand">AMU LIVE STYLE</span>
      <span class="home-hero__eyebrow">一个人的长期档案，持续更新中</span>
      <blockquote class="home-hero__quote"><span class="home-hero__quote-zh">过人的智慧是人类最大的财富</span><span class="home-hero__quote-en">Wit beyond measure<br />is man's greatest treasure.</span></blockquote>
      <nav class="home-hero__channels" aria-label="主页内容频道"><RouterLink to="/projects">折腾</RouterLink><RouterLink to="/posts">观察</RouterLink><RouterLink to="/listen">听见</RouterLink><RouterLink to="/gallery">看见</RouterLink></nav>
      <a class="home-hero__bilibili" :href="BILIBILI_PROFILE_URL" target="_blank" rel="noopener noreferrer">Bilibili<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 5h8v8" /><path d="M5 15 15 5" /></svg></a>
    </div>
    <div class="home-hero__portrait"><img src="/img/portrait-hero.png" alt="Creator portrait" width="1254" height="1254" loading="eager" fetchpriority="high" decoding="sync" /></div>
  </header>
</template>
<style scoped>
.home-hero {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: var(--theme-spacing-xxl);
  background: transparent;
  animation: home-rise 360ms cubic-bezier(.2,.8,.2,1) both;
}
.home-hero__identity, .home-hero__portrait { min-width: 0; padding: var(--theme-spacing-xl); }
.home-hero__identity {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-height: min(620px, calc(100vh - 6rem));
}
.home-hero__portrait {
  flex: 0.9;
  overflow: hidden;
  border-radius: 0 var(--theme-radius-lg) var(--theme-radius-lg) 0;
}
.home-hero__portrait img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.home-hero__brand { color: var(--theme-primary); font-family: var(--theme-font-mono); font-size: clamp(2.3rem, 6vw, 5.5rem); font-weight: 800; letter-spacing: -.02em; line-height: .9; animation: home-rise 280ms 240ms cubic-bezier(.2,.8,.2,1) both; }
.home-hero__eyebrow { margin-top: var(--theme-spacing-lg); color: var(--theme-on-background); font-size: var(--theme-font-size-sm); opacity: .68; animation: home-rise 240ms 320ms cubic-bezier(.2,.8,.2,1) both; }
.home-hero__quote { display: grid; gap: var(--theme-spacing-sm); margin: var(--theme-spacing-xl) 0; padding-left: var(--theme-spacing-md); border-left: 2px solid var(--theme-primary); }
.home-hero__quote-zh { font-size: clamp(1.5rem, 3vw, 2.6rem); font-weight: 650; line-height: 1.35; animation: home-rise 280ms 400ms cubic-bezier(.2,.8,.2,1) both; }
.home-hero__quote-en { color: var(--theme-on-background); font-size: var(--theme-font-size-base); font-style: italic; line-height: 1.45; opacity: .7; animation: home-rise 240ms 480ms cubic-bezier(.2,.8,.2,1) both; }
.home-hero__channels { display: flex; flex-wrap: wrap; gap: var(--theme-spacing-xs); animation: home-rise 240ms 560ms cubic-bezier(.2,.8,.2,1) both; }
.home-hero__channels a, .home-hero__bilibili { display: inline-flex; align-items: center; gap: var(--theme-spacing-xs); min-height: 2rem; padding: var(--theme-spacing-xs) var(--theme-spacing-md); border-radius: var(--theme-radius-pill); color: var(--theme-on-background); font-family: var(--theme-font-mono); font-size: var(--theme-font-size-sm); text-decoration: none; }
.home-hero__channels a { background: var(--theme-scrim); } .home-hero__channels a:hover { background: var(--theme-surfaceVariant); }
.home-hero__bilibili { margin-top: var(--theme-spacing-lg); color: var(--theme-primary); background: var(--theme-scrim); animation: home-rise 240ms 640ms cubic-bezier(.2,.8,.2,1) both; }
.home-hero__bilibili svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
@keyframes home-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 767px) {
  .home-hero { flex-direction: column; }
  .home-hero__identity, .home-hero__portrait { padding: var(--theme-spacing-lg); }
  .home-hero__identity { min-height: auto; border-radius: var(--theme-radius-lg) var(--theme-radius-lg) 0 0; }
  .home-hero__portrait { flex: none; width: 100%; aspect-ratio: 1 / 1; align-self: auto; border-radius: 0 0 var(--theme-radius-lg) var(--theme-radius-lg); }
}
@media (prefers-reduced-motion: reduce) { .home-hero, .home-hero * { animation: none !important; } }
</style>