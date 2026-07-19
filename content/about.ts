// 改这里就行,不用动页面。邮箱用数组拆开存放 + 客户端拼接,降低被静态抓取的概率。
//
// 用法:
//   email: 写成 ['you', 'example', 'com']  → 渲染成 you@example.com
//   其余字段直接填字符串。

export const contact = {
  email: ["you", "example", "com"], // → you@example.com
  emailDisplay: "you@example.com", // 页面上直接显示的文字(也可手填别的)
  github: {
    user: "yourname",
    url: "https://github.com/yourname",
  },
  phone: "+86 138-0000-0000",
  phoneHref: "+8613800000000", // tel: 链接用的纯数字
  location: "中国 · 某城市",
};

// 上传接口口令:防内部误用/外部扫站乱传。
// 改成你自己的随机串。容器读这个值;前端从公共配置取(见下)。
export const uploadToken = "change-this-to-a-long-random-string";

// 运行时拼邮箱,避免在 HTML 源码里出现完整 @ 字符串
export function buildEmail(parts: string[]): string {
  return `${parts[0]}@${parts[1]}.${parts[2]}`;
}
