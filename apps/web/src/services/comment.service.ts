// AGENTS.md §8: 评论服务接口 + mock 实现
// mock/real 切换点：services/comment.service.ts 里的 CommentServiceImpl
import type { Comment, PostCommentPayload } from '@/types'

export interface CommentService {
  getComments(slug: string): Promise<Comment[]>
  postComment(payload: PostCommentPayload): Promise<Comment>
}

// ── Mock 实现（本地 + setTimeout 模拟网络延迟）───────────────────────────────
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'mock-1',
    slug: 'hello-world',
    name: 'Alice',
    body: '这篇文章写得真棒！',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'mock-2',
    slug: 'hello-world',
    name: 'Bob',
    body: '学习了，感谢分享喵~',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
]

let mockNextId = 100

class MockCommentServiceImpl implements CommentService {
  private store: Comment[] = [...MOCK_COMMENTS]

  async getComments(slug: string): Promise<Comment[]> {
    await new Promise(r => setTimeout(r, 200))
    return this.store.filter(c => c.slug === slug).slice()
  }

  async postComment(payload: PostCommentPayload): Promise<Comment> {
    await new Promise(r => setTimeout(r, 300))
    const comment: Comment = {
      id: `mock-${mockNextId++}`,
      slug: payload.slug,
      name: payload.name || '匿名',
      body: payload.body,
      parent: payload.parent,
      createdAt: new Date().toISOString()
    }
    this.store.push(comment)
    return comment
  }
}

// ── Real 实现（HTTP 调用，契约见 AGENTS.md §8）───────────────────────────────
class RealCommentServiceImpl implements CommentService {
  private base = '/api'

  async getComments(slug: string): Promise<Comment[]> {
    const res = await fetch(`${this.base}/comment?slug=${encodeURIComponent(slug)}`)
    if (!res.ok) throw new Error(`getComments failed: ${res.status}`)
    return res.json() as Promise<Comment[]>
  }

  async postComment(payload: PostCommentPayload): Promise<Comment> {
    const res = await fetch(`${this.base}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`postComment failed: ${res.status}`)
    return res.json() as Promise<Comment>
  }
}

// ── 切换点：修改这里切换 mock / real ────────────────────────────────────────
export const commentService: CommentService = new MockCommentServiceImpl()
// export const commentService: CommentService = new RealCommentServiceImpl()
