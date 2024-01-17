#!/bin/sh

set -xe

cp .devcontainer/devcontainer.yml .config/default.yml
pnpm install
