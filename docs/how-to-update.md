# アップデート手順 (Docker Compose)

アップデートの際は、必ず [リリースノート](https://github.com/taiyme/misskey/releases) を確認してください。

## 前提条件

- Docker および Docker Compose がインストールされていること
- `misskey` ディレクトリに移動していること

## ソースコードを取得

`main` ブランチから、最新のソースコードを取得します。

```sh
git stash
git checkout main
git pull
git stash pop
```

## コンテナの起動

コンテナを作成して起動します。

※ ネットワーク環境により、時間がかかる場合があります。

```sh
docker compose up -d
```
