import {
  isIsoDate,
  type ActivityHeatmapDay,
  type ActivityHeatmapYear,
  type Channel,
  type ChannelContentItem,
  type ContentIndex,
  type ContentType,
  type IndexSourceItem,
  type RecentUpdate
} from './content-index-contract'

const NATIVE_CHANNEL: Readonly<Record<ContentType, Channel>> = Object.freeze({
  project: '折腾',
  post: '观察',
  listen: '听见',
  gallery: '看见'
})

const TYPE_ORDER: Readonly<Record<ContentType, number>> = Object.freeze({
  project: 0,
  post: 1,
  listen: 2,
  gallery: 3
})

const INDEX_ROUTE: Readonly<Record<ContentType, string>> = Object.freeze({
  project: '/projects',
  post: '/posts',
  listen: '/listen',
  gallery: '/gallery'
})

function normalizedDate(value: string | undefined): string | undefined {
  return value !== undefined && isIsoDate(value) ? value : undefined
}

function contentHref(type: ContentType, slug: string): string {
  const route = INDEX_ROUTE[type]
  return type === 'post' ? `${route}/${slug}` : `${route}#${slug}`
}

function compareItems(left: ChannelContentItem, right: ChannelContentItem): number {
  const byDate = String(right.date ?? '').localeCompare(String(left.date ?? ''))
  if (byDate !== 0) return byDate
  const byType = TYPE_ORDER[left.type] - TYPE_ORDER[right.type]
  return byType !== 0 ? byType : left.slug.localeCompare(right.slug)
}

function isDated(item: ChannelContentItem): item is RecentUpdate {
  return item.date !== undefined
}

function dedupeBySlug(items: readonly RecentUpdate[]): readonly RecentUpdate[] {
  const slugs = new Set<string>()
  return Object.freeze(items.filter((item) => {
    if (slugs.has(item.slug)) return false
    slugs.add(item.slug)
    return true
  }))
}

function addUtcDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function mondayOf(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  const daysSinceMonday = (date.getUTCDay() + 6) % 7
  return addUtcDays(value, -daysSinceMonday)
}

// ── Activity Heatmap helpers ────────────────────────────────────────────────

function activityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function dateToYear(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00.000Z').getUTCFullYear()
}

function buildYearDays(year: number, items: readonly RecentUpdate[]): readonly ActivityHeatmapDay[] {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInYear = isLeap ? 366 : 365
  return Object.freeze(Array.from({ length: daysInYear }, (_, i) => {
    const d = new Date(Date.UTC(year, 0, 1 + i))
    const date = d.toISOString().slice(0, 10)
    const entries = Object.freeze(items.filter((item) => item.date === date))
    return Object.freeze({
      date,
      count: entries.length,
      level: activityLevel(entries.length),
      entries
    })
  }))
}

/**
 * Groups content items by year.
 * Returns one ActivityHeatmapYear per unique year (newest first).
 */
function buildHeatmap(items: readonly RecentUpdate[]): readonly ActivityHeatmapYear[] {
  if (items.length === 0) return Object.freeze([])
  const years = [...new Set(items.map((item) => dateToYear(item.date)))].sort((a, b) => b - a)
  return Object.freeze(years.map((year) =>
    Object.freeze({
      year,
      days: buildYearDays(year, items)
    })
  ))
}

export function buildContentIndex(sources: readonly IndexSourceItem[]): ContentIndex {
  const items = sources.map((source): ChannelContentItem => {
    const nativeChannel = NATIVE_CHANNEL[source.type]
    const channels = Object.freeze([
      nativeChannel,
      ...(source.channels ?? []).filter((channel) => channel !== nativeChannel)
    ])
    return Object.freeze({
      ...source,
      date: normalizedDate(source.date),
      nativeChannel,
      channels,
      href: contentHref(source.type, source.slug)
    })
  }).sort(compareItems)

  const mutableByChannel: Record<Channel, ChannelContentItem[]> = {
    折腾: [],
    观察: [],
    听见: [],
    看见: []
  }
  const slugsByChannel: Record<Channel, Set<string>> = {
    折腾: new Set<string>(),
    观察: new Set<string>(),
    听见: new Set<string>(),
    看见: new Set<string>()
  }
  for (const item of items) {
    for (const channel of item.channels) {
      if (slugsByChannel[channel].has(item.slug)) continue
      slugsByChannel[channel].add(item.slug)
      mutableByChannel[channel].push(item)
    }
  }

  const datedItems = items.filter(isDated)
  const dedupedDatedItems = dedupeBySlug(datedItems)
  return Object.freeze({
    byChannel: Object.freeze({
      折腾: Object.freeze(mutableByChannel['折腾']),
      观察: Object.freeze(mutableByChannel['观察']),
      听见: Object.freeze(mutableByChannel['听见']),
      看见: Object.freeze(mutableByChannel['看见'])
    }),
    recentUpdates: Object.freeze(dedupedDatedItems.slice(0, 8)),
    activityHeatmap: buildHeatmap(dedupedDatedItems)
  })
}
