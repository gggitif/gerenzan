"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { uploadToken, uploadPassword } from "@/content/about";

type ContentType = "projects" | "posts" | "bookmarks";

const TYPE_LABEL: Record<ContentType, string> = {
  projects: "项目",
  posts: "博客",
  bookmarks: "收藏",
};

const TYPE_LINK: Record<ContentType, string> = {
  projects: "/projects",
  posts: "/blogs",
  bookmarks: "/bookmarks",
};

const SESSION_KEY = "upload-unlocked";

export default function UploadPage() {
  // ---------- 密码门 ----------
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  // 每次挂载检查 sessionStorage,避免关了标签页就丢失(整浏览器关了才清)
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    if (pwInput === uploadPassword) {
      setUnlocked(true);
      setPwError(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    } else {
      setPwError(true);
    }
  };

  // ---------- 表单状态 ----------
  const today = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<ContentType>("projects");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [result, setResult] = useState<{ slug?: string; error?: string }>({});
  const [copied, setCopied] = useState(false);

  // ---------- 管理已有内容 ----------
  const [contents, setContents] = useState<Record<ContentType, { slug: string; title: string }[]>>({
    projects: [],
    posts: [],
    bookmarks: [],
  });
  const [manageOpen, setManageOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ type: ContentType; slug: string; title: string } | null>(null);

  const fetchContentList = async () => {
    const result: Record<ContentType, { slug: string; title: string }[]> = {
      projects: [],
      posts: [],
      bookmarks: [],
    };
    for (const t of Object.keys(TYPE_LABEL) as ContentType[]) {
      try {
        const res = await fetch(`/api/content?type=${t}`, {
          headers: { "x-upload-token": uploadToken },
        });
        if (res.ok) result[t] = await res.json();
      } catch {}
    }
    setContents(result);
  };

  const doDelete = async () => {
    if (!delTarget) return;
    try {
      const res = await fetch(
        `/api/content?type=${delTarget.type}&slug=${delTarget.slug}`,
        { method: "DELETE", headers: { "x-upload-token": uploadToken } }
      );
      if (res.ok) {
        setContents((prev) => ({
          ...prev,
          [delTarget.type]: prev[delTarget.type].filter((c) => c.slug !== delTarget.slug),
        }));
      }
    } catch {}
    setDelTarget(null);
  };

  // 切换类型时清空部分字段
  const switchType = (t: ContentType) => {
    if (t !== type) {
      setType(t);
      setFeatured(false);
      setUrl("");
      setCategory("");
      setResult({});
      setStatus("idle");
    }
  };

  // 实时拼出会生成的 Markdown
  const markdown = useMemo(() => {
    const tagArr = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (type === "bookmarks") {
      const tagLine = tagArr.length
        ? "\ntags:\n" + tagArr.map((t) => `  - ${t}`).join("\n")
        : "";
      const catLine = category ? `\ncategory: ${category}` : "";
      return (
        "---\n" +
        `title: ${title || "收藏标题"}\n` +
        `description: ${description || "一句话简介"}\n` +
        `url: ${url || "https://..."}` +
        catLine +
        tagLine +
        "\n---\n\n" +
        (content || "正文写在这里") +
        "\n"
      );
    }

    const tagLine = tagArr.length
      ? "\ntags:\n" + tagArr.map((t) => `  - ${t}`).join("\n")
      : "";
    const featuredLine = type === "projects" && featured ? "\nfeatured: true" : "";

    return (
      "---\n" +
      `title: ${title || "标题"}\n` +
      `description: ${description || "一句话简介"}\n` +
      `date: ${date || "----"}` +
      tagLine +
      featuredLine +
      "\n---\n\n" +
      (content || "正文写在这里") +
      "\n"
    );
  }, [type, title, description, date, tags, featured, url, category, content]);

  // ---------- 提交 ----------
  const submit = async () => {
    if (!title || !description) {
      setResult({ error: "标题、简介是必填项" });
      setStatus("error");
      return;
    }
    if (type === "bookmarks" && !url) {
      setResult({ error: "URL 是必填项" });
      setStatus("error");
      return;
    }
    if (type !== "bookmarks" && !date) {
      setResult({ error: "日期是必填项" });
      setStatus("error");
      return;
    }

    const tagArr = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    setStatus("saving");

    try {
      const endpoint = `/api/${type}`;
      const body: Record<string, unknown> = {
        title,
        description,
        tags: tagArr,
        content,
      };
      if (type !== "bookmarks") {
        body.date = date;
      }
      if (type === "projects") {
        body.featured = featured;
      }
      if (type === "bookmarks") {
        body.url = url;
        body.category = category;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-upload-token": uploadToken,
        },
        body: JSON.stringify(body),
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

  const field =
    "w-full rounded-lg border border-white/[.1] bg-white/[.03] px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors";

  // ---------- 密码门视图 ----------
  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-lg flex-col items-center justify-center px-6">
        <div className="w-full rounded-2xl border border-white/[.08] bg-white/[.02] p-8 text-center">
          <p className="font-display mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
            // auth required
          </p>
          <h1 className="font-display mb-6 text-2xl font-semibold tracking-tight text-foreground">
            输入密码以继续
          </h1>
          <input
            type="password"
            className={field + " text-center"}
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
            placeholder="••••••"
            autoFocus
          />
          {pwError && (
            <p className="mt-3 text-sm text-red-400">密码错误,再试一次</p>
          )}
          <button
            onClick={handleUnlock}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-6 py-2 text-sm tracking-wider text-foreground transition-all hover:bg-[var(--accent)]/20 hover:shadow-[0_0_24px_rgba(45,212,191,0.3)]"
          >
            进入
          </button>
        </div>
      </div>
    );
  }

  // ---------- 表单视图 ----------
  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="pt-16 pb-8 rise">
        <p className="font-display mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
          // upload
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          快速上传
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
          填表单提交 → 本地自动生成 Markdown 到对应目录。
          部署到只读环境时会回退到右侧复制片段。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 pb-20 lg:grid-cols-2">
        {/* 表单 */}
        <div className="flex flex-col gap-4">
          {/* 类型选择 */}
          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              创建到
            </span>
            <div className="flex gap-2">
              {(Object.keys(TYPE_LABEL) as ContentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchType(t)}
                  className={
                    "font-display rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition-all " +
                    (type === t
                      ? "border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "border-white/[.1] bg-white/[.03] text-zinc-500 hover:border-white/[.2] hover:text-zinc-300")
                  }
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </label>

          {/* 标题 */}
          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              标题 *
            </span>
            <input
              className={field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "bookmarks" ? "例如: Next.js 文档" : "例如: AI 图片描述生成器"}
            />
          </label>

          {/* 简介 */}
          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              简介 *
            </span>
            <input
              className={field}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一句话说明这是做什么的"
            />
          </label>

          {/* URL(仅收藏) */}
          {type === "bookmarks" && (
            <label className="flex flex-col gap-2">
              <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
                URL *
              </span>
              <input
                className={field}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          )}

          {/* 分类(仅收藏) */}
          {type === "bookmarks" && (
            <label className="flex flex-col gap-2">
              <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
                分类
              </span>
              <input
                className={field}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例如: 文档/工具/AI"
              />
            </label>
          )}

          {/* 日期(项目和博客) */}
          {type !== "bookmarks" && (
            <label className="flex flex-col gap-2">
              <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
                {type === "posts" ? "发布日期 *" : "完成日期 *"}
              </span>
              <input
                type="date"
                className={field}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          )}

          {/* 标签 */}
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

          {/* 精选(仅项目) */}
          {type === "projects" && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="font-display text-sm text-zinc-300">设为精选(首页 feat 栏)</span>
            </label>
          )}

          {/* 正文 */}
          <label className="flex flex-col gap-2">
            <span className="font-display text-xs uppercase tracking-widest text-zinc-400">
              正文(Markdown)
            </span>
            <textarea
              className={field + " min-h-[160px] resize-y font-mono"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === "bookmarks" ? "对这个资源的描述..." : "## 这是什么\n\n说明...\n\n> 一句话感想"}
            />
          </label>

          {/* 按钮行 */}
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
              ✓ 已生成 <code className="text-[var(--accent)]">content/{type}/{result.slug}.md</code>
              <div className="mt-2 flex gap-4 text-xs">
                <Link href={`${TYPE_LINK[type]}/${result.slug}`} className="text-[var(--accent)] hover:underline">
                  查看详情 →
                </Link>
                <Link href={TYPE_LINK[type]} className="text-zinc-400 hover:underline">
                  去{TYPE_LABEL[type]}列表
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

      {/* 管理已有内容 */}
      <section className="pb-20">
        <button
          onClick={() => { setManageOpen(!manageOpen); if (!manageOpen) fetchContentList(); }}
          className="font-display inline-flex items-center gap-2 rounded-full border border-white/[.1] px-5 py-2 text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:bg-white/[.04] hover:text-zinc-200"
        >
          {manageOpen ? "收起" : "管理已有内容"} ▾
        </button>

        {manageOpen && (
          <div className="mt-4 space-y-6">
            {(Object.keys(TYPE_LABEL) as ContentType[]).map((t) => (
              <div key={t}>
                <p className="font-display mb-2 text-xs uppercase tracking-widest text-zinc-500">
                  {TYPE_LABEL[t]} ({contents[t].length})
                </p>
                {contents[t].length === 0 ? (
                  <p className="text-xs text-zinc-600">暂无内容</p>
                ) : (
                  <ul className="divide-y divide-white/[.06] rounded-xl border border-white/[.08] bg-white/[.01]">
                    {contents[t].map((c) => (
                      <li
                        key={c.slug}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-[10px] text-zinc-600 shrink-0">
                            {c.slug}
                          </span>
                          <span className="text-sm text-zinc-300 truncate">
                            {c.title}
                          </span>
                        </div>
                        <button
                          onClick={() => setDelTarget({ type: t, slug: c.slug, title: c.title })}
                          className="font-display shrink-0 rounded border border-red-500/20 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10"
                        >
                          删除
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 删除确认弹窗 */}
      {delTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/[.1] bg-zinc-900 p-6 shadow-2xl">
            <p className="font-display text-sm font-semibold text-foreground">
              确认删除
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              将永久删除 <span className="text-[var(--accent)]">{delTarget.title}</span>
              <br />
              <code className="text-xs text-zinc-600">
                content/{delTarget.type}/{delTarget.slug}.md
              </code>
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={doDelete}
                className="font-display rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm tracking-wider text-red-300 transition-all hover:bg-red-500/20"
              >
                确认删除
              </button>
              <button
                onClick={() => setDelTarget(null)}
                className="font-display rounded-full border border-white/[.1] px-5 py-2 text-sm tracking-wider text-zinc-400 transition-colors hover:bg-white/[.04]"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
