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

  router.beforeEach(() => {
    status.value = 'loading'
  })

  router.afterEach(async () => {
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
