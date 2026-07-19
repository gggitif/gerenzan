"use client";

import { contact, buildEmail } from "@/content/about";

export default function ContactPage() {
  const githubName = "github.com/" + contact.github.user;

  const rows = [
    {
      key: "email",
      label: "邮箱",
      icon: "✉",
      value: contact.emailDisplay,
      href: "mailto:" + buildEmail(contact.email),
      copy: buildEmail(contact.email),
    },
    {
      key: "github",
      label: "GitHub",
      icon: "⌥",
      value: githubName,
      href: contact.github.url,
      external: true,
    },
    {
      key: "phone",
      label: "电话",
      icon: "☎",
      value: contact.phone,
      href: "tel:" + contact.phoneHref,
      copy: contact.phone,
    },
    {
      key: "location",
      label: "地址",
      icon: "⬡",
      value: contact.location,
      // 地址不提供链接,留作展示;若想跳地图可换 href
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <section className="pt-16 pb-10 rise">
        <p className="font-display mb-3 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
          // contact
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          联系我
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
          想聊聊项目、合作或者只是打个招呼,从下面随便挑一个方式。
        </p>
      </section>

      <section className="pb-20">
        <ul className="flex flex-col gap-3">
          {rows.map((r, i) => {
            const inner = (
              <div className="flex items-center gap-4">
                <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.03] text-lg text-[var(--accent)]">
                  {r.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[10px] uppercase tracking-widest text-zinc-500">
                    {r.label}
                  </p>
                  <p className="font-display truncate text-base text-foreground group-hover:text-[var(--accent)] transition-colors">
                    {r.value}
                  </p>
                </div>
                <span className="font-display shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]">
                  {r.href ? (r.external ? "↗" : "→") : ""}
                </span>
              </div>
            );

            const cls = `rise group border-glow relative block rounded-2xl border border-white/[.08] bg-white/[.02] p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[.04] hover:shadow-[0_8px_30px_-12px_rgba(45,212,191,0.25)]`;

            return (
              <li
                key={r.key}
                className="rise"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {r.href ? (
                  <a
                    href={r.href}
                    target={r.external ? "_blank" : undefined}
                    rel={r.external ? "noopener noreferrer" : undefined}
                    className={cls}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-8 font-display text-xs uppercase tracking-widest text-zinc-600">
          // 通常一两天内回复
        </p>
      </section>
    </div>
  );
}
