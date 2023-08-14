FROM node:18-bookworm AS common

WORKDIR /misskey

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	apt-get update
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	apt-get install -y --no-install-recommends build-essential

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/client/package.json ./packages/client/
COPY packages/sw/package.json ./packages/sw/
COPY packages/misskey-js/package.json ./packages/misskey-js/

RUN corepack enable
RUN --mount=type=cache,target=/root/.local/share/pnpm pnpm install --frozen-lockfile


FROM common AS builder

COPY gulpfile.js ./gulpfile.js
COPY locales ./locales
COPY scripts ./scripts
COPY packages/backend ./packages/backend
COPY packages/client ./packages/client
COPY packages/sw ./packages/sw
COPY packages/misskey-js ./packages/misskey-js

ENV NODE_ENV=production

RUN --mount=type=cache,target=/root/.local/share/pnpm pnpm build


FROM common AS modules

RUN find ./ -name "node_modules" | xargs rm -rf
RUN --mount=type=cache,target=/root/.local/share/pnpm pnpm install --frozen-lockfile --prod --no-optional


FROM node:18-bookworm AS submodule

WORKDIR /misskey

COPY .git .git

RUN git submodule update --init


FROM node:18-bookworm-slim AS runner

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
COPY packages/misskey-js/package.json ./packages/misskey-js/
COPY locales locales
COPY scripts scripts
COPY assets assets
COPY --from=submodule /misskey/misskey-assets ./misskey-assets
COPY --from=modules /misskey/node_modules ./node_modules
COPY --from=modules /misskey/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=modules /misskey/packages/client/node_modules ./packages/client/node_modules
COPY --from=modules /misskey/packages/misskey-js/node_modules ./packages/misskey-js/node_modules
COPY --from=builder /misskey/built ./built
COPY --from=builder /misskey/packages/backend/built ./packages/backend/built
COPY --from=builder /misskey/packages/misskey-js/built ./packages/misskey-js/built

ENV NODE_ENV=production
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["pnpm", "run", "migrateandstart"]
