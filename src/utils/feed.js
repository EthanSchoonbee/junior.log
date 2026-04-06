import { createExcerpt } from "./excerpt.js";

export const POSTS_PER_PAGE = 10;

export function buildPostEntries(posts) {
  return posts.map((post) => {
    const excerptHtml = createExcerpt(post.body);
    return {
      ...post,
      excerptHtml,
      searchText: excerptHtml.replace(/<[^>]+>/g, " ")
    };
  });
}

export function getPaginationItems(currentPage, totalPages) {
  const items = [];
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  for (let page = 1; page <= totalPages; page += 1) {
    if (page <= 2 || page >= totalPages - 1 || pages.has(page)) {
      items.push({ type: "page", page });
    } else if (items[items.length - 1]?.type !== "ellipsis") {
      items.push({ type: "ellipsis", key: `ellipsis-${page}` });
    }
  }

  return items;
}

export function getPageHref(page) {
  return page <= 1 ? "/" : `/page/${page}/`;
}
