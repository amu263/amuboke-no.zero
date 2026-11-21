/* ----------------------------------------------------------------
 * theme-bridge.js — 经典站 ↔ ZZZ 主题切换（ZZZ 侧）
 *
 * 点击右上角切换按钮时：
 *   1. 记录按钮中心点，作为圆形扩散的圆心（sessionStorage 跨文档传递）
 *   2. 立即把 favicon / theme-color 换成经典站那一套
 *   3. 支持跨文档 View Transition 的浏览器直接导航，由目标页做圆形裁切；
 *      不支持的浏览器用同款圆形帘幕兜底
 * 另外接管文章页的点赞与 giscus 评论（与经典站同一套数据/配置）。
 * ---------------------------------------------------------------- */
(() => {
  'use strict'

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

  // 当前主题与三主题目标
  const CURRENT = 'zzz'
  const THEME_FAVICON = {
    classic: '/favicon.ico',
    zzz: '/zzz/assets/img/favicon.svg',
    genshin: '/genshin/assets/img/favicon.svg',
  }
  const THEME_COLOR = {
    classic: '#f0f2f5',
    zzz: '#0a0a0a',
    genshin: '#0b1220',
  }
  const THEME_ASSETS = {
    genshin: [
      '/genshin/assets/css/genshin-tokens.css',
      '/genshin/assets/css/genshin.css',
      '/genshin/assets/css/genshin-bridge.css',
      '/genshin/assets/js/site.js',
      '/genshin/assets/js/theme-bridge.js',
    ],
  }

  function setFavicon(target) {
    const href = THEME_FAVICON[target]
    if (!href) return
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove())
    const link = document.createElement('link')
    link.rel = 'icon'
    if (href.endsWith('.svg')) link.type = 'image/svg+xml'
    link.href = href
    document.head.appendChild(link)
  }

  function setThemeColor(target) {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta && THEME_COLOR[target]) meta.setAttribute('content', THEME_COLOR[target])
  }

  function switchTheme(option, trigger) {
    const target = option?.dataset.themeOption
    if (!target || target === CURRENT) return
    const url = option.getAttribute('href')
    if (!url) return
    // 首访启动帘幕还在时按钮不可见；避免把帘幕截进圆形快照。
    if (document.documentElement.classList.contains('booting')) return
    const rect = trigger.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const payload = {
      x,
      y,
      r: Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
      sy: window.scrollY || 0,
      from: CURRENT,
      to: target,
    }
    try {
      window.sessionStorage.setItem('amu-theme-switch', JSON.stringify(payload))
      window.sessionStorage.setItem('amu-boot', '1')
      if (target === 'classic') window.sessionStorage.setItem('amuboke-no.zero:boot-splash', '1')
    } catch { /* 隐私模式：退化为普通导航 */ }
    setFavicon(target)
    setThemeColor(target)
    // 圆扩散在目标页的 arrival 脚本里完成；这里只负责记录圆心并导航。
    window.location.assign(url)
  }

  /* -------- 三主题选择器 -------- */
  const picker = $('[data-theme-picker]')
  const trigger = picker ? $('.theme-picker__trigger', picker) : null
  const menu = picker ? $('.theme-picker__menu', picker) : null
  const options = $$('[data-theme-option]')

  const closeMenu = () => {
    if (!picker || !menu) return
    picker.classList.remove('is-open')
    menu.hidden = true
    trigger?.setAttribute('aria-expanded', 'false')
  }
  const toggleMenu = () => {
    if (!picker || !menu || !trigger) return
    const open = menu.hidden
    picker.classList.toggle('is-open', open)
    menu.hidden = !open
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false')
    if (open) $('[data-theme-option]', menu)?.focus()
  }

  if (picker && menu && trigger) {
    trigger.addEventListener('click', (e) => { e.preventDefault(); toggleMenu() })
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeMenu(); trigger.focus() }
    })
    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target)) closeMenu()
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { closeMenu(); trigger.focus() }
    })
  }

  let prefetched = new Set()
  function prefetchTarget(target) {
    if (!target || target === CURRENT || prefetched.has(target)) return
    prefetched.add(target)
    const option = options.find((o) => o.dataset.themeOption === target)
    const url = option?.getAttribute('href')
    if (!url) return
    const docLink = document.createElement('link')
    docLink.rel = 'prefetch'
    docLink.as = 'document'
    docLink.href = url
    document.head.appendChild(docLink)
    if (target === 'classic') {
      // 经典站是带 hash 的 Vue bundle：读 HTML 再预热 css/js。
      fetch(url, { credentials: 'same-origin' })
        .then((res) => res.text())
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html')
          const seen = new Set()
          doc.querySelectorAll('link[rel="stylesheet"][href], link[rel="modulepreload"][href], script[src]').forEach((el) => {
            const href = el.getAttribute('href') || el.getAttribute('src') || ''
            if (!href.startsWith('/') || seen.has(href)) return
            seen.add(href)
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.as = el.tagName === 'SCRIPT' ? 'script' : 'style'
            link.href = href
            document.head.appendChild(link)
          })
        })
        .catch(() => { /* 预取失败不影响切换 */ })
    } else {
      for (const href of THEME_ASSETS[target] || []) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = href.endsWith('.js') ? 'script' : 'style'
        link.href = href
        document.head.appendChild(link)
      }
    }
  }

  options.forEach((option) => {
    const target = option.dataset.themeOption
    option.addEventListener('click', (e) => {
      if (target === CURRENT) { e.preventDefault(); closeMenu(); return }
      e.preventDefault()
      closeMenu()
      if (trigger) switchTheme(option, trigger)
    })
    option.addEventListener('pointerenter', () => prefetchTarget(target))
    option.addEventListener('focus', () => prefetchTarget(target))
    option.addEventListener('pointerdown', () => prefetchTarget(target))
    option.addEventListener('touchstart', () => prefetchTarget(target), { passive: true })
  })

  /* -------- 文章页：点赞 -------- */
  const likeBtn = $('[data-like]')
  if (likeBtn) {
    const slug = likeBtn.dataset.likeSlug || ''
    const countEl = $('[data-like-count]', likeBtn)
    const baseCount = slug === 'hello-world' ? 42 : 0
    let count = baseCount
    let liked = false
    try { liked = Boolean(window.localStorage.getItem('liked_' + slug)) } catch { /* 隐私模式 */ }
    const render = () => {
      if (countEl) countEl.textContent = String(count)
      likeBtn.classList.toggle('is-liked', liked)
      likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false')
      likeBtn.title = liked ? '已点赞' : '点赞这篇文章'
    }
    if (liked) count = baseCount + 1
    render()
    likeBtn.addEventListener('click', () => {
      if (liked) return
      liked = true
      count += 1
      try { window.localStorage.setItem('liked_' + slug, '1') } catch { /* ignore */ }
      render()
    })
  }

  /* -------- 文章页：giscus 评论（与经典站共用同一 discussion） -------- */
  const mount = $('[data-giscus]')
  if (mount) {
    const term = mount.dataset.term || window.location.pathname
    let loaded = false
    const load = () => {
      if (loaded) return
      loaded = true
      const script = document.createElement('script')
      script.src = 'https://giscus.app/client.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.setAttribute('data-repo', 'amu263/gisdiscus')
      script.setAttribute('data-repo-id', 'R_kgDOUBKHMw')
      script.setAttribute('data-category', 'Announcements')
      script.setAttribute('data-category-id', 'DIC_kwDOUBKHM84DD_cL')
      script.setAttribute('data-mapping', 'specific')
      script.setAttribute('data-term', term)
      script.setAttribute('data-strict', '0')
      script.setAttribute('data-reactions-enabled', '1')
      script.setAttribute('data-emit-metadata', '0')
      script.setAttribute('data-input-position', 'top')
      script.setAttribute('data-theme', 'noborder_light')
      script.setAttribute('data-lang', 'zh-CN')
      script.setAttribute('data-loading', 'lazy')
      mount.appendChild(script)
    }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          load()
        }
      }, { rootMargin: '600px 0px' })
      io.observe(mount)
    } else {
      load()
    }
  }
})()
