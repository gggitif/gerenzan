export interface PagerPage {
  path: string;
  label: string; // 指示器和键盘提示用的短名
}

// 滚轮翻页的页面序列。顺序即从上到下推进的方向。
// 新增页面只要往这里插一项,导航和翻页会自动跟上。
export const PAGES: PagerPage[] = [
  { path: "/", label: "Home" },
  { path: "/projects", label: "Projects" },
  { path: "/blogs", label: "Blog" },
  { path: "/bookmarks", label: "Bookmarks" },
  { path: "/contact", label: "Contact" },
  { path: "/upload", label: "Upload" },
];
