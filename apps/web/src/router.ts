import type { RouteRecordRaw, RouterScrollBehavior } from 'vue-router'
import { usePageMeta, type PageMeta } from '@/composables/usePageMeta'
import { POSTS_BY_SLUG } from '@/content/build-time-index'

// 单元 3: posts / gallery / projects / friends / listen 五个内容入口
// 全部走 SSG（构建期定型，AGENTS §9.4）

// ── Route-level page meta for SEO ────────────────────────────────────────────
// Each route defines its own pageMeta so the router.beforeEach guard can apply
// og:title, og:description, og:image, twitter:* tags per page.
interface RouteMeta {
  pageMeta?: {
    title: string
    description?: string
    ogImage?: string
  }
}

export const routes: (RouteRecordRaw & RouteMeta)[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/index.vue'),
    meta: {
      pageMeta: {
        title: '首页',
        description: 'AMU LIVE STYLE — 一个人的长期档案，持续更新中。涵盖文章、图集、项目、音乐等内容的个人博客。',
      },
    },
  },
  {
    path: '/posts',
    name: 'posts',
    component: () => import('@/pages/posts/index.vue'),
    meta: {
      pageMeta: {
        title: '观察 — 文章列表',
        description: '所有文章列表，按日期倒序排列。',
      },
    },
  },
  {
    path: '/posts/:slug',
    name: 'post',
    component: () => import('@/pages/posts/[slug].vue'),
    meta: { pageMeta: { title: '文章详情' } },
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/pages/gallery/index.vue'),
    meta: {
      pageMeta: {
        title: '看见 — 图集',
        description: '所有图集与照片。',
      },
    },
  },
  {
    path: '/gallery/:slug',
    name: 'gallery-detail',
    component: () => import('@/pages/gallery/[slug].vue'),
    meta: { pageMeta: { title: '图集详情' } },
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/pages/projects/index.vue'),
    meta: {
      pageMeta: {
        title: '折腾 — 项目列表',
        description: '所有项目与实验，按状态分类。',
      },
    },
  },
  {
    path: '/listen',
    name: 'listen',
    component: () => import('@/pages/listen/index.vue'),
    meta: {
      pageMeta: {
        title: '听见 — 音乐档案',
        description: '音乐档案元数据，按专辑整理。',
      },
    },
  },
  {
    path: '/listen/:slug',
    name: 'listen-detail',
    component: () => import('@/pages/listen/[slug].vue'),
    meta: { pageMeta: { title: '音乐档案详情' } },
  },
  {
    path: '/friends',
    name: 'friends',
    component: () => import('@/pages/friends/index.vue'),
    meta: {
      pageMeta: {
        title: '友链',
        description: '同频朋友的链接。',
      },
    },
  },
  {
    path: '/demo',
    name: 'demo',
    component: () => import('@/pages/demo.vue'),
    meta: {
      pageMeta: {
        title: 'UI 组件实验室',
        description: '极客风 UI 组件展示。',
      },
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' },
  },
]

// ── Scroll restoration ────────────────────────────────────────────────────────
// AGENTS.md §5 #17 提醒: ViteSSG prerender 不需要浏览器滚动，
// 但运行时用户 back/forward 时需要恢复滚动位置。
// Strategy: manual — we restore via sessionStorage key per path.
export const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    // back/forward navigation: restore saved scroll position
    return savedPosition
  }
  // New navigation: always scroll to top
  return { top: 0 }
}

// ── Router guard: apply page meta on every navigation ───────────────────────
// This is exported so entry-client.ts can register it with the router instance.
export function registerSeoGuard(router: any) {
  const { apply, reset } = usePageMeta()

  router.beforeEach((to: any, from: any) => {
    // Determine the effective pageMeta for this route
    let meta: PageMeta | undefined

    // Handle post routes: look up post frontmatter dynamically
    if (to.name === 'post') {
      const slug = to.params?.slug
      if (slug && POSTS_BY_SLUG[slug]) {
        const post = POSTS_BY_SLUG[slug]
        meta = {
          title: post.title ?? slug,
          description: post.summary ?? '',
          ogImage: post.cover,
          fullTitle: post.title ? `${post.title} | AMU LIVE STYLE` : `${slug} | AMU LIVE STYLE`,
        }
      }
    }

    // Handle gallery-detail routes
    if (to.name === 'gallery-detail') {
      // Gallery detail uses the static pageMeta from route
      meta = (to.meta as RouteMeta)?.pageMeta
    }

    // Handle listen-detail routes
    if (to.name === 'listen-detail') {
      meta = (to.meta as RouteMeta)?.pageMeta
    }

    // For other routes, use the static pageMeta from route definition
    if (!meta) {
      meta = (to.meta as RouteMeta)?.pageMeta
    }

    if (meta) {
      apply(meta)
    } else {
      reset()
    }

    // Scroll restoration: save current scroll position before leaving
    if (from.name && typeof window !== 'undefined') {
      const key = 'scroll_' + (from.name as string)
      sessionStorage.setItem(key, String(window.scrollY))
    }
    // Restore scroll position if we have a saved one for this route
    if (to.name && typeof window !== 'undefined') {
      const key = 'scroll_' + (to.name as string)
      const saved = sessionStorage.getItem(key)
      if (saved !== null) {
        // We need to restore after navigation — use nextTick
        setTimeout(() => window.scrollTo(0, parseInt(saved, 10)), 0)
      }
    }
  })
}
