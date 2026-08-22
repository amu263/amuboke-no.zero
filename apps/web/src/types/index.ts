// AGENTS.md §8: 后端接口契约类型定义
// 与 POST /api/comment、GET /api/comment、POST /api/like 对齐

export interface Comment {
  id: string
  slug: string
  name?: string
  body: string
  parent?: string
  createdAt: string
}

export interface LikeResponse {
  count: number
}

export interface MediaToken {
  url: string
  expiresAt: string
}

export interface PostCommentPayload {
  slug: string
  name?: string
  body: string
  parent?: string
}

export interface PostLikePayload {
  slug: string
  fingerprint: string
}
