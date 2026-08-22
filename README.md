# amuboke-no.zero

> 个人博客 / 作品集 / 音乐档案 —— 用 Vue 3 + Vuetify 3 + Vite SSG 搭的个人站。

[预览站](https://amu263.github.io/amuboke-no.zero)

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3 + TypeScript |
| UI 组件 | Vuetify 3 |
| 构建工具 | Vite 6 + vite-ssg (SSG) |
| 原子类 | UnoCSS |
| 图片处理 | Sharp + vite-plugin-sharp |
| Markdown | 自写轻量 loader (.md + frontmatter) |
| 包管理 | pnpm |

## 项目结构

```
amuboke-no.zero/
├─ apps/web/               # 前端单包（唯一代码目录）
│  ├─ src/
│  │  ├─ pages/           # 路由页面壳（首页 + 各索引/详情页）
│  │  ├─ components/      # Vue 组件（按域分：post/gallery/project/friend/home/ui...）
│  │  ├─ composables/     # Vue Composables（useTheme / useSearch / useComment / useLike）
│  │  ├─ content/         # 内容文件（写内容的人只动这里）
│  │  │  ├─ posts/        # 博客文章（Markdown + YAML frontmatter）
│  │  │  ├─ gallery/      # 图集（JSON: slug/title/photos[]）
│  │  │  ├─ projects/      # 项目（JSON: slug/name/summary/tech[]/links）
│  │  │  ├─ friends/       # 友链（JSON: name/url/avatar/bio/tags）
│  │  │  └─ listen/        # 音乐档案（JSON: slug/title/artist/album/tracks[]）
│  │  ├─ plugins/         # Vuetify / Markdown 配置
│  │  ├─ styles/          # CSS 变量 / 设计 Token / base.css
│  │  └─ data/            # 导航 / 社交链接等常量
│  └─ public/images/       # 静态图片资源
├─ .github/workflows/       # GitHub Actions 部署配置
└─ skills/                  # 博客写作 Skill（/blog-writing 调用）
```

## 快速开始

```bash
# 进入前端目录
cd apps/web

# 安装依赖
pnpm install

# 开发调试（热更新）
pnpm dev        # http://127.0.0.1:5173

# 类型检查
pnpm typecheck

# 构建生产（SSG 静态 HTML）
pnpm build      # 产物在 dist/

# 预览生产构建
pnpm preview
```

## 内容写作

所有内容都在 apps/web/src/content/ 下，写内容的人不需要动任何代码。

### 文章 (posts)

路径：content/posts/<slug>.md

```markdown
---
title: 文章标题
date: 2026-08-23
tags: [标签1, 标签2]
cover: /images/posts/<slug>/cover.jpg
summary: 文章摘要
---

正文内容...
```

### 图集 (gallery)

路径：content/gallery/<slug>.json

```json
{
  "slug": "my-trip",
  "title": "我的旅行",
  "date": "2026-08-23",
  "summary": "描述",
  "cover": "/images/gallery/my-trip/cover.jpg",
  "photos": [
    {
      "src": "/images/gallery/my-trip/01.jpg",
      "alt": "照片描述",
      "caption": "照片标题",
      "exif": {
        "camera": "iPhone 15 Pro",
        "iso": "100",
        "aperture": "f/1.8"
      }
    }
  ]
}
```

### 项目 (projects)

路径：content/projects/<slug>.json

```json
{
  "slug": "my-project",
  "name": "我的项目",
  "summary": "项目简介",
  "tech": ["Vue 3", "TypeScript", "Vuetify 3"],
  "status": "active",
  "links": {
    "github": "https://github.com/username/repo",
    "demo": "https://demo.example.com"
  },
  "readme": "README 内容（可选）"
}
```

### 友链 (friends)

路径：content/friends/<slug>.json

```json
{
  "name": "网站名称",
  "url": "https://example.com",
  "avatar": "/images/friends/avatar.png",
  "bio": "网站描述",
  "tags": ["标签1", "标签2"]
}
```

### 音乐档案 (listen)

路径：content/listen/<slug>.json

```json
{
  "slug": "album-name",
  "title": "专辑名",
  "artist": "艺术家",
  "album": "专辑名",
  "year": 2026,
  "genres": ["流行", "电子"],
  "date": "2026-08-23",
  "cover": "/images/listen/album.jpg",
  "summary": "描述",
  "links": {
    "music": "https://music.example.com/album"
  },
  "tracks": [
    { "title": "歌曲1", "duration": "3:45" }
  ]
}
```

## 设计特点

- **暗/亮双主题**：Vuetify 3 原生支持，两套颜色 Token 全部显式声明
- **极客风 UI**：UnoCSS 原子类 + 自定义组件（GlowButton / TerminalCard / MonoChip...）
- **网格背景**：Obsidian 风格网格纹理，增强极客氛围
- **CJK 断行优化**：针对中文/英文混排的 word-break / line-break 策略

## 部署

GitHub Actions 自动部署到 GitHub Pages。每次 push 到 main 分支自动触发构建。

详见 .github/DEPLOY.md

## 友链

欢迎交换友链！可以在 /friends 页面查看现有友链，或提交 PR 添加。

## AGENTS.md

本项目的 AI 协作约定、陷阱清单、技术决策记录在 AGENTS.md，所有 AI 会话必须遵守。
