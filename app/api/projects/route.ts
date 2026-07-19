import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { uploadToken } from "@/content/about";

// 生成纯 ASCII 的 slug(中文全去掉,避免 URL 编码问题)
function slugify(title: string): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^\x00-\x7F]+/g, "")    // 去除非 ASCII(含中文)
    .replace(/[^a-z0-9]+/g, "-")      // 非字母数字变连字符
    .replace(/^-+|-+$/g, "");         // 去头尾连字符
  if (ascii && /^[a-z]/.test(ascii)) return ascii;
  // 纯中文/数字开头 → 时间戳 slug
  return "p-" + new Date().toISOString().slice(0, 10).replaceAll("-", "");
}

export async function POST(req: NextRequest) {
  // 简单口令校验:请求头带上 x-upload-token
  const token = req.headers.get("x-upload-token");
  if (!uploadToken || token !== uploadToken) {
    return NextResponse.json({ error: "未授权(口令错误)" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "无效的请求体" }, { status: 400 });
  }

  const { title, description, date, tags, featured, content } = body as {
    title?: string;
    description?: string;
    date?: string;
    tags?: string[];
    featured?: boolean;
    content?: string;
  };

  if (!title || !description || !date) {
    return NextResponse.json(
      { error: "标题、简介、日期是必填项" },
      { status: 422 }
    );
  }

  // 拼成 frontmatter + 正文
  const tagLine =
    Array.isArray(tags) && tags.length > 0
      ? "\ntags:\n" + tags.map((t) => `  - ${t}`).join("\n")
      : "";
  const featuredLine = featured ? "\nfeatured: true" : "";
  const fm =
    "---\n" +
    `title: ${title}\n` +
    `description: ${description}\n` +
    `date: ${date}` +
    tagLine +
    featuredLine +
    "\n---\n\n" +
    (content ?? "").trim() +
    "\n";

  const slug = slugify(title);
  const dir = path.join(process.cwd(), "content", "projects");
  const target = path.join(dir, `${slug}.md`);

  // 阻隔路径穿越
  if (!target.startsWith(dir + path.sep) && target !== dir) {
    return NextResponse.json({ error: "非法路径" }, { status: 400 });
  }

  // 重名时加上 -2 等后缀
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
    // 部署到 Vercel 的只读文件系统会走到这里
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error:
          "写入失败(生产环境文件只读,无法直接保存。请改用页面右侧的复制片段,手动保存到 content/projects/)。",
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
    path: `content/projects/${finalSlug}.md`,
    markdown: fm,
  });
}
