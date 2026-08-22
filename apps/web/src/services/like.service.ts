// AGENTS.md §8: 点赞服务接口 + mock 实现
// mock/real 切换点：services/like.service.ts 里的 LikeServiceImpl
import type { LikeResponse, PostLikePayload } from '@/types'

export interface LikeService {
  getLikeCount(slug: string): Promise<number>
  postLike(payload: PostLikePayload): Promise<LikeResponse>
}

// ── Mock 实现（内存 + setTimeout 模拟网络延迟）───────────────────────────────
const MOCK_LIKE_COUNTS: Record<string, number> = {
  'hello-world': 42
}

let mockNextFingerprint = 1000

class MockLikeServiceImpl implements LikeService {
  private counts: Record<string, number> = { ...MOCK_LIKE_COUNTS }
  private liked = new Set<string>()

  async getLikeCount(slug: string): Promise<number> {
    await new Promise(r => setTimeout(r, 150))
    return this.counts[slug] ?? 0
  }

  async postLike(payload: PostLikePayload): Promise<LikeResponse> {
    await new Promise(r => setTimeout(r, 250))
    const key = `${payload.slug}-${payload.fingerprint}`
    if (!this.liked.has(key)) {
      this.liked.add(key)
      this.counts[payload.slug] = (this.counts[payload.slug] ?? 0) + 1
    }
    return { count: this.counts[payload.slug] }
  }
}

// ── Real 实现（HTTP 调用，契约见 AGENTS.md §8）───────────────────────────────
// 注意：后端契约只有 POST /api/like { slug, fingerprint } → { count }
//       getLikeCount 用 fingerprint='__count__' 询问计数，不重复点赞
class RealLikeServiceImpl implements LikeService {
  private base = '/api'

  async getLikeCount(slug: string): Promise<number> {
    // 用 __count__ fingerprint 让后端只返回计数，不记用户点赞
    const res = await fetch(`${this.base}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, fingerprint: '__count__' })
    })
    if (!res.ok) throw new Error(`getLikeCount failed: ${res.status}`)
    const data = (await res.json()) as LikeResponse
    return data.count
  }

  async postLike(payload: PostLikePayload): Promise<LikeResponse> {
    const res = await fetch(`${this.base}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`postLike failed: ${res.status}`)
    return res.json() as Promise<LikeResponse>
  }
}

// ── 切换点：修改这里切换 mock / real ────────────────────────────────────────
export const likeService: LikeService = new MockLikeServiceImpl()
// export const likeService: LikeService = new RealLikeServiceImpl()
