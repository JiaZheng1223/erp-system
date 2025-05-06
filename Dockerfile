FROM node:18-alpine AS base

# 安裝依賴階段
FROM base AS deps
WORKDIR /app

# 複製 package.json 文件
COPY package.json package-lock.json* ./
RUN npm ci

# 構建階段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 設置環境變數
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# 構建應用
RUN npm run build

# 生產階段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# 創建非 root 用戶以提高安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 複製必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 設置端口
EXPOSE 3000

# 設置健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD [ "wget", "-q", "http://localhost:3000/api/health", "-O", "/dev/null" ]

# 啟動應用
CMD ["node", "server.js"] 