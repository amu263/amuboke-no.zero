import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL } from 'node:url'
import { promises as fs, readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import matter from 'gray-matter'
import type { ViteSSGOptions } from 'vite-ssg'
import Markdown from './src/plugins/markdown-loader'
import sharp from 'sharp'
import viteSharp from 'vite-plugin-sharp'

// ── Per-post SEO: read frontmatter from markdown files using Node.js ──────────────────────────────────
// This runs at config time (Node.js), not via import.meta.glob which doesn't work in config files.

// Resolve the content directory path relative to the project root
const __dirname = dirname(fileURLToPath(import.meta.url))
const contentDir = join(__dirname, 'src/content/posts')

interface PostSeoMeta {
  title?: string
  date?: string
  tags?: string[]
  cover?: string
  summary?: string
}

// Read all .md files in the posts directory
function loadPostSeoMap(): Record<string, { title: string; description: string; date?: string; cover?: string; tags?: string[] }> {
  const seoMap: Record<string, { title: string; description: string; date?: string; cover?: string; tags?: string[] }> = {}
  try {
    const files = readdirSync(contentDir).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const slug = file.replace(/\.md$/, '')
      const filePath = join(contentDir, file)
      const raw = readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)
      const fm = data as PostSeoMeta
      const routePath = `/posts/${slug}`
      // gray-matter parses YAML dates as Date objects; handle both string and Date
      let dateStr: string | undefined
      if (fm.date) {
        if (typeof fm.date === 'string') {
          dateStr = fm.date.slice(0, 10)
        } else if (fm.date && typeof fm.date === 'object' && 'toISOString' in fm.date) {
          dateStr = (fm.date as Date).toISOString().slice(0, 10)
        }
      }
      seoMap[routePath] = {
        title: fm.title ? `${fm.title} | AMU LIVE STYLE` : `${slug} | AMU LIVE STYLE`,
        description: fm.summary ?? '',
        date: dateStr,
        cover: fm.cover,
        tags: fm.tags
      }
    }
  } catch (err) {
    console.warn('[vite-ssg] Could not load post SEO map:', err)
  }
  return seoMap
}

const POST_SEO_MAP = loadPostSeoMap()

// ── Per-page SEO metadata for SSG prerendering ─────────────────────────────────
const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'AMU LIVE STYLE — 一个人的长期档案',
    description: '一个人的长期档案，持续更新中。涵盖文章、图集、项目，音乐等内容的个人博客。',
  },
  '/posts': {
    title: '观察 — 文章列表 | AMU LIVE STYLE',
    description: '所有文章列表，按日期倒序排列。涵盖技术笔记、项目思考与生活观察。',
  },
  '/gallery': {
    title: '看见 — 图集 | AMU LIVE STYLE',
    description: '所有图集与照片，包括旅行、风光、日常生活等影像记录。',
  },
  '/projects': {
    title: '折腾 — 项目列表 | AMU LIVE STYLE',
    description: '所有项目与实验，按状态分类。记录折腾与创造的过程。',
  },
  '/listen': {
    title: '听见 — 音乐档案 | AMU LIVE STYLE',
    description: '音乐档案元数据，按专辑整理。记录听觉体验与音乐品味。',
  },
  '/friends': {
    title: '友链 | AMU LIVE STYLE',
    description: '同频朋友的链接，志同道合的站点推荐。',
  },
  '/demo': {
    title: 'UI 组件实验室 | AMU LIVE STYLE',
    description: '极客风 UI 组件展示页面，测试和演示用。',
  },
}

const DEFAULT_SEO = {
  title: 'amuboke-no.zero',
  description: '个人博客 · 极客风骨架',
}

function applyPageSeo(route: string, html: string): string {
  const normalized = route.replace(/\/$/, '') || '/'

  // First check per-post SEO from frontmatter
  const postSeo = POST_SEO_MAP[normalized]
  let seo = postSeo ?? PAGE_SEO[normalized]

  // Fall back to parent routes
  if (!seo) {
    for (const [baseRoute, meta] of Object.entries(PAGE_SEO)) {
      if (normalized.startsWith(baseRoute + '/') || route.startsWith(baseRoute + '/')) {
        seo = meta
        break
      }
    }
  }
  if (!seo) seo = DEFAULT_SEO

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${seo.title}</title>`
  )

  // Replace or add <meta name="description">
  if (/<meta name="description"/.test(html)) {
    html = html.replace(
      /<meta name="description" content="[^"]*"/i,
      `<meta name="description" content="${seo.description}">`
    )
  } else {
    html = html.replace(
      /(<meta name="viewport"[^>]*>)/i,
      `$1\n  <meta name="description" content="${seo.description}">`
    )
  }

  // Add Open Graph tags for posts with cover image
  if (postSeo?.cover) {
    if (!/<meta property="og:image"/.test(html)) {
      html = html.replace(
        /(<meta name="viewport"[^>]*>)/i,
        `$1\n  <meta property="og:image" content="${postSeo.cover}">`
      )
    }
  }

  // Add article:published_time for posts
  if (postSeo && (postSeo as any).date) {
    if (!/<meta property="article:published_time"/.test(html)) {
      html = html.replace(
        /(<meta name="viewport"[^>]*>)/i,
        `$1\n  <meta property="article:published_time" content="${(postSeo as any).date}">`
      )
    }
  }

  // Add article:tag for posts
  if (postSeo?.tags?.length) {
    for (const tag of postSeo.tags) {
      if (!/<meta property="article:tag" content="${tag}"/.test(html)) {
        html = html.replace(
          /(<meta name="viewport"[^>]*>)/i,
          `$1\n  <meta property="article:tag" content="${tag}">`
        )
      }
    }
  }

  return html
}

const ssgOptions: ViteSSGOptions = {
  script: 'async',
  formatting: 'minify',
  crittersOptions: false,
  dirStyle: 'nested',
  onBeforePageRender(route, html) {
    return applyPageSeo(route, html)
  },
} satisfies ViteSSGOptions

// Vite + vite-ssg + Vuetify + UnoCSS + 自写 markdown loader
// 详见 AGENTS.md §5
async function collectFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectFiles(path))
    else files.push(path)
  }
  return files
}

function optimizePublicImages() {
  let outDir = 'dist'
  return {
    name: 'optimize-public-images',
    apply: 'build' as const,
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir
    },
    async closeBundle() {
      const files = await collectFiles(outDir)
      const rasterFiles = files.filter((file) => /\.(png|jpe?g)$/i.test(file))
      const replacements = new Map<string, string>()
      for (const file of rasterFiles) {
        const webp = file.replace(/\.(png|jpe?g)$/i, '.webp')
        await sharp(file).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(webp)
        const relative = file.slice(outDir.length + 1).replaceAll('\\', '/')
        replacements.set('/' + relative, '/' + relative.replace(/\.(png|jpe?g)$/i, '.webp'))
        // Keep the original in dist: Windows may still hold Vite's copied file.
        // All generated HTML/JS references below point to the WebP instead.
      }
      if (!replacements.size) return
      const textFiles = (await collectFiles(outDir)).filter((file) => /\.(html|js|css|json|map)$/i.test(file))
      for (const file of textFiles) {
        let text = await fs.readFile(file, 'utf8')
        for (const [from, to] of replacements) text = text.replaceAll(from, to)
        await fs.writeFile(file, text)
      }
    }
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~content': fileURLToPath(new URL('./src/content', import.meta.url))
    }
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true, styles: { configFile: 'src/styles/vuetify-settings.scss' } }),
    UnoCSS(),
    Markdown(),
    optimizePublicImages(),
    // LCP 优化：统一输出 WebP 格式，质量 90%
    viteSharp({
      // @ts-ignore vite-plugin-sharp types are incomplete for webp quality/format
      format: 'webp',
      webp: {
        quality: 90,
        effort: 4,
      },
      exclude: ['**/portrait-hero.png', '**/portrait-hero.jpg', '**/portrait-hero.jpeg']
    } as any),
  ],
  ssgOptions,
  ssr: {
    noExternal: ['vuetify']
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'vuetify']
  },
  server: {
    fs: { strict: true },
    watch: { usePolling: true, interval: 400 }
  }
})
