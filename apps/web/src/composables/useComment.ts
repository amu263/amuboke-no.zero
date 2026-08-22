// AGENTS.md §8: 评论 composable，委托给 services
import { ref } from 'vue'
import { commentService } from '@/config/services'
import type { Comment, PostCommentPayload } from '@/types'

export function useComment(slug: string) {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchComments() {
    loading.value = true
    error.value = null
    try {
      comments.value = await commentService.getComments(slug)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载评论失败'
    } finally {
      loading.value = false
    }
  }

  async function submitComment(payload: Omit<PostCommentPayload, 'slug'>) {
    error.value = null
    try {
      const comment = await commentService.postComment({ ...payload, slug })
      comments.value.push(comment)
      return comment
    } catch (e) {
      error.value = e instanceof Error ? e.message : '提交评论失败'
      throw e
    }
  }

  return { comments, loading, error, fetchComments, submitComment }
}
