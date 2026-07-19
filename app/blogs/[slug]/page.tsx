import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllSlugs, getPost, renderMarkdown } from "@/lib/posts";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return notFound();

  const html = await renderMarkdown(slug, post.content);

  return (
    <article className="rise mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/blogs"
        className="font-display mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-[var(--accent)] transition-colors"
      >
        ← back / blog
      </Link>

      <header className="mb-8">
        <div className="font-display mb-4 text-[11px] uppercase tracking-widest text-zinc-500">
          <span className="text-[var(--accent)]">⬡</span>{" "}
          <time>{post.date || "----"}</time>
          {post.tags?.map((t) => (
            <span
              key={t}
              className="ml-2 rounded border border-white/[.08] px-2 py-0.5 text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-400">{post.description}</p>
      </header>

      <hr className="my-8 border-white/[.08]" />

      <div
        className="prose-zh max-w-none text-zinc-300
          [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground
          [&_h3]:mt-5 [&_h3]:mb-2
          [&_p]:my-3 [&_p]:leading-7
          [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1
          [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5
          [&_a]:underline [&_a]:text-[var(--accent)]
          [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--accent)]/50 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-400
          [&_code]:rounded [&_code]:border [&_code]:border-white/[.08] [&_code]:bg-white/[.03] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-[var(--accent)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
