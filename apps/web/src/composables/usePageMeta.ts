// AGENTS.md §8: usePageMeta — SEO composable, no heavy head management lib
// Uses native document.title / meta tags, zero extra deps

export interface PageMeta {
  title: string
  description?: string
  ogImage?: string
  /** Override full <title> (default: `${title} | AMU LIVE STYLE`) */
  fullTitle?: string
}

const DEFAULT_TITLE = 'AMU LIVE STYLE'
const DEFAULT_DESCRIPTION = '一个人的长期档案，持续更新中。涵盖文章、图集、项目、音乐等内容的个人博客。'

function setMetaTag(name: string, content: string, property = false): void {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta() {
  function apply(meta: PageMeta) {
    const fullTitle = meta.fullTitle ?? (meta.title ? `${meta.title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE)
    document.title = fullTitle
    const desc = meta.description ?? DEFAULT_DESCRIPTION
    setMetaTag('description', desc)
    setMetaTag('og:title', fullTitle, true)
    setMetaTag('og:description', desc, true)
    setMetaTag('og:type', 'website', true)
    const ogImage = meta.ogImage ?? '/og-default.png'
    setMetaTag('og:image', ogImage, true)
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', fullTitle)
    setMetaTag('twitter:description', desc)
    setMetaTag('twitter:image', ogImage)
  }

  function reset() {
    document.title = DEFAULT_TITLE
    setMetaTag('description', DEFAULT_DESCRIPTION)
    setMetaTag('og:title', DEFAULT_TITLE, true)
    setMetaTag('og:description', DEFAULT_DESCRIPTION, true)
    setMetaTag('og:type', 'website', true)
    setMetaTag('og:image', '/og-default.png', true)
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', DEFAULT_TITLE)
    setMetaTag('twitter:description', DEFAULT_DESCRIPTION)
    setMetaTag('twitter:image', '/og-default.png')
  }

  return { apply, reset, DEFAULT_TITLE, DEFAULT_DESCRIPTION }
}