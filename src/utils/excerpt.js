const WIKI_LINK_PATTERN = /\[\[([^[\]]+?)\]\]/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const CODE_PATTERN = /`([^`]+)`/g;
const STRONG_PATTERN = /\*\*([^*]+)\*\*/g;
const EMPHASIS_PATTERN = /(?<!\*)\*([^*]+)\*(?!\*)/g;

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const renderInlineMarkdown = (value) => {
  let html = escapeHtml(value.trim());

  html = html.replace(CODE_PATTERN, (_, code) => `<code>${escapeHtml(code)}</code>`);
  html = html.replace(MARKDOWN_LINK_PATTERN, (_, label, href) => {
    const safeHref = escapeHtml(href.trim());
    const safeLabel = label.trim();
    return `<a href="${safeHref}">${safeLabel}</a>`;
  });
  html = html.replace(WIKI_LINK_PATTERN, (_, rawValue) => {
    const [target, label] = rawValue.split("|").map((part) => part.trim());
    const href = target.startsWith("/") ? target : `/posts/${target.replace(/\.md$/i, "")}/`;
    return `<a href="${escapeHtml(href)}">${escapeHtml((label || target).trim())}</a>`;
  });
  html = html.replace(STRONG_PATTERN, "<strong>$1</strong>");
  html = html.replace(EMPHASIS_PATTERN, "<em>$1</em>");

  return html;
};

export function createExcerpt(markdown, paragraphCount = 2) {
  const blocks = markdown.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  const paragraphs = [];
  let inFence = false;

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const lines = trimmed.split("\n").map((line) => line.trim());
    const firstLine = lines[0] || "";

    if (
      firstLine.startsWith("#") ||
      firstLine.startsWith(">") ||
      firstLine.startsWith("![[") ||
      firstLine.startsWith("<") ||
      firstLine.startsWith("- ") ||
      firstLine.startsWith("* ") ||
      /^\d+\.\s/.test(firstLine)
    ) {
      continue;
    }

    const text = lines.join(" ").replace(/\s+/g, " ").trim();
    if (!text) continue;

    paragraphs.push(`<p>${renderInlineMarkdown(text)}</p>`);
    if (paragraphs.length >= paragraphCount) break;
  }

  return paragraphs.join("");
}
