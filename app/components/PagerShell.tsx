"use client";

import { usePathname, useRouter } from "next/navigation";
import { PAGES } from "@/lib/pager";
import { useWheelPager } from "./useWheelPager";

export default function PagerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { currentIndex } = useWheelPager();

  const inSequence = PAGES.some((p) => p.path === pathname);

  return (
    <>
      {children}

      {inSequence && (
        <nav
          aria-label="页面导航"
          className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex"
        >
          {PAGES.map((p, i) => {
            const active = i === currentIndex;
            return (
              <a
                key={p.path}
                href={p.path}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(p.path);
                }}
                className="group relative flex h-3 w-3 items-center justify-center"
                aria-label={p.label}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    active
                      ? "scale-125 bg-[var(--accent)] shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                      : "bg-white/20 group-hover:bg-white/50"
                  }`}
                />
                {/* hover 显示页名 */}
                <span className="font-display pointer-events-none absolute right-6 whitespace-nowrap rounded border border-white/[.08] bg-[#05070a]/90 px-2 py-1 text-[10px] uppercase tracking-widest text-zinc-300 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  {p.label}
                </span>
              </a>
            );
          })}
        </nav>
      )}
    </>
  );
}
