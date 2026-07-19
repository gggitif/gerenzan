# 多阶段:构建产物 → 最小运行镜像
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# build 需要 devDependencies(@tailwindcss/postcss, typescript 等)
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=1988
ENV HOSTNAME=0.0.0.0

# 非 root 运行
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# standalone 产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# content 目录会被宿主机卷覆盖/挂载;先放一份内置内容作为兜底
COPY --chown=nextjs:nodejs content ./content

USER nextjs
EXPOSE 1988
CMD ["node", "server.js"]
