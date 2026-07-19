import { getAllBookmarks } from "@/lib/bookmarks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "收藏",
  description: "好用的网站、项目、工具。",
};

export default function BookmarksPage() {
  const bookmarks = getAllBookmarks();

  // 按分类分组,保持首次出现的顺序
  const groups: { category: string; items: typeof bookmarks }[] = [];
  for (const b of bookmarks) {
    const cat = b.category ?? "其它";
    let g = groups.find((x) => x.category === cat);
    if (!g) {
      g = { category: cat, items: [] };
      groups.push(g);
    }
    g.items.push(b);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="pt-16 pb-10 rise">
        <p className="font-display mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
          // bookmarks
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          收藏
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
          好用的网站、项目和工具。点开就跳过去。
        </p>
      </section>

      <section className="pb-20">
        {bookmarks.length === 0 ? (
          <p className="text-zinc-500">
            还没有收藏。在 <code>content/bookmarks/</code> 下新建一个
            Markdown 文件试试。
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {groups.map((g, gi) => (
              <div key={g.category} className="rise" style={{ animationDelay: `${gi * 0.06}s` }}>
                <div className="mb-4 flex items-center gap-3 font-display text-xs uppercase tracking-widest text-zinc-500">
                  <span className="text-[var(--accent)]">⬡</span>
                  <span>{g.category}</span>
                  <span className="h-px flex-1 bg-white/[.08]" />
                  <span>{g.items.length}</span>
                </div>

                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {g.items.map((b) => (
                    <li key={b.slug}>
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-glow group flex h-full flex-col rounded-2xl border border-white/[.08] bg-white/[.02] p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[.04] hover:shadow-[0_8px_30px_-12px_rgba(45,212,191,0.25)]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base font-semibold tracking-tight text-foreground group-hover:text-[var(--accent)] transition-colors">
                            {b.title}
                          </h3>
                          <span className="font-display shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]">
                            ↗
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-zinc-400 line-clamp-2">
                          {b.description}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                          {b.tags?.map((t) => (
                            <span
                              key={t}
                              className="font-display rounded border border-white/[.08] px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
