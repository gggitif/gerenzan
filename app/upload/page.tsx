"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { uploadToken } from "@/content/about";

export default function UploadPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [content, setContent] = useState("");

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [result, setResult] = useState<{ slug?: string; error?: string }>({});
  const [copied, setCopied] = useState(false);

  // 实时拼出会生成的 Markdown 片段
  const markdown = useMemo(() => {
    const tagArr = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const tagLine = tagArr.length
      ? "\ntags:\n" + tagArr.map((t) => `  - ${t}`).join("\n")
      : "";
    const featuredLine = featured ? "\nfeatured: true" : "";
    return (
      "---\n" +
      `title: ${title || "项目标题"}\n` +
      `description: ${description || "一句话简介"}\n` +
      `date: ${date || "----"}` +
      tagLine +
      featuredLine +
      "\n---\n\n" +
      (content || "正文写在这里") +
      "\n"
    );
  }, [title, description, date, tags, featured, content]);

  const submit = async () => {
    if (!title || !description || !date) {
      setResult({ error: "标题、简介、日期是必填项" });
      setStatus("error");
      return;
    }
    const tagArr = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    setStatus("saving");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-upload-token": uploadToken,
        },
        body: JSON.stringify({
          title,
          description,
          date,
          tags: tagArr,
          featured,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "提交失败" });
        setStatus("error");
        return;
      }
      setResult({ slug: data.slug });
      setStatus("done");
    } catch {
      setResult({ error: "网络错误" });
      setStatus("error");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const field = "w-full rounded-lg border border-white/[.1] bg-white/[.03] px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors";

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="pt-16 pb-8 rise">
        <p className="font-display mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
          // upload
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          快速上传项目
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
          填表单提交 → 本地自动生成 Markdown 到 <code>content/projects/</code>。
          部署到只读环境时会回退到右侧复制片段。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 pb-20 lg:grid-cols-2">
        {/* 表单 */}
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              标题 *
            </span>
            <input
              className={field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如:AI 图片描述生成器"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              简介 *
            </span>
            <input
              className={field}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一句话说明这个项目做什么"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              完成日期 *
            </span>
            <input
              type="date"
              className={field}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              标签(逗号分隔)
            </span>
            <input
              className={field}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, 工具, 前端"
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span className="font-display text-sm text-zinc-300">设为精选(首页带 feat 标)</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              正文(Markdown)
            </span>
            <textarea
              className={field + " min-h-[160px] resize-y font-mono"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"## 这个项目是什么\n\n说明...\n\n> 一句话感想"}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={submit}
              disabled={status === "saving"}
              className="font-display inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-6 py-2 text-sm tracking-wider text-foreground transition-all hover:bg-[var(--accent)]/20 hover:shadow-[0_0_24px_rgba(45,212,191,0.3)] disabled:opacity-50"
            >
              {status === "saving" ? "保存中…" : "保存到本地"}
            </button>
            <button
              onClick={copy}
              className="font-display inline-flex items-center gap-2 rounded-full border border-white/[.1] px-6 py-2 text-sm tracking-wider text-zinc-300 transition-colors hover:bg-white/[.04]"
            >
              {copied ? "已复制 ✓" : "复制 Markdown"}
            </button>
          </div>

          {/* 状态反馈 */}
          {status === "done" && result.slug && (
            <div className="rise rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-sm">
              ✓ 已生成 <code className="text-[var(--accent)]">content/projects/{result.slug}.md</code>
              <div className="mt-2 flex gap-4 text-xs">
                <Link href={`/projects/${result.slug}`} className="text-[var(--accent)] hover:underline">
                  查看详情 →
                </Link>
                <Link href="/projects" className="text-zinc-400 hover:underline">
                  去项目列表
                </Link>
              </div>
            </div>
          )}
          {status === "error" && (
            <div className="rise rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
              {result.error}
            </div>
          )}
        </div>

        {/* 实时预览 */}
        <div className="flex flex-col">
          <p className="font-display mb-2 text-xs uppercase tracking-widest text-zinc-500">
            // 预览(将生成的内容)
          </p>
          <pre className="overflow-auto rounded-xl border border-white/[.08] bg-black/40 p-4 font-mono text-xs leading-5 text-zinc-300 min-h-[300px]">
            {markdown}
          </pre>
        </div>
      </section>
    </div>
  );
}
