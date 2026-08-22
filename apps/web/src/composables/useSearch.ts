// AGENTS.md §8: Static search — Fuse.js client-side fuzzy search
// Index is built at build time (from build-time-index), no runtime IO
// AGENTS.md §9.5: No heavy search framework

import { ref } from 'vue'
import Fuse from 'fuse.js'
import {
  POSTS,
  GALLERIES,
  PROJECTS,
  FRIENDS,
  LISTENS,
} from '@/content/build-time-index'

// ── Search record ────────────────────────────────────────────────────────
export type SearchableType = 'post' | 'gallery' | 'project' | 'friend' | 'listen'

export interface SearchRecord {
  type: SearchableType
  slug: string
  title: string
  summary?: string
  tags?: readonly string[]
  /** Route path for navigation */
  href: string
}

const ALL_RECORDS: SearchRecord[] = [
  // posts
  ...POSTS.map(p => ({
    type: 'post' as SearchableType,
    slug: p.slug,
    title: p.title ?? p.slug,
    summary: p.summary,
    tags: p.tags,
    href: `/posts/${p.slug}`,
  })),
  // galleries
  ...GALLERIES.map(g => ({
    type: 'gallery' as SearchableType,
    slug: g.slug,
    title: g.title,
    summary: g.summary,
    tags: undefined,
    href: `/gallery/${g.slug}`,
  })),
  // projects
  ...PROJECTS.map(p => ({
    type: 'project' as SearchableType,
    slug: p.slug,
    title: p.name,
    summary: p.summary,
    tags: p.tech,
    href: '/projects',
  })),
  // friends
  ...FRIENDS.map(f => ({
    type: 'friend' as SearchableType,
    slug: f.name,
    title: f.name,
    summary: f.bio,
    tags: f.tags,
    href: f.url,
  })),
  // listens
  ...LISTENS.map(l => ({
    type: 'listen' as SearchableType,
    slug: l.slug,
    title: l.title,
    summary: l.summary,
    tags: l.genres as readonly string[],
    href: `/listen/${l.slug}`,
  })),
]

export interface SearchResult {
  item: SearchRecord
  score: number
}

// Fuse instance is created lazily (shared across all callers)
let _fuse: Fuse<SearchRecord> | null = null

function getFuse(): Fuse<SearchRecord> {
  if (!_fuse) {
    _fuse = new Fuse(ALL_RECORDS, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'summary', weight: 0.25 },
        { name: 'tags', weight: 0.15 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
    })
  }
  return _fuse
}

export function useSearch() {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const isSearching = ref(false)

  function search(q: string) {
    query.value = q
    if (!q.trim() || q.trim().length < 2) {
      results.value = []
      return
    }
    isSearching.value = true
    try {
      const fuse = getFuse()
      const raw = fuse.search(q.trim(), { limit: 12 })
      results.value = raw.map(r => ({
        item: r.item,
        score: r.score ?? 1,
      }))
    } finally {
      isSearching.value = false
    }
  }

  function clear() {
    query.value = ''
    results.value = []
  }

  return { query, results, isSearching, search, clear }
}