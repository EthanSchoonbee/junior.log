# Personal Developer Blog

An Astro blog built around a Pika-style blog layout, but powered by local markdown files.

## Features

- Markdown posts in `src/content/posts`
- Required metadata for title, description, author, publish date, and tags
- Latest, archive, and per-tag pages
- Inline home feed search
- Obsidian-friendly features:
  - Mermaid diagrams
  - Callouts like `> [!NOTE]`, `> [!TIP]`, and `> [!HINT]`
  - Raw HTML inside markdown
  - Wiki links like `[[slug|Label]]`
  - Image embeds like `![[/images/example.png|Caption|original]]` or `![[/images/example.png|Caption|full]]`
- Pure white light mode and pure black dark mode
- Shuffleable theme palette with manual light/dark toggle
- Full article template with icon header, footer metadata, and previous/next navigation

## Writing a post

Create a new markdown file in `src/content/posts`, for example:

```md
---
title: My new post
description: A short summary for cards and SEO.
author: Ethan
publishedAt: 2026-04-05
tags:
  - astro
  - notes
readingTime: 5 min read
---

Your content goes here.
```

You can also start from [`/Users/ethan.schoonbee/Development/personal/blog/templates/post-template.md`](/Users/ethan.schoonbee/Development/personal/blog/templates/post-template.md).

There is also a full markdown showcase post in [`/Users/ethan.schoonbee/Development/personal/blog/src/content/posts/markdown-showcase.md`](/Users/ethan.schoonbee/Development/personal/blog/src/content/posts/markdown-showcase.md) that demonstrates the supported writing patterns.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run check`
