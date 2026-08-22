// AGENTS.md §8: 点赞 composable，委托给 services
import { ref } from 'vue'
import { likeService } from '@/config/services'
import type { PostLikePayload } from '@/types'

export function useLike(slug: string) {
  const count = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasLiked = ref(false)

  function getFingerprint(): string {
    // 简单 fingerprint：用 userAgent + 屏幕宽高拼一个伪 ID
    // 真实场景应由后端签发 session / JWT
    const key = `liked_${slug}`
    const stored = localStorage.getItem(key)
    if (stored) {
      hasLiked.value = true
      return stored
    }
    const fp = [
      navigator.userAgent,
      screen.width,
      screen.height,
      Date.now()
    ].join('::')
    hasLiked.value = false
    return fp
  }

  async function fetchCount() {
    loading.value = true
    error.value = null
    try {
      // 优先从 localStorage 读取已点赞状态
      const fp = getFingerprint()
      const baseCount = await likeService.getLikeCount(slug)
      // 如果用户已点赞（fp 存在），说明他之前点过，
      // 服务端 baseCount 已经包含他的点赞；如果没点过，直接用 baseCount
      count.value = baseCount
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载点赞数失败'
    } finally {
      loading.value = false
    }
  }

  async function doLike() {
    if (hasLiked.value) return // 已点赞，不重复计数
    error.value = null
    const fingerprint = getFingerprint()
    const payload: PostLikePayload = { slug, fingerprint }
    try {
      const result = await likeService.postLike(payload)
      count.value = result.count
      hasLiked.value = true
      localStorage.setItem(`liked_${slug}`, fingerprint)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '点赞失败'
    }
  }

  return { count, loading, error, hasLiked, fetchCount, doLike }
}
