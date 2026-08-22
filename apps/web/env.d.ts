/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  import type { Component } from 'vue'
  const component: Component
  export default component
  export const frontmatter: Record<string, unknown>
  export const html: string
}