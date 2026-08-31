// AGENTS.md §1 §3 单元 3 硬规则: 四类内容构建期定型、可渲染、构建期索引生成。
// AGENTS.md §9.4: 内容走 SSG，构建期定型 — 运行时不再做 IO / 不再 parse。
//
// 这个文件是「构建期索引」的唯一来源：
//   - posts    → import.meta.glob 把 posts/*.md 当 eager ESM 拿进来，拿到 frontmatter + html
//   - gallery  → import.meta.glob 把 gallery/*.json 当 eager ESM 拿进来
//   - projects → import.meta.glob 把 projects/*.json 当 eager ESM 拿进来
//   - friends  → import.meta.glob 把 friends/*.json 当 eager ESM 拿进来
//   - listen   → import.meta.glob 把 listen/*.json 当 eager ESM 拿进来
//
// 页面壳只 import 这一个文件，不再各自 glob。AGENTS §2 硬规则：写内容的人只能动
// content/ 下文件；这个文件作为「内容→代码」的唯一桥，桥的代码归开发者维护。

import { computed } from 'vue'
import {
  parseChannels,
  parseListen,
  type Channel,
  type IndexSourceItem,
  type ListenMeta
} from './content-index-contract'
import { buildContentIndex } from './content-index-aggregation'

export { CHANNELS, CONTENT_TYPES } from './content-index-contract'
export type {
  ActivityHeatmapYear,
  Channel,
  ChannelContentItem,
  ContentIndex,
  ContentType,
  ListenMeta,
  ListenTrack,
  RecentUpdate
} from './content-index-contract'

// ─────────────────────────────────────────────────────────────────────────────
// posts (.md)：与 markdown-loader 协议。`?frontmatter` query 拿到 frontmatter+html，
//               `default` 拿到模块对象 { frontmatter, html }。
// ─────────────────────────────────────────────────────────────────────────────
export interface PostFrontmatter {
  title?: string
  date?: string
  tags?: string[]
  cover?: string
  summary?: string
  channels?: readonly string[]
}
export interface PostMeta extends PostFrontmatter {
  slug: string
  channels?: readonly Channel[]
  /** 构建期定型：markdown 渲染后的 HTML 字符串。页面壳直接 v-html。 */
  html: string
}

const postModules = import.meta.glob<{ frontmatter: PostFrontmatter; html: string }>(
  './posts/*.md',
  { eager: true, query: '?frontmatter', import: 'default' }
)

const POSTS_RAW: PostMeta[] = Object.entries(postModules)
  .map(([path, mod]) => {
    const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? path
    return {
      slug,
      html: mod.html ?? '',
      title: mod.frontmatter?.title,
      date: mod.frontmatter.date?.slice(0, 10),
      tags: mod.frontmatter?.tags ?? [],
      cover: mod.frontmatter?.cover,
      summary: mod.frontmatter?.summary,
      channels: parseChannels(mod.frontmatter?.channels)
    }
  })
  .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))

/** 构建期定型：posts 全量列表。运行时不再触发 glob / parse。 */
export const POSTS: readonly PostMeta[] = Object.freeze(POSTS_RAW)
export const POSTS_BY_SLUG: Readonly<Record<string, PostMeta>> = Object.freeze(
  POSTS_RAW.reduce<Record<string, PostMeta>>((acc, p) => {
    acc[p.slug] = p
    return acc
  }, {})
)

/** 按 tag 分桶；空 tag 不进。构建期定型。 */
export const POSTS_BY_TAG: Readonly<Record<string, readonly PostMeta[]>> = Object.freeze(
  POSTS_RAW.reduce<Record<string, PostMeta[]>>((acc, p) => {
    for (const t of p.tags ?? []) {
      ;(acc[t] ||= []).push(p)
    }
    return acc
  }, {})
)

export interface PostTagCloudItem {
  tag: string
  count: number
}

/** 文章标签云：构建期统计，新增文章标签会自动进入。 */
export const POST_TAG_CLOUD: readonly PostTagCloudItem[] = Object.freeze(
  Object.entries(POSTS_BY_TAG)
    .map(([tag, posts]) => ({ tag, count: posts.length }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
)

// ─────────────────────────────────────────────────────────────────────────────
// gallery / projects / friends (.json)：AGENTS §3 字段约定
// ─────────────────────────────────────────────────────────────────────────────
export interface GalleryPhoto {
  src: string
  alt: string
  caption?: string
  exif?: Record<string, string | number>
}
export interface GalleryMeta {
  slug: string
  title: string
  date: string
  summary?: string
  cover?: string
  photos: GalleryPhoto[]
  channels?: readonly Channel[]
}

export interface ProjectMeta {
  slug: string
  name: string
  summary: string
  tech: string[]
  date?: string
  status?: 'active' | 'archived' | 'wip'
  links?: { repo?: string; demo?: string; docs?: string; [k: string]: string | undefined }
  readme?: string
  channels?: readonly Channel[]
}

export interface FriendMeta {
  name: string
  url: string
  avatar?: string
  bio?: string
  tags?: string[]
}

type GalleryInput = Omit<GalleryMeta, 'channels'> & { readonly channels?: unknown }
type ProjectInput = Omit<ProjectMeta, 'channels'> & { readonly channels?: unknown }

const galleryModules = import.meta.glob<GalleryInput>('./gallery/*.json', { eager: true })
const projectModules = import.meta.glob<ProjectInput>('./projects/*.json', { eager: true })
const friendModules = import.meta.glob<FriendMeta>('./friends/*.json', { eager: true })
const listenModules = import.meta.glob<unknown>('./listen/*.json', {
  eager: true,
  import: 'default'
})

const GALLERY_RAW: GalleryMeta[] = Object.entries(galleryModules)
  .map(([path, m]) => ({
    ...m,
    slug: m.slug ?? path.split('/').pop()?.replace(/\.json$/, '') ?? path,
    channels: parseChannels(m.channels)
  }))
  .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))

const PROJECTS_RAW: ProjectMeta[] = Object.entries(projectModules)
  .map(([path, m]) => ({
    ...m,
    slug: m.slug ?? path.split('/').pop()?.replace(/\.json$/, '') ?? path,
    channels: parseChannels(m.channels)
  }))
  .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')))

const FRIENDS_RAW: FriendMeta[] = Object.values(friendModules).slice()
const LISTENS_RAW: ListenMeta[] = Object.entries(listenModules)
  .map(([path, value]) => parseListen(path, value))
  .sort((a, b) => {
    const byDate = String(b.date ?? '').localeCompare(String(a.date ?? ''))
    return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug)
  })

export const GALLERIES: readonly GalleryMeta[] = Object.freeze(GALLERY_RAW)
export const PROJECTS: readonly ProjectMeta[] = Object.freeze(PROJECTS_RAW)
export const FRIENDS: readonly FriendMeta[] = Object.freeze(FRIENDS_RAW)
export const LISTENS: readonly ListenMeta[] = Object.freeze(LISTENS_RAW)

export const GALLERY_BY_SLUG: Readonly<Record<string, GalleryMeta>> = Object.freeze(
  GALLERY_RAW.reduce<Record<string, GalleryMeta>>((acc, g) => {
    acc[g.slug] = g
    return acc
  }, {})
)
export const PROJECT_BY_SLUG: Readonly<Record<string, ProjectMeta>> = Object.freeze(
  PROJECTS_RAW.reduce<Record<string, ProjectMeta>>((acc, p) => {
    acc[p.slug] = p
    return acc
  }, {})
)

const INDEX_SOURCES: readonly IndexSourceItem[] = Object.freeze([
  ...PROJECTS_RAW.map((project) => ({
    type: 'project' as const,
    slug: project.slug,
    title: project.name,
    date: project.date,
    channels: project.channels
  })),
  ...POSTS_RAW.map((post) => ({
    type: 'post' as const,
    slug: post.slug,
    title: post.title ?? post.slug,
    date: post.date,
    channels: post.channels
  })),
  ...LISTENS_RAW.map((listen) => ({
    type: 'listen' as const,
    slug: listen.slug,
    title: listen.title,
    date: listen.date,
    channels: listen.channels
  })),
  ...GALLERY_RAW.map((gallery) => ({
    type: 'gallery' as const,
    slug: gallery.slug,
    title: gallery.title,
    date: gallery.date,
    channels: gallery.channels
  }))
])

const CONTENT_INDEX = buildContentIndex(INDEX_SOURCES)
export const CONTENT_BY_CHANNEL = CONTENT_INDEX.byChannel
export const RECENT_UPDATES = CONTENT_INDEX.recentUpdates
export const ACTIVITY_HEATMAP = CONTENT_INDEX.activityHeatmap

// ─────────────────────────────────────────────────────────────────────────────
// 单一函数入口：聚合四类元数据给首页（卡片导航）+ 路由生成
// ─────────────────────────────────────────────────────────────────────────────
export interface ContentSummary {
  posts: number
  galleries: number
  projects: number
  listens: number
  friends: number
  tags: readonly string[]
}

export function getContentSummary(): ContentSummary {
  const tags = new Set<string>()
  for (const p of POSTS_RAW) for (const t of p.tags ?? []) tags.add(t)
  return {
    posts: POSTS_RAW.length,
    galleries: GALLERY_RAW.length,
    projects: PROJECTS_RAW.length,
    listens: LISTENS_RAW.length,
    friends: FRIENDS_RAW.length,
    tags: Object.freeze(Array.from(tags).sort())
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 路径生成器：写路由的人用这俩函数，不要散写字符串拼接
// ─────────────────────────────────────────────────────────────────────────────
export function postRoute(slug: string): string {
  return `/posts/${slug}`
}
export function galleryRoute(slug: string): string {
  return `/gallery/${slug}`
}
export function projectRoute(slug: string): string {
  return `/projects/${slug}`
}

// 兼容 reactive 消费方：computed(() => POSTS) 直接可用，因为 readonly 数组是 frozen
export const postsReactive = computed(() => POSTS)
export const galleriesReactive = computed(() => GALLERIES)
export const projectsReactive = computed(() => PROJECTS)
export const friendsReactive = computed(() => FRIENDS)
