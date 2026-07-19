import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "项目集",
  description: "我用 AI 做的一些项目收藏。",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      {/* 区头 */}
      <section className="pt-16 pb-10 rise">
        <p className="font-display mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
          // projects
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          项目集
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
          每个项目都是我跟 AI 一起从想法落到能跑起来的状态。点进去看说明和源码。
        </p>
      </section>

      {/* 列表 */}
      <section className="pb-20">
        <div className="mb-5 flex items-center gap-3 font-display text-xs uppercase tracking-widest text-zinc-500">
          <span className="h-px flex-1 bg-white/[.08]" />
          <span>{projects.length} 个项目</span>
          <span className="h-px flex-1 bg-white/[.08]" />
        </div>

        {projects.length === 0 ? (
          <p className="text-zinc-500">
            还没有项目。在 <code>content/projects/</code> 下新建一个 Markdown 文件试试。
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((p, i) => (
              <li
                key={p.slug}
                className="rise"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <Link
                  href={`/projects/${p.slug}`}
                  className="border-glow scanline group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.02] p-5 transition-all hover:-translate-y-1 hover:bg-white/[.04] hover:shadow-[0_8px_40px_-12px_rgba(45,212,191,0.25)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {p.title}
                    </h3>
                    {p.featured && (
                      <span className="font-display shrink-0 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-[var(--accent)]">
                        feat
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-zinc-400 line-clamp-2">
                    {p.description}
                  </p>

                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="font-display rounded border border-white/[.08] px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between font-display text-[11px] tracking-wider text-zinc-500">
                    <span>{p.date || "----"}</span>
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">
                      open →
                    </span>
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
