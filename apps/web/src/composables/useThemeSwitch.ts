// 经典站 → ZZZ / 提瓦特主题：路由映射 + 从按钮触点圆形扩散。
//
// 三个主题都是独立的静态页面（/、/zzz/、/genshin/）。点击时把按钮圆心 /
// 半径 / 滚动位置写进 sessionStorage；目标页在 <head> 里先铺一层「旧主题底色」，
// 再用 CSS mask 的圆形挖洞把新页面露出来（见 index.html 的 arrival 脚本）。
// 不依赖跨文档 View Transition，每次切换、每个支持 mask 的浏览器都一致。

export type ThemeId = 'classic' | 'zzz' | 'genshin'

export interface ThemeSwitchPayload {
  x: number
  y: number
  r: number
  sy: number
  from: 'classic'
  to: ThemeId
}

const CLASSIC_TO_ZZZ_SLUG: Record<string, string> = {
  'about-me': 'about',
  '给洛洛的一封信': 'gei-luoluo-de-yi-feng-xin'
}
const ZZZ_TO_CLASSIC_SLUG: Record<string, string> = {
  about: 'about-me',
  'gei-luoluo-de-yi-feng-xin': '给洛洛的一封信'
}

/** 把任意主题地址归一化成内容相对路径：'' / posts / posts/<slug> / gallery/<slug> … */
function contentPath(pathname: string): string {
  let p = pathname || '/'
  if (p.startsWith('/zzz/')) p = p.slice('/zzz/'.length)
  else if (p.startsWith('/genshin/')) p = p.slice('/genshin/'.length)
  p = p.replace(/index\.html$/, '').replace(/^\/+/, '').replace(/\/+$/, '')
  if (p === 'archive') p = 'posts'
  if (p === 'posts/about-me') p = 'about'
  return p
}

function zzzSlug(slug: string): string {
  return CLASSIC_TO_ZZZ_SLUG[slug] ?? slug
}
function classicSlug(slug: string): string {
  return ZZZ_TO_CLASSIC_SLUG[slug] ?? slug
}

/** 当前页面 → 目标主题对应路由。 */
export function themeUrl(target: ThemeId, pathname: string): string {
  const p = contentPath(pathname)

  if (target === 'classic') {
    if (!p) return '/'
    if (p === 'about') return '/posts/about-me/'
    if (p === 'posts') return '/posts/'
    if (p.startsWith('posts/')) {
      return '/posts/' + encodeURIComponent(classicSlug(decodeURIComponent(p.slice(6)))) + '/'
    }
    if (p === 'gallery' || p.startsWith('gallery/') || p === 'listen' || p.startsWith('listen/')) {
      return '/' + p + '/'
    }
    if (p === 'projects' || p.startsWith('projects/')) return '/projects/'
    if (p === 'friends') return '/friends/'
    return '/'
  }

  const base = target === 'zzz' ? '/zzz/' : '/genshin/'
  if (!p) return base
  if (p === 'about') return base + 'about/'
  if (p === 'posts') return base + 'posts/'
  if (p.startsWith('posts/')) {
    return base + 'posts/' + encodeURIComponent(zzzSlug(decodeURIComponent(p.slice(6)))) + '/'
  }
  if (p === 'gallery' || p.startsWith('gallery/') || p === 'listen' || p.startsWith('listen/')) {
    return base + p + '/'
  }
  if (p === 'projects' || p.startsWith('projects/')) return base + 'projects/'
  if (p === 'friends') return base + 'friends/'
  return base
}

function setFavicon(href: string, type: string): void {
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = type
  link.href = href
  document.head.appendChild(link)
}

function setThemeMeta(target: ThemeId): void {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) return
  meta.setAttribute('content', target === 'zzz' ? '#0a0a0a' : target === 'genshin' ? '#0b1220' : '#f0f2f5')
}

/** 从经典站切到目标主题；button 的几何中心就是圆形扩散圆心。 */
export function switchTheme(target: ThemeId, button: HTMLElement): void {
  if (typeof window === 'undefined' || target === 'classic') return
  // 首访帘幕还在播放时不响应：那时用户看不到按钮，切过去会截到帘幕。
  if (document.documentElement.classList.contains('booting')) return
  button.dataset.switching = '1'
  window.setTimeout(() => delete button.dataset.switching, 2500)
  // 用地址栏而不是 route.path：hydration 之前 route 可能还没解析出当前页。
  const url = themeUrl(target, window.location.pathname)
  const rect = button.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const payload: ThemeSwitchPayload = {
    x, y,
    r: Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
    sy: window.scrollY || 0,
    from: 'classic',
    to: target
  }
  try {
    window.sessionStorage.setItem('amu-theme-switch', JSON.stringify(payload))
    // 跳过目标主题的首访启动帘幕：主题切换要无缝。
    window.sessionStorage.setItem('amu-boot', '1')
    window.sessionStorage.setItem('amuboke-no.zero:boot-splash', '1')
  } catch {
    /* 隐私模式：退化为普通导航 */
  }
  if (target === 'zzz') {
    setFavicon('/zzz/assets/img/favicon.svg', 'image/svg+xml')
  } else {
    setFavicon('/genshin/assets/img/favicon.svg', 'image/svg+xml')
  }
  setThemeMeta(target)
  window.location.assign(url)
}

/** 兼容旧调用；内部转成三主题选择。 */
export function switchToZzz(button: HTMLElement): void {
  switchTheme('zzz', button)
}
export function toZzzPath(path: string): string {
  return themeUrl('zzz', path)
}

const PREFETCH: Record<Exclude<ThemeId, 'classic'>, Array<{ href: string; as: 'style' | 'script' | 'font' }>> = {
  zzz: [
    { href: '/zzz/assets/css/zzz-tokens.css', as: 'style' },
    { href: '/zzz/assets/css/site.css', as: 'style' },
    { href: '/zzz/assets/css/theme-bridge.css', as: 'style' },
    { href: '/zzz/assets/js/site.js', as: 'script' },
    { href: '/zzz/assets/js/theme-bridge.js', as: 'script' },
    { href: '/zzz/assets/fonts/anton-latin.woff2', as: 'font' },
    { href: '/zzz/assets/fonts/archivo-black-latin.woff2', as: 'font' }
  ],
  genshin: [
    { href: '/genshin/assets/css/genshin-tokens.css', as: 'style' },
    { href: '/genshin/assets/css/genshin.css', as: 'style' },
    { href: '/genshin/assets/css/genshin-bridge.css', as: 'style' },
    { href: '/genshin/assets/js/site.js', as: 'script' },
    { href: '/genshin/assets/js/theme-bridge.js', as: 'script' }
  ]
}
const prefetched = new Set<string>()

/** 悬停 / 聚焦 / 按下时预取目标页 HTML 和阻塞资源，让第一次切换也够快。 */
export function prefetchTheme(target: Exclude<ThemeId, 'classic'>): void {
  if (typeof document === 'undefined') return
  const url = themeUrl(target, window.location.pathname)
  if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'document'
    link.href = url
    document.head.appendChild(link)
  }
  if (prefetched.has(target)) return
  prefetched.add(target)
  for (const asset of PREFETCH[target]) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = asset.as
    link.href = asset.href
    if (asset.as === 'font') link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }
}

/** 兼容旧名字。 */
export function prefetchZzz(): void {
  prefetchTheme('zzz')
}
