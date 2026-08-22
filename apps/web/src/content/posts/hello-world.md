---
title: 你好，世界
date: 2025-01-01
tags: [meta, hello]
summary: 个人博客骨架的第一篇占位文章，用来验证 `pnpm dev` → 首页 → 文章页这条链路。
---

# 你好，世界

这是一篇**示例文章**，用来验证个人博客骨架是否跑通。

## 单元 1 验收点

- `pnpm dev` 起得来
- 首页 `/` 能渲染
- 文章页 `/posts/hello-world` 能渲染

## 一点代码

```ts
import { marked } from 'marked'
marked.parse('# hi')
```

> 这是 blockquote。文末。