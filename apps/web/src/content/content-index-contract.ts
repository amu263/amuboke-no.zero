export const CHANNELS = ['折腾', '观察', '听见', '看见'] as const
export type Channel = (typeof CHANNELS)[number]

export const CONTENT_TYPES = ['project', 'post', 'listen', 'gallery'] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export type ListenTrack = {
  readonly title: string
  readonly duration?: string
}

export type ListenMeta = {
  readonly slug: string
  readonly title: string
  readonly artist: string
  readonly album: string
  readonly year: number
  readonly genres: readonly string[]
  readonly date?: string
  readonly cover?: string
  readonly summary?: string
  readonly links?: { readonly external?: string }
  readonly tracks?: readonly ListenTrack[]
  readonly channels?: readonly Channel[]
}

export type IndexSourceItem = {
  readonly type: ContentType
  readonly slug: string
  readonly title: string
  readonly date?: string
  readonly channels?: readonly Channel[]
}

export type ChannelContentItem = IndexSourceItem & {
  readonly nativeChannel: Channel
  readonly channels: readonly Channel[]
  readonly href: string
}

export type RecentUpdate = ChannelContentItem & {
  readonly date: string
}

export type ActivityHeatmapDay = {
  readonly date: string          // ISO date string, e.g. "2025-01-01"
  readonly count: number        // number of entries on this day
  readonly level: 0 | 1 | 2 | 3 | 4
  readonly entries: readonly RecentUpdate[]
}

/** One full year of daily heatmap data */
export type ActivityHeatmapYear = {
  readonly year: number
  /** All days of the year (Jan 1 → Dec 31), 365 or 366 records */
  readonly days: readonly ActivityHeatmapDay[]
}

export type ContentIndex = {
  readonly byChannel: Readonly<Record<Channel, readonly ChannelContentItem[]>>
  readonly recentUpdates: readonly RecentUpdate[]
  readonly activityHeatmap: readonly ActivityHeatmapYear[]
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const KEBAB_CASE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

class ContentValidationError extends Error {
  readonly source: string

  constructor(source: string, message: string) {
    super(`${source}: ${message}`)
    this.name = 'ContentValidationError'
    this.source = source
  }
}

class UnknownChannelError extends Error {
  readonly channel: string

  constructor(channel: string) {
    super(`channels contains unknown value "${channel}"`)
    this.name = 'UnknownChannelError'
    this.channel = channel
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isChannel(value: string): value is Channel {
  return CHANNELS.some((channel) => channel === value)
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function requireString(
  record: Readonly<Record<string, unknown>>,
  field: string,
  source: string
): string {
  const value = record[field]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ContentValidationError(source, `${field} must be a non-empty string`)
  }
  return value
}

function optionalString(
  record: Readonly<Record<string, unknown>>,
  field: string,
  source: string
): string | undefined {
  const value = record[field]
  if (value === undefined) return undefined
  if (typeof value !== 'string') {
    throw new ContentValidationError(source, `${field} must be a string`)
  }
  return value
}

function requireStringArray(value: unknown, field: string, source: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new ContentValidationError(source, `${field} must be an array of strings`)
  }
  const values: string[] = []
  for (const rawEntry of value) {
    const entry: unknown = rawEntry
    if (typeof entry !== 'string') {
      throw new ContentValidationError(source, `${field} must be an array of strings`)
    }
    values.push(entry)
  }
  return Object.freeze(values)
}

export function parseChannels(value: unknown): readonly Channel[] {
  if (value === undefined) return Object.freeze([])
  if (!Array.isArray(value)) {
    throw new ContentValidationError('content', 'channels must be an array of strings')
  }
  const channels = new Set<Channel>()
  for (const rawEntry of value) {
    const entry: unknown = rawEntry
    if (typeof entry !== 'string') {
      throw new ContentValidationError('content', 'channels must be an array of strings')
    }
    if (!isChannel(entry)) throw new UnknownChannelError(entry)
    channels.add(entry)
  }
  return Object.freeze(Array.from(channels))
}

function parseListenLinks(value: unknown, source: string): ListenMeta['links'] {
  if (value === undefined) return undefined
  if (!isRecord(value)) {
    throw new ContentValidationError(source, 'links must be an object')
  }
  return Object.freeze({ external: optionalString(value, 'external', source) })
}

function parseListenTracks(value: unknown, source: string): ListenMeta['tracks'] {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    throw new ContentValidationError(source, 'tracks must be an array')
  }
  const tracks: ListenTrack[] = []
  for (const [index, entry] of value.entries()) {
    const trackSource = `${source}.tracks[${index}]`
    if (!isRecord(entry)) {
      throw new ContentValidationError(trackSource, 'track must be an object')
    }
    tracks.push(Object.freeze({
      title: requireString(entry, 'title', trackSource),
      duration: optionalString(entry, 'duration', trackSource)
    }))
  }
  return Object.freeze(tracks)
}

export function parseListen(source: string, value: unknown): ListenMeta {
  if (!isRecord(value)) {
    throw new ContentValidationError(source, 'listen entry must be an object')
  }
  const slug = requireString(value, 'slug', source)
  const filename = source.split('/').pop()?.replace(/\.json$/, '') ?? ''
  if (slug !== filename) {
    throw new ContentValidationError(source, 'slug must match the filename')
  }
  if (!KEBAB_CASE_PATTERN.test(filename) || !KEBAB_CASE_PATTERN.test(slug)) {
    throw new ContentValidationError(source, 'filename and slug must use kebab-case')
  }
  const year = value['year']
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new ContentValidationError(source, 'year must be a four-digit integer')
  }
  const date = optionalString(value, 'date', source)
  if (date !== undefined && !isIsoDate(date)) {
    throw new ContentValidationError(source, 'date must be an ISO date')
  }
  return Object.freeze({
    slug,
    title: requireString(value, 'title', source),
    artist: requireString(value, 'artist', source),
    album: requireString(value, 'album', source),
    year,
    genres: requireStringArray(value['genres'], 'genres', source),
    date,
    cover: optionalString(value, 'cover', source),
    summary: optionalString(value, 'summary', source),
    links: parseListenLinks(value['links'], source),
    tracks: parseListenTracks(value['tracks'], source),
    channels: parseChannels(value['channels'])
  })
}
