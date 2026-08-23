// AGENTS.md §8: 评论服务接口 + mock 实现
// mock/real 切换点：services/comment.service.ts 里的 CommentServiceImpl
//
// 注意：评论真实接入使用 giscus (GitHub Discussions)
// giscus 通过 <iframe> 内嵌方式工作，不走这里的服务方法。
// GiscusComments.vue 组件直接加载 giscus iframe，本文件保留作架构边界。
//
// 接入 giscus 步骤：
// 1. 访问 https://giscus.app/zh-CN 配置你的仓库，获取以下值：
//    - repo: "username/repo"
//    - repoId: "R_xxxxxx"
//    - category: "Comments"
//    - categoryId: "DIC_xxxxxx"
// 2. 在 posts/[slug].vue 的 <GiscusComments> 上填入这些值
// 3. 同时在 GitHub 仓库 Settings > Discussions 开启 Discussions 功能
//
// 如需切换回 mock，注释掉 posts/[slug].vue 里的 GiscusComments，
// 换回 CommentList + CommentForm 即可（基础设施都保留着）
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

// ── Real 实现：giscus (GitHub Discussions) ─────────────────────────────────
// giscus 通过 <iframe> 渲染评论区，不走这里的服务方法。
// GiscusComments.vue 组件直接调用 giscus API（postMessage + iframe）。
// 本实现仅作占位，保留 CommentService 接口契约。
class GiscusCommentServiceImpl implements CommentService {
  async getComments(_slug: string): Promise<Comment[]> {
    // giscus iframe 自己管理评论，无需这里拉取
    // 如需获取评论数，参见 GiscusComments.vue 的 message 事件监听
    return []
  }

  async postComment(_payload: PostCommentPayload): Promise<Comment> {
    // 评论提交由 giscus iframe 自己处理
    throw new Error('use GiscusComments component for posting comments')
  }
}

// ── 切换点：修改这里切换 mock / real ────────────────────────────────────────
// 目前已切换为 giscus，posts/[slug].vue 使用 <GiscusComments> 组件
export const commentService: CommentService = new MockCommentServiceImpl()
// export const commentService: CommentService = new GiscusCommentServiceImpl()
