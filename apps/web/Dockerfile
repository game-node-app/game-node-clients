FROM node:20-alpine AS base

# This Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update both files!

FROM base AS pruner
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

COPY . .

RUN yarn global add turbo

RUN ls -la /app

RUN turbo prune web --docker

# Stage 2: Installer
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock

RUN yarn install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/ ./
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

COPY apps/web/.env.production ./apps/web/.env.production

RUN ls -la /app
RUN ls -la /app/apps/web

RUN yarn turbo run build --filter=web

FROM base AS runner
# Don't run production as root for security reasons
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD node apps/web/server.js