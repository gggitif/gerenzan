"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PAGES } from "@/lib/pager";

const COOLDOWN = 900; // 翻页后冷却,防连触
const EDGE_BIAS = 4;  // 越界多少像素内即判定"到底/到顶"

function neighborIndex(pathname: string): number {
  // // 是根,其它带前缀;逐项精确匹配
  for (let i = 0; i < PAGES.length; i++) {
    if (PAGES[i].path === pathname) return i;
  }
  return -1;
}

export function useWheelPager() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const lockRef = useRef(false);

  useEffect(() => {
    // 用户系统开了"减少动效" → 翻页会瞬跳,但仍允许键盘/滚轮推进。
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const go = (dir: 1 | -1) => {
      const idx = neighborIndex(pathname);
      if (idx < 0) return; // 当前不在序列里(如详情页),不干预
      const next = PAGES[idx + dir];
      if (!next) return; // 序列边界,不动
      if (lockRef.current) return;
      lockRef.current = true;
      router.push(next.path);
      window.setTimeout(() => {
        lockRef.current = false;
      }, COOLDOWN);
    };

    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.body.scrollHeight - EDGE_BIAS;
    const atTop = () => window.scrollY <= EDGE_BIAS;

    // 滚轮:只在"到底/到顶"且朝向越界方向时翻页,平常用来看内容
    const onWheel = (e: WheelEvent) => {
      const idx = neighborIndex(pathname);
      if (idx < 0) return;
      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;
      if (goingDown && atBottom()) {
        e.preventDefault();
        go(1);
      } else if (goingUp && atTop()) {
        e.preventDefault();
        go(-1);
      }
    };

    // 键盘:↑↓/PageUp/PageDown 直接翻页(节流交由上面的 lock)
    const onKey = (e: KeyboardEvent) => {
      const idx = neighborIndex(pathname);
      if (idx < 0) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return; // 输入框里不抢键
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    };

    // 触屏:上滑=下一页,下滑=上一页(到边界时)
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const idx = neighborIndex(pathname);
      if (idx < 0) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40) return; // 太小的滑动忽略
      if (dy > 0 && atBottom()) go(1);
      else if (dy < 0 && atTop()) go(-1);
    };

    // 被动 false 才能 preventDefault 拦截滚轮越界
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pathname, router]);

  // 暴露给指示器:当前索引
  return { currentIndex: neighborIndex(pathname), reduceMotion: typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches };
}
