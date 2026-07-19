import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import PagerShell from "./components/PagerShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "个人项目集",
    template: "%s · 个人项目集",
  },
  description: "我用 AI 做的一些项目收藏。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#05070a]/70 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="font-display text-sm font-semibold tracking-tight text-foreground"
            >
              <span className="text-[var(--accent)]">◆</span> 个人项目集
            </Link>
            <nav className="flex items-center gap-5 font-display text-xs uppercase tracking-widest text-zinc-500">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/projects" className="hover:text-foreground transition-colors">
                Projects
              </Link>
              <Link href="/blogs" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/bookmarks" className="hover:text-foreground transition-colors">
                Bookmarks
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/upload" className="hover:text-foreground transition-colors">
                Upload
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <PagerShell>{children}</PagerShell>
        </main>
        <footer className="border-t border-white/[.06]">
          <div className="mx-auto w-full max-w-5xl px-6 py-6 font-display text-xs uppercase tracking-widest text-zinc-600">
            © {new Date().getFullYear()} · built with ai
          </div>
        </footer>
      </body>
    </html>
  );
}
