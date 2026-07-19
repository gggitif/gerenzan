import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "博客",
  description: "过程笔记和小发现。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      {/* 区头 */}
      <section className="pt-16 pb-10 rise">
        <p className="font-display mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
          // blog
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          博客
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
          过程笔记、踩坑记录、否则会忘掉的小发现。
        </p>
      </section>

      {/* 列表:博客用单列时间线,更像文章归档 */}
      <section className="pb-20">
        <div className="mb-8 flex items-center gap-3 font-display text-xs uppercase tracking-widest text-zinc-500">
          <span className="h-px flex-1 bg-white/[.08]" />
          <span>{posts.length} 篇</span>
          <span className="h-px flex-1 bg-white/[.08]" />
        </div>

        {posts.length === 0 ? (
          <p className="text-zinc-500">
            还没有文章。在 <code>content/posts/</code> 下新建一个 Markdown 文件试试。
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((p, i) => (
              <li
                key={p.slug}
                className="rise"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <Link
                  href={`/blogs/${p.slug}`}
                  className="border-glow group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.02] p-5 transition-all hover:-translate-y-0.5 hover:bg-white/[.04] hover:shadow-[0_8px_40px_-12px_rgba(45,212,191,0.25)] sm:flex-row sm:items-center sm:gap-5"
                >
                  <span className="font-display shrink-0 text-xs tracking-widest text-[var(--accent)] sm:w-24">
                    {p.date || "----"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display truncate text-lg font-semibold tracking-tight text-foreground group-hover:text-[var(--accent)] transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-400 line-clamp-1">
                      {p.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
                    {p.tags?.map((t) => (
                      <span
                        key={t}
                        className="font-display rounded border border-white/[.08] px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
