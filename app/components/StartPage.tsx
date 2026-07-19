"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 打字机 + 解码噪点:先把标题渲染成随机字符,再逐位"锁定"成真字符
const TARGET = "个人项目集";
const GLYPHS = "01░▒▓<>/\\{}#=+*ABCDEF01";

export default function StartPage() {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let frame = 0;
    const total = TARGET.length * 6; // 每个字符扰 6 帧
    const id = setInterval(() => {
      frame++;
      const locked = Math.floor(frame / 6);
      const txt = TARGET.split("")
        .map((ch, i) => {
          if (i < locked) return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(txt);
      if (locked >= TARGET.length) {
        clearInterval(id);
        setDisplay(TARGET);
        setDone(true);
      }
    }, 45);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6">
      {/* 背景旋转辉光 */}
      <div
        aria-hidden
        className="drift pointer-events-none absolute -top-1/4 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(45,212,191,0.35), rgba(56,189,248,0.12) 40%, transparent 70%)",
        }}
      />

      <div className="rise relative z-10 flex flex-col items-center text-center">
        <p className="font-display mb-6 text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
          // portfolio
        </p>

        <h1 className="font-display glow text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          {display}
          <span className="caret text-[var(--accent)]">_</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 rise" style={{ animationDelay: "0.3s" }}>
          用 AI 把想法落成可运行的项目。
          一份我自己收藏、也想顺手分享给你的清单。
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 rise" style={{ animationDelay: "0.5s" }}>
          <Link
            href="/projects"
            className="font-display group relative inline-flex items-center gap-3 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-8 py-3 text-sm font-medium tracking-wider text-foreground transition-all hover:bg-[var(--accent)]/20 hover:shadow-[0_0_30px_rgba(45,212,191,0.35)]"
          >
            <span>进入项目集</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          {done && (
            <p className="font-display text-[11px] uppercase tracking-widest text-zinc-600">
              3 个项目 · 持续更新中
            </p>
          )}
        </div>
      </div>

      {/* 底部滚动提示 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          mostly built with ai
        </p>
      </div>
    </div>
  );
}
