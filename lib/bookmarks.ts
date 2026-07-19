import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface BookmarkFrontmatter {
  title: string;
  description: string;
  url: string;
  category?: string;
  tags?: string[];
}

export interface Bookmark extends BookmarkFrontmatter {
  slug: string;
}

const dir = path.join(process.cwd(), "content", "bookmarks");

function readAll(): Bookmark[] {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const all = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const fm = data as BookmarkFrontmatter;
    return {
      slug,
      title: fm.title ?? slug,
      description: fm.description ?? "",
      url: fm.url ?? "#",
      category: fm.category ?? "其它",
      tags: fm.tags ?? [],
    } as Bookmark;
  });

  // 按分类聚拢,分类内保持文件顺序(自定义排序留给页面)
  return all;
}

export function getAllBookmarks(): Bookmark[] {
  return readAll();
}

export function getAllCategories(): string[] {
  const cats = new Set<string>();
  for (const b of readAll()) cats.add(b.category ?? "其它");
  return Array.from(cats);
}
