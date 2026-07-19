import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags?: string[];
  cover?: string;
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
}

const postsDir = path.join(process.cwd(), "content", "posts");

const slugCache = new Map<string, string>();

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function readAll(): Post[] {
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
      const { data, content } = matter(raw);
      const fm = data as PostFrontmatter;
      const rawDate = (fm as unknown as { date?: unknown }).date;
      const dateStr =
        rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : typeof rawDate === "string"
            ? rawDate
            : "";
      return {
        slug,
        title: fm.title ?? slug,
        description: fm.description ?? "",
        date: dateStr,
        tags: fm.tags ?? [],
        cover: fm.cover,
        content,
      } as Post;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPosts(): Post[] {
  return readAll();
}

export function getPost(slug: string): Post | null {
  if (!fs.existsSync(path.join(postsDir, `${slug}.md`))) return null;
  return readAll().find((p) => p.slug === slug) ?? null;
}

export async function renderMarkdown(slug: string, md: string): Promise<string> {
  const cached = slugCache.get(slug);
  if (cached) return cached;
  const file = await remark().use(remarkHtml).process(md);
  const html = String(file);
  slugCache.set(slug, html);
  return html;
}
