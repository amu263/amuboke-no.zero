import { nextTick, ref } from 'vue'
import type { Router } from 'vue-router'

export type NavigationStatus = 'idle' | 'loading' | 'error'

const status = ref<NavigationStatus>('idle')
let registered = false

export function useNavigationLoading() {
  return { status }
}

/**
 * Keep the visual loading hand-off around the router transaction.
 * The overlay is released only after the new route has rendered once.
 */
export function registerNavigationLoading(router: Router): void {
  if (registered) return
  registered = true

  // AGENTS.md §5 #38 — the FIRST navigation is not a navigation, it is the
  // hydration of the prerendered route. Flipping status to 'loading' there makes
  // app.vue render its v-if overlay, a node the SSR markup does not contain, so
  // Vue bails out of hydration and re-creates the whole subtree: every CSS
  // entrance animation restarts (the home hero visibly fades in twice) and the
  // page is rebuilt from scratch on every route. The initial paint is already
  // covered by the prerendered HTML (or by the boot splash on a first visit), so
  // the overlay only belongs to later, genuinely client-side navigations.
  let initialNavigation = true

  router.beforeEach(() => {
    if (initialNavigation) return
    status.value = 'loading'
  })

  router.afterEach(async () => {
    if (initialNavigation) {
      initialNavigation = false
      return
    }
    await nextTick()
    requestAnimationFrame(() => {
      status.value = 'idle'
    })
  })

  router.onError(() => {
    // Keep the last stable page visible when a lazy route chunk fails.
    status.value = 'error'
    requestAnimationFrame(() => {
      status.value = 'idle'
    })
  })
}
