import { defineConfig } from "astro/config";
import remarkGfm from "remark-gfm";
import { rehypeObsidianCallouts, remarkObsidianCallouts, remarkObsidianEmbeds } from "./src/utils/markdown.js";

export default defineConfig({
  site: "https://example.com",
  markdown: {
    remarkPlugins: [remarkGfm, remarkObsidianCallouts, remarkObsidianEmbeds],
    rehypePlugins: [rehypeObsidianCallouts],
    shikiConfig: {
      theme: "github-light",
      themes: {
        light: "github-light",
        dark: "github-dark"
      },
      wrap: true
    }
  }
});
