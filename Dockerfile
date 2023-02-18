FROM node:18.14.1-bullseye AS common

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	apt-get update
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	apt-get install -y --no-install-recommends build-essential


FROM common AS builder

ARG NODE_ENV=production

WORKDIR /misskey

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/client/package.json ./packages/client/
COPY packages/sw/package.json ./packages/sw/

RUN corepack enable
RUN pnpm install

COPY gulpfile.js ./gulpfile.js
COPY locales ./locales
COPY scripts ./scripts
COPY packages/backend ./packages/backend
COPY packages/client ./packages/client
COPY packages/sw ./packages/sw

RUN pnpm build


FROM common AS submodule

WORKDIR /misskey

COPY .git .git

RUN git submodule update --init


FROM node:18-bullseye-slim AS runner

WORKDIR /misskey

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	apt-get update && \
	apt-get install -y --no-install-recommends ffmpeg tini && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	corepack enable

COPY .node-version .node-version
COPY package.json ./
COPY packages/backend/ormconfig.js ./packages/backend/
COPY packages/backend/migration ./packages/backend/migration
COPY packages/backend/nsfw-model ./packages/backend/nsfw-model
COPY packages/backend/assets ./packages/backend/assets
COPY packages/backend/package.json ./packages/backend/
COPY packages/client/package.json ./packages/client/
COPY packages/client/assets ./packages/client/assets
COPY packages/sw/package.json ./packages/sw/
COPY locales locales
COPY scripts scripts
COPY assets assets
COPY --from=submodule /misskey/misskey-assets ./misskey-assets
COPY --from=builder /misskey/node_modules ./node_modules
COPY --from=builder /misskey/built ./built
COPY --from=builder /misskey/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=builder /misskey/packages/backend/built ./packages/backend/built
COPY --from=builder /misskey/packages/client/node_modules ./packages/client/node_modules

ENV NODE_ENV=production
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["pnpm", "run", "migrateandstart"]
