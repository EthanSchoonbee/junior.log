---
title: Shipping fast with calm systems
description: A note on building personal systems that let you publish quickly without creating chaos.
author: Junior Dev
publishedAt: 2026-03-28
tags:
  - process
  - notes
  - developer-experience
readingTime: 4 min read
---

The goal is not maximum speed.

The goal is **repeatable speed**.

> [!TIP] A publishing system should reduce friction, not add ceremony.
> If writing a post feels heavier than writing the note itself, the workflow needs work.

## Working rule

1. Write in Obsidian.
2. Add frontmatter.
3. Drop the file into `src/content/posts`.
4. Ship.

## Sequence view

```mermaid
sequenceDiagram
    autonumber
    participant Writer as Writer
    participant Notes as Obsidian
    participant Frontmatter as Frontmatter
    participant Repo as Blog Repo
    participant Astro as Astro Build
    participant Preview as Local Preview
    participant Deploy as Deploy Target
    participant Reader as Reader

    Writer->>Notes: Draft post idea
    Notes-->>Writer: Refine text, links, code, diagrams
    Writer->>Frontmatter: Add title, description, tags, date
    Frontmatter-->>Writer: Validate publishing metadata
    Writer->>Repo: Save markdown into src/content/posts
    Repo->>Astro: Trigger content sync
    Astro->>Astro: Parse markdown and render components
    Astro->>Preview: Generate local preview
    Preview-->>Writer: Review typography, images, Mermaid, spacing
    Writer->>Repo: Make final edits
    Repo->>Deploy: Push production build
    Deploy-->>Reader: Serve post page
    Reader->>Deploy: Open article
    Deploy-->>Reader: Return themed page with search, tags, nav
```

```ts
export function publish(post: { title: string; publishedAt: Date }) {
    return `${post.title} shipped on ${post.publishedAt.toISOString()}`;
}
```
