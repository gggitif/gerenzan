import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

export interface ProjectFrontmatter {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD, 项目完成日期
  tags?: string[];
  cover?: string; // 图片路径,如 /covers/demo.png
  demo?: string; // 在线 demo 链接
  source?: string; // 源码链接
  featured?: boolean;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  content: string; // 渲染后的 HTML
}

const projectsDir = path.join(process.cwd(), "content", "projects");

export function getAllSlugs(): string[] {
  if (!fs.existsSync(projectsDir)) return [];
  return fs
    .readdirSync(projectsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

const slugCache = new Map<string, string>();

function readAll(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(projectsDir, file), "utf8");
      const { data, content } = matter(raw);
      const fm = data as ProjectFrontmatter;
      // gray-matter 会把裸日期解析成 Date 对象,统一转回字符串
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
        demo: fm.demo,
        source: fm.source,
        featured: fm.featured ?? false,
        content,
      } as Project;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // 按日期倒序
}

export function getAllProjects(): Project[] {
  return readAll();
}

export function getFeaturedProjects(): Project[] {
  const all = readAll();
  const featured = all.filter((p) => p.featured);
  return featured.length > 0 ? featured : all.slice(0, 3);
}

export function getProject(slug: string): Project | null {
  if (!fs.existsSync(path.join(projectsDir, `${slug}.md`))) return null;
  return readAll().find((p) => p.slug === slug) ?? null;
}

// 将 Markdown 正文渲染为 HTML(运行在 server,内存里缓存结果)
export async function renderMarkdown(slug: string, md: string): Promise<string> {
  const cached = slugCache.get(slug);
  if (cached) return cached;
  const file = await remark().use(remarkHtml).process(md);
  const html = String(file);
  slugCache.set(slug, html);
  return html;
}
