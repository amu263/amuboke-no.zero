// giscus 配置（https://giscus.app/zh-CN 配置后获取）
// AGENTS.md §8 前端约定：配置只动这一个文件，不硬编码到组件里

export interface GiscusConfig {
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping: 'specific' | 'pathname' | 'title' | 'og:title'
  strict: '0' | '1'
  reactionsEnabled: '0' | '1'
  emitMetadata: '0' | '1'
  inputPosition: 'top' | 'bottom'
  lang: string
}

export const giscusConfig: GiscusConfig = {
  repo: 'amu263/gisdiscus',
  repoId: 'R_kgDOUBKHMw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOUBKHM84DD_cL',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
}
