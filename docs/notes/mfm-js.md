# mfm-js

taiymeでは、mfm-jsにいくつかの変更を加えて、pnpm workspaceとしてリポジトリ内に取り込んでいます。

- [backend/src/misc/emoji-regex.ts](../../packages/backend/src/misc/emoji-regex.ts) と同じ内容を [mfm-js/src/internal/emoji-regex.ts](../../packages/mfm-js/src/internal/emoji-regex.ts) に移植
- RJ作品番号のパース機能
- Lintやビルドの手法はmisskey-jsみたいな感じに変更

misskey-dev/mfm.js の取り込み:

```sh
git switch -c update-mfm-js

git rm -r --cached packages/mfm-js
rm -rf packages/mfm-js

git fetch https://github.com/misskey-dev/mfm.js.git <commit-sha>
git read-tree --prefix=packages/mfm-js -u FETCH_HEAD

# 不要な変更まで引っ張ってくるので、頑張って調節してください
```
