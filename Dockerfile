# syntax = docker/dockerfile:1.4

ARG NODE_VERSION=20.12.2-bookworm


# download submodules

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS submodule

WORKDIR /misskey

COPY ./.git/ ./.git/

RUN git submodule update --init --recursive


# build assets & compile TypeScript

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS native-builder

ENV NODE_ENV=production

WORKDIR /misskey

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	rm -f /etc/apt/apt.conf.d/docker-clean && \
	echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache && \
	apt-get update && \
	apt-get install -yqq --no-install-recommends \
	build-essential

RUN corepack enable

COPY --link ./packages/sw/package.json ./packages/sw/
COPY --link ./packages/misskey-bubble-game/package.json ./packages/misskey-bubble-game/
COPY --link ./packages/misskey-reversi/package.json ./packages/misskey-reversi/
COPY --link ./packages/misskey-js/package.json ./packages/misskey-js/
COPY --link ./packages/backend/package.json ./packages/backend/
COPY --link ./packages/frontend/package.json ./packages/frontend/
COPY --link ./pnpm-lock.yaml ./pnpm-workspace.yaml ./package.json ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
	pnpm i --frozen-lockfile --aggregate-output

COPY --link ./scripts/ ./scripts/
COPY --link ./packages/sw/build.js ./packages/sw/tsconfig.json ./packages/sw/
COPY --link ./packages/sw/src/ ./packages/sw/src/
COPY --link ./packages/misskey-bubble-game/build.js ./packages/misskey-bubble-game/tsconfig.json ./packages/misskey-bubble-game/
COPY --link ./packages/misskey-bubble-game/src/ ./packages/misskey-bubble-game/src/
COPY --link ./packages/misskey-reversi/build.js ./packages/misskey-reversi/tsconfig.json ./packages/misskey-reversi/
COPY --link ./packages/misskey-reversi/src/ ./packages/misskey-reversi/src/
COPY --link ./packages/misskey-js/build.js ./packages/misskey-js/tsconfig.json ./packages/misskey-js/
COPY --link ./packages/misskey-js/src/ ./packages/misskey-js/src/
COPY --link ./packages/backend/.swcrc ./packages/backend/
COPY --link ./packages/backend/src/ ./packages/backend/src/
COPY --link ./locales/ ./locales/
COPY --link ./packages/frontend/vite.config.ts ./packages/frontend/vite.json5.ts ./packages/frontend/tsconfig.json ./packages/frontend/
COPY --link ./packages/frontend/assets/ ./packages/frontend/assets/
COPY --link ./packages/frontend/lib/ ./packages/frontend/lib/
COPY --link ./packages/frontend/src/ ./packages/frontend/src/
COPY --link ./scripts/changelog-checker/.gitignore ./scripts/changelog-checker/
COPY --link ./packages/misskey-js/generator/.gitignore ./packages/misskey-js/generator/
COPY --link ./packages/frontend/.storybook/.gitignore ./packages/frontend/.storybook/
COPY --link ./packages/frontend/.gitignore ./packages/frontend/
COPY --link ./.gitignore ./
COPY --link ./.git/ ./.git/
COPY --link --from=submodule /misskey/fluent-emojis/ ./fluent-emojis/

RUN pnpm build


# build native dependencies for target platform

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION} AS target-builder

ENV NODE_ENV=production

RUN apt-get update && \
	apt-get install -yqq --no-install-recommends \
	build-essential

RUN corepack enable

WORKDIR /misskey

COPY --link ./scripts/ ./scripts/
COPY --link ./packages/misskey-bubble-game/package.json ./packages/misskey-bubble-game/
COPY --link ./packages/misskey-reversi/package.json ./packages/misskey-reversi/
COPY --link ./packages/misskey-js/package.json ./packages/misskey-js/
COPY --link ./packages/backend/package.json ./packages/backend/
COPY --link ./pnpm-lock.yaml ./pnpm-workspace.yaml ./package.json ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
	pnpm i --frozen-lockfile --aggregate-output


# build final image

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION}-slim AS runner

ARG UID="991"
ARG GID="991"

RUN apt-get update && \
	apt-get install -y --no-install-recommends \
	ffmpeg tini curl libjemalloc-dev libjemalloc2 && \
	ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
	corepack enable && \
	groupadd -g "${GID}" misskey && \
	useradd -l -u "${UID}" -g "${GID}" -m -d /misskey misskey && \
	find / -type d -path /sys -prune -o -type d -path /proc -prune -o -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; && \
	find / -type d -path /sys -prune -o -type d -path /proc -prune -o -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \; && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists

USER misskey
WORKDIR /misskey

COPY --chown=misskey:misskey ./packages/sw/package.json ./packages/sw/
COPY --chown=misskey:misskey ./packages/misskey-bubble-game/package.json ./packages/misskey-bubble-game/
COPY --chown=misskey:misskey ./packages/misskey-reversi/package.json ./packages/misskey-reversi/
COPY --chown=misskey:misskey ./packages/misskey-js/package.json ./packages/misskey-js/
COPY --chown=misskey:misskey ./packages/backend/package.json ./packages/backend/ormconfig.js ./packages/backend/
COPY --chown=misskey:misskey ./packages/backend/assets/ ./packages/backend/assets/
COPY --chown=misskey:misskey ./packages/backend/scripts/ ./packages/backend/scripts/
COPY --chown=misskey:misskey ./packages/backend/nsfw-model/ ./packages/backend/nsfw-model/
COPY --chown=misskey:misskey ./packages/backend/migration/ ./packages/backend/migration/
COPY --chown=misskey:misskey ./packages/frontend/assets/ ./packages/frontend/assets/
COPY --chown=misskey:misskey ./.node-version ./package.json ./pnpm-workspace.yaml ./
COPY --chown=misskey:misskey ./healthcheck.sh ./
COPY --chown=misskey:misskey --from=submodule /misskey/fluent-emojis/ ./fluent-emojis/
COPY --chown=misskey:misskey --from=native-builder /misskey/packages/misskey-bubble-game/built/ ./packages/misskey-bubble-game/built/
COPY --chown=misskey:misskey --from=native-builder /misskey/packages/misskey-reversi/built/ ./packages/misskey-reversi/built/
COPY --chown=misskey:misskey --from=native-builder /misskey/packages/misskey-js/built/ ./packages/misskey-js/built/
COPY --chown=misskey:misskey --from=native-builder /misskey/packages/backend/built/ ./packages/backend/built/
COPY --chown=misskey:misskey --from=native-builder /misskey/built/ ./built/
COPY --chown=misskey:misskey --from=target-builder /misskey/packages/misskey-bubble-game/node_modules/ ./packages/misskey-bubble-game/node_modules/
COPY --chown=misskey:misskey --from=target-builder /misskey/packages/misskey-reversi/node_modules/ ./packages/misskey-reversi/node_modules/
COPY --chown=misskey:misskey --from=target-builder /misskey/packages/misskey-js/node_modules/ ./packages/misskey-js/node_modules/
COPY --chown=misskey:misskey --from=target-builder /misskey/packages/backend/node_modules/ ./packages/backend/node_modules/
COPY --chown=misskey:misskey --from=target-builder /misskey/node_modules/ ./node_modules/

RUN corepack install

ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so
ENV NODE_ENV=production

HEALTHCHECK --interval=5s --retries=20 CMD ["/bin/bash", "/misskey/healthcheck.sh"]

ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["pnpm", "run", "migrateandstart"]
