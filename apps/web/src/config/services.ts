// AGENTS.md §8: mock/real 切换只动这 1 个文件
// 其他所有文件 import { commentService } from './comment.service'
//                  import { likeService } from './like.service'
// 不需要改动
export { commentService } from '@/services/comment.service'
export { likeService } from '@/services/like.service'
