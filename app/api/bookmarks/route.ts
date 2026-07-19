import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { uploadToken } from "@/content/about";

function slugify(title: string): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^\x00-\x7F]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (ascii && /^[a-z]/.test(ascii)) return ascii;
  return "bm-" + new Date().toISOString().slice(0, 10).replaceAll("-", "");
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-upload-token");
  if (!uploadToken || token !== uploadToken) {
    return NextResponse.json({ error: "未授权(口令错误)" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "无效的请求体" }, { status: 400 });
  }

  const { title, description, url, category, tags, content } = body as {
    title?: string;
    description?: string;
    url?: string;
    category?: string;
    tags?: string[];
    content?: string;
  };

  if (!title || !description || !url) {
    return NextResponse.json(
      { error: "标题、简介、URL 是必填项" },
      { status: 422 }
    );
  }

  const tagLine =
    Array.isArray(tags) && tags.length > 0
      ? "\ntags:\n" + tags.map((t) => `  - ${t}`).join("\n")
      : "";
  const catLine = category ? `\ncategory: ${category}` : "";
  const fm =
    "---\n" +
    `title: ${title}\n` +
    `description: ${description}\n` +
    `url: ${url}` +
    catLine +
    tagLine +
    "\n---\n\n" +
    (content ?? "").trim() +
    "\n";

  const slug = slugify(title);
  const dir = path.join(process.cwd(), "content", "bookmarks");
  const target = path.join(dir, `${slug}.md`);

  if (!target.startsWith(dir + path.sep) && target !== dir) {
    return NextResponse.json({ error: "非法路径" }, { status: 400 });
  }

  let finalSlug = slug;
  let finalPath = target;
  let i = 2;
  while (fs.existsSync(finalPath)) {
    finalSlug = `${slug}-${i}`;
    finalPath = path.join(dir, `${finalSlug}.md`);
    i++;
  }

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(finalPath, fm, "utf8");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error:
          "写入失败(生产环境文件只读,无法直接保存。请改用页面右侧的复制片段,手动保存到 content/bookmarks/)。",
        detail: msg,
        markdown: fm,
        slug: finalSlug,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    slug: finalSlug,
    path: `content/bookmarks/${finalSlug}.md`,
    markdown: fm,
  });
}
