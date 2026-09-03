# MDXViewer as one deployable service: the built client and the file API served
# from a single origin, so `/api` resolves relatively and CORS never enters it.
#
# The content folder is a volume, not part of the image. A team points this at
# documentation it already owns — that is the product, not the bundled samples.

FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

# Dependencies first, so a source-only change does not reinstall them.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig*.json vite.config.ts index.html ./
COPY src ./src
COPY server ./server
COPY public ./public

RUN pnpm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && addgroup -S mdx && adduser -S mdx -G mdx

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm add tsx

COPY --from=build /app/dist ./dist
COPY server ./server
COPY tsconfig*.json ./

# The default content folder ships with the image; mount over it to replace it.
COPY --from=build /app/public ./public

USER mdx

# API_PORT is what the service reads; PORT is honoured too for hosts that inject it.
ENV API_PORT=3001
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["pnpm", "exec", "tsx", "server/start.ts"]
