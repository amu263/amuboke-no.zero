import { ViteSSG, type ViteSSGOptions } from 'vite-ssg'
import { createHead } from '@unhead/vue'
import App from './app.vue'
import { POSTS, postRoute } from './content/build-time-index'
import { vuetify } from './plugins/vuetify'
import { routes, scrollBehavior, registerSeoGuard } from './router'
import { registerNavigationLoading } from './router-loading'
import 'virtual:uno.css'
// 单元 2: tokens.scss 输出 :root/.v-theme--dark 下的 --theme-* CSS 变量
// 必须在 base.css 之前 import，这样 base 层可以消费这些变量
import './styles/tokens.scss'
import './styles/base.css'

export const createApp = ViteSSG(
  App,
  { routes, scrollBehavior },
  ({ app, router, isClient }) => {
    // AGENTS.md §7: 创建 head 实例并注册到 app
    // @unhead/vue 会在 SSR 阶段把 useHead() 的标签注入到 HTML，
    // 客户端hydration 后自动同步，无需额外工作。
    const head = createHead()
    app.use(head)

    app.use(vuetify)

    // Register scroll restoration + SEO guard
    if (isClient) {
      registerSeoGuard(router)
      registerNavigationLoading(router)
    }
  }
)

export const includedRoutes: NonNullable<ViteSSGOptions['includedRoutes']> = (paths) => [
  ...new Set([
    ...paths.filter((path) => !path.includes(':')),
    ...POSTS.map(({ slug }) => postRoute(slug))
  ])
]