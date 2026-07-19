import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 最小化运行镜像,适合 docker
  output: "standalone",
  // 关掉图片优化:免依赖 sharp(原生模块,软路由环境编不动也没必要)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
