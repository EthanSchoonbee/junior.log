import { visit } from "unist-util-visit";

const CALLOUT_PATTERN = /^\[!([A-Z]+)\]([+-])?\s*([^\n\r]*)/i;
const EMBED_PATTERN = /(!)?\[\[([^[\]]+?)\]\]/g;
const IMAGE_SIZES = new Set(["original", "full", "small", "medium", "large"]);

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function remarkObsidianCallouts() {
  return (tree) => {
    visit(tree, "blockquote", (node, index, parent) => {
      const firstParagraph = node.children?.[0];
      const firstText = firstParagraph?.children?.[0];

      if (
        !parent ||
        typeof index !== "number" ||
        !firstParagraph ||
        firstParagraph.type !== "paragraph" ||
        !firstText ||
        firstText.type !== "text"
      ) {
        return;
      }

      const match = firstText.value.match(CALLOUT_PATTERN);
      if (!match) {
        return;
      }

      const [, rawType, collapse, rawTitle] = match;
      const type = normalizeCalloutType(rawType);
      const label = getCalloutLabel(type);
      const title = rawTitle?.trim() || label;

      firstText.value = firstText.value.replace(CALLOUT_PATTERN, "").trimStart();

      if (!firstText.value && firstParagraph.children.length === 1) {
        firstParagraph.children.shift();
      }

      const paragraphs = node.children
        .map((child) => {
          const text = getNodeText(child).trim();
          return text ? `<p>${escapeHtml(text)}</p>` : "";
        })
        .filter(Boolean)
        .join("");

      parent.children.splice(index, 1, {
        type: "html",
        value: `<blockquote class="callout callout-${escapeHtml(type)}" data-callout="${escapeHtml(
          type
        )}" data-collapsible="${collapse ? "true" : "false"}" data-callout-title="${escapeHtml(
          title
        )}"><div class="callout-title"><span class="callout-badge">${escapeHtml(
          label
        )}</span><span>${escapeHtml(title)}</span></div><div class="callout-content">${paragraphs}</div></blockquote>`
      });
    });
  };
}

const getNodeText = (node) => {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (!Array.isArray(node.children)) return "";
  return node.children.map((child) => getNodeText(child)).join("");
};

const normalizeCalloutType = (value) => {
  const type = value.toLowerCase();
  if (type === "tip") return "tip";
  if (type === "hint") return "hint";
  if (type === "info") return "info";
  return "note";
};

const getCalloutLabel = (type) => {
  if (type === "tip") return "Tip";
  if (type === "hint") return "Hint";
  if (type === "info") return "Info";
  return "Note";
};

const removePatternFromFirstTextNode = (node) => {
  if (!node) return false;
  if (node.type === "text") {
    const nextValue = (node.value || "").replace(CALLOUT_PATTERN, "").trimStart();
    if (nextValue !== node.value) {
      node.value = nextValue;
      return true;
    }
    return false;
  }

  if (!Array.isArray(node.children)) return false;
  for (const child of node.children) {
    if (removePatternFromFirstTextNode(child)) {
      return true;
    }
  }
  return false;
};

export function rehypeObsidianCallouts() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "blockquote") return;

      const firstParagraph = node.children?.find((child) => child.type === "element" && child.tagName === "p");
      if (!firstParagraph) return;

      const firstText = getNodeText(firstParagraph).trimStart();
      const match = firstText.match(CALLOUT_PATTERN);
      if (!match) return;

      const [, rawType, collapse, rawTitle] = match;
      const type = normalizeCalloutType(rawType);
      const title = rawTitle?.trim() || getCalloutLabel(type);

      removePatternFromFirstTextNode(firstParagraph);

      node.properties = node.properties ?? {};
      node.properties.className = [
        ...(Array.isArray(node.properties.className) ? node.properties.className : []),
        "callout",
        `callout-${type}`
      ];
      node.properties["data-callout"] = type;
      node.properties["data-collapsible"] = collapse ? "true" : "false";
      node.properties["data-callout-title"] = title;

      if (
        firstParagraph.children?.length === 1 &&
        firstParagraph.children[0]?.type === "text" &&
        !firstParagraph.children[0].value
      ) {
        firstParagraph.children = [];
      }

      const contentChildren = node.children.filter(
        (child) => !(child.type === "element" && child.tagName === "p" && child.children?.length === 0)
      );

      node.children = [
        {
          type: "element",
          tagName: "div",
          properties: { className: ["callout-title"] },
          children: [
            {
              type: "element",
              tagName: "span",
              properties: { className: ["callout-badge"] },
              children: [{ type: "text", value: getCalloutLabel(type) }]
            },
            {
              type: "element",
              tagName: "span",
              properties: {},
              children: [{ type: "text", value: title }]
            }
          ]
        },
        {
          type: "element",
          tagName: "div",
          properties: { className: ["callout-content"] },
          children: contentChildren
        }
      ];
    });
  };
}

export function remarkObsidianEmbeds() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number" || !node.value.includes("[[")) {
        return;
      }

      EMBED_PATTERN.lastIndex = 0;
      const matches = [...node.value.matchAll(EMBED_PATTERN)];
      if (matches.length === 0) {
        return;
      }

      const replacementNodes = [];
      let cursor = 0;

      for (const match of matches) {
        const [fullMatch, bang, rawValue] = match;
        const start = match.index ?? 0;
        const parts = rawValue.split("|").map((part) => part.trim()).filter(Boolean);
        const target = parts[0] ?? "";
        const maybeCaption = parts[1];
        const maybeSize = parts[2] ?? parts[1];
        const normalizedSize = IMAGE_SIZES.has((maybeSize ?? "").toLowerCase()) ? maybeSize.toLowerCase() : "original";
        const size = normalizedSize === "small" ? "original" : normalizedSize === "medium" || normalizedSize === "large" ? "full" : normalizedSize;
        const caption = maybeCaption && maybeCaption.toLowerCase() !== normalizedSize ? maybeCaption : "";

        if (start > cursor) {
          replacementNodes.push({ type: "text", value: node.value.slice(cursor, start) });
        }

        if (bang) {
          const alt = caption || target.trim().split("/").pop() || "Embedded image";
          replacementNodes.push({
            type: "html",
            value: `<figure class="obsidian-embed" data-size="${escapeHtml(size)}"><img src="${escapeHtml(target.trim())}" alt="${escapeHtml(
              alt
            )}" loading="lazy" />${
              caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""
            }</figure>`
          });
        } else {
          const href = target.trim().startsWith("/") ? target.trim() : `/posts/${target.trim().replace(/\.md$/i, "")}/`;
          replacementNodes.push({
            type: "html",
            value: `<a class="wiki-link" href="${escapeHtml(href)}">${escapeHtml((caption || target).trim())}</a>`
          });
        }

        cursor = start + fullMatch.length;
      }

      if (cursor < node.value.length) {
        replacementNodes.push({ type: "text", value: node.value.slice(cursor) });
      }

      parent.children.splice(index, 1, ...replacementNodes);
    });
  };
}
