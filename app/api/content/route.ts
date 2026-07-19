import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { uploadToken } from "@/content/about";

const VALID_TYPES = ["projects", "posts", "bookmarks"] as const;
type ContentType = (typeof VALID_TYPES)[number];

function isValidType(t: string): t is ContentType {
  return (VALID_TYPES as readonly string[]).includes(t);
}

// 从 frontmatter 提取标题(不用 gray-matter,避免复杂依赖)
function extractTitle(raw: string): string {
  const m = raw.match(/^---\s*\ntitle:\s*(.+)$/m);
  return m ? m[1].trim() : "(无标题)";
}

/** GET /api/content?type=projects → [{ slug, title }] */
async function listContent(type: ContentType) {
  const dir = path.join(process.cwd(), "content", type);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    let title = slug;
    try {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      title = extractTitle(raw);
    } catch {}
    return { slug, title };
  });
}

/** DELETE /api/content?type=projects&slug=xxx */
async function deleteContent(type: ContentType, slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "非法的 slug" };
  }
  const dir = path.join(process.cwd(), "content", type);
  const target = path.join(dir, `${slug}.md`);

  if (!target.startsWith(dir + path.sep) && target !== dir) {
    return { error: "非法路径" };
  }
  if (!fs.existsSync(target)) {
    return { error: "文件不存在" };
  }

  fs.unlinkSync(target);
  return { ok: true };
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-upload-token");
  if (!uploadToken || token !== uploadToken) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "";
  if (!isValidType(type)) {
    return NextResponse.json(
      { error: "type 必须是 projects/posts/bookmarks" },
      { status: 400 }
    );
  }

  const items = await listContent(type);
  return NextResponse.json(items);
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("x-upload-token");
  if (!uploadToken || token !== uploadToken) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "";
  const slug = req.nextUrl.searchParams.get("slug") ?? "";

  if (!isValidType(type)) {
    return NextResponse.json(
      { error: "type 必须是 projects/posts/bookmarks" },
      { status: 400 }
    );
  }
  if (!slug) {
    return NextResponse.json({ error: "缺少 slug 参数" }, { status: 400 });
  }

  const result = await deleteContent(type, slug);
  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
