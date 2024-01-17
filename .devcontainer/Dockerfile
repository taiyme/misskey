FROM node:20.10.0-bookworm

ARG UID=1000
ARG GID=1000

WORKDIR /workspace

RUN apt-get update && \
  apt-get install -y --no-install-recommends sudo man lsof && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* && \
  echo "node   ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
  corepack enable

USER node