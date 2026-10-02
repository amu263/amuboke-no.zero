import type { Plugin } from 'vite'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'
import { compileScript, parse } from '@vue/compiler-sfc'

// AGENTS.md §5 #10: 不要把 markdown 当 HTML 解析；显式禁用原始 HTML、脚本、iframe
// AGENTS.md §5 #15: 自写 Vite plugin 处理 .md 必须 enforce: 'pre'（在 @vitejs/plugin-vue 之前）
// AGENTS.md §5 #16: 自写 .md plugin 还必须提供 `load` 钩子返回源串。
//   Vite 6 的内置 asset pipeline 会按扩展名优先匹配 `.md`，如果 plugin 只声明
//   `transform`、没有 `load`，Vite 会先把它当 raw asset 短路，根本不会调到
//   `transform`，更不会调 `resolveId`。解法：plugin `load(id)` 对 `.md` 路径
//   直接 return 源串，Vite 就不会走 asset 分支。
//   注：`id` 形如 `C:\...\hello-world.md?frontmatter`，Vite 不会剥 query，`transform(code, id)` 里的 id 也带 query。
// AGENTS.md §5 #17 (本会话新增): 自写 .md plugin 的「默认形态」必须自己用
//   `@vue/compiler-sfc` 把 SFC 编译成 JS，**不能返回 SFC 字符串**。
//   Vite 的 transform 链一旦 plugin 返回 `{ code }` 就终止，后续 normal plugin
//   （@vitejs/plugin-vue）不会接手。模块 id 仍是 .md，vue plugin 的 filter 是
//   `*.vue(?:$|\?)`，对 `.md` 不匹配 → import-analysis 把 SFC 当 JS 解析 → 报
//   "Failed to parse source ... invalid JS syntax"，错误指在 <template>。
//   解法：直接调 compileScript({ inlineTemplate: true })，把 <template> + <script>
//   一次性编出 JS。本实现不使用 <style scoped>，把 markdown-body 的样式放到
//   全局 base.css 里 — 既省掉虚拟 CSS 模块的复杂度，又避免 scoped hash 漂移。
// AGENTS.md §9.1: 自写轻量 loader，不引重型 SSG 框架
//
// 设计：每个 .md 文件产出两个等价的"模块形态"，由 query 决定：
//   - 默认（无 query）       → 一个编译好的 Vue 组件 ESM（可直接被 import）
//   - 带 query `?frontmatter` → ESM 模块：default export = frontmatter 对象，
//                              还提供 `html` 具名导出（编译后的 HTML）

const renderer = new marked.Renderer()

marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false
})

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// AGENTS.md §5 #10: 永远不渲染原始 HTML；逃逸后回退到 <code> 文本
renderer.html = (token) => {
  return `<p>${escapeHtml(String(token.text ?? ''))}</p>`
}

// Unit 4 Todo 6: wrap every fenced code block in a keyboard-focusable region
// container. The visible marker is `role="region"` + `aria-label="Code"` + `tabindex="0"`
// so screen-reader/keyboard users can reach the block and scroll long content.
// Class `code-region` is the styling hook consumed by base.css (rainbow-glass +
// `overflow-x: auto` for horizontal scroll that's isolated from the document).
renderer.code = ({ text, lang, escaped }: TokensCode) => {
  // marked's default code() already trims a trailing newline + re-appends one,
  // and applies its own escape() when `escaped` is false. We mirror that here
  // so the markdown contract stays identical to upstream behavior.
  const body = String(text ?? '').replace(/\n$/, '') + '\n'
  const langClass = lang ? ` class="language-${escapeHtml(String(lang))}"` : ''
  const safeBody = escaped ? body : escapeHtml(body)
  return (
    `<div role="region" aria-label="Code" tabindex="0" class="code-region">` +
    `<pre><code${langClass}>${safeBody}</code></pre>` +
    `</div>\n`
  )
}

// Minimal structural type for the marked token we consume. We don't pull in the
// full @types/marked here; the field shape is the only contract we rely on.
type TokensCode = { text?: string; lang?: string; escaped?: boolean }

// ── 文章抬头横幅（banner）—— 目录约定，不碰源文件 frontmatter ────────────────
// 约定：`public/images/posts/<slug>/banner.(png|jpg|jpeg|webp|avif)` 存在时，
// 构建期自动把它挂为该文章的抬头横幅。这样从外部导入的文章（frontmatter 里
// 没有 cover / 没有路径字段）只要图片按目录放好，就能显示抬头横幅。
// 返回的是 public 资源 URL（原样交给浏览器，浏览器自行做百分号编码）。
const POST_BANNER_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif'] as const

const PROJECT_ROOT = (() => {
  const fromFile = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  return existsSync(join(fromFile, 'src', 'content', 'posts')) ? fromFile : process.cwd()
})()

export function resolvePostBanner(slug: string): string | undefined {
  if (!slug) return undefined
  for (const ext of POST_BANNER_EXTENSIONS) {
    const rel = `/images/posts/${slug}/banner.${ext}`
    if (existsSync(join(PROJECT_ROOT, 'public', rel.replace(/^\//, '')))) return rel
  }
  return undefined
}

function splitId(id: string): { path: string; query: string | undefined } {
  const qIdx = id.indexOf('?')
  if (qIdx < 0) return { path: id, query: undefined }
  return { path: id.slice(0, qIdx), query: id.slice(qIdx + 1) }
}

export default function markdown(): Plugin {
  return {
    name: 'amuboke-markdown-loader',
    enforce: 'pre',

    // AGENTS.md §5 #16: 必须提供 `load`，否则 Vite 6 会把 .md 走 asset pipeline 短路。
    async load(id) {
      const { path } = splitId(id)
      if (!path.endsWith('.md')) return null
      const filePath = path.startsWith('file://') ? fileURLToPath(path) : path
      try {
        return await readFile(filePath, 'utf-8')
      } catch {
        return null
      }
    },

    transform(code, id) {
      const { path, query } = splitId(id)
      if (!path.endsWith('.md')) return null

      const slug = basename(path).replace(/\.md$/, '')
      // 抬头横幅：目录约定自动挂载（见 resolvePostBanner）。有 banner 时并入
      // frontmatter，页面壳统一从 frontmatter 读取，不需要额外的数据源。
      const banner = resolvePostBanner(slug)

      if (query === 'frontmatter') {
        const { data, content } = matter(code)
        const frontmatter = banner ? { ...data, banner } : data
        const html = marked.parse(content, { async: false, renderer }) as string
        return {
          code:
            `export const frontmatter = ${JSON.stringify(frontmatter)};\n` +
            `export const html = ${JSON.stringify(html)};\n` +
            `export default { frontmatter, html };\n`,
          map: null
        }
      }

      if (query === undefined || query === 'vue') {
        // 默认形态：用 @vue/compiler-sfc 自编译 SFC → import-analysis 能直接吃的 JS。
        // AGENTS.md §5 #17
        const { data, content } = matter(code)
        const frontmatter = banner ? { ...data, banner } : data
        const html = marked.parse(content, { async: false, renderer }) as string
        const safeFrontmatter = JSON.stringify(frontmatter)
        const safeHtml = JSON.stringify(html)
        const sfcSource = `
<template>
  <article class="markdown-body" v-html="html" />
</template>

<script setup>
const props = defineProps({ html: { type: String, default: '' } })
const html = props.html || ${safeHtml}
defineExpose({ frontmatter: ${safeFrontmatter} })
</script>
`
        const { descriptor } = parse(sfcSource, { filename: path })

        const scriptResult = compileScript(descriptor, {
          id: path,
          inlineTemplate: true
        })

        return { code: scriptResult.content, map: null }
      }

      return null
    }
  }
}
