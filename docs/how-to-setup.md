# セットアップ手順 (Docker Compose)

taiyme/misskey は、Docker Compose を使用してインストールすることを推奨しています。

## 前提条件

- Docker および Docker Compose がインストールされていること

## ソースコードを取得

`main` ブランチを取得し、`misskey` ディレクトリに移動します。

※ `main` ブランチには、最新リリースのソースコードが含まれています。

```sh
git clone -b main --single-branch https://github.com/taiyme/misskey.git
cd misskey
```

## 構成ファイルの設定

各種構成ファイルをコピーします。

```sh
cp .config/docker_example.yml .config/default.yml
cp .config/docker_example.env .config/docker.env
cp compose_example.yml compose.yaml
```

必要に応じて構成ファイルを編集します。

※ ほとんどの場合、 `.config/default.yml` の `url` を変更するだけで動作します。

## コンテナの起動

コンテナを作成して起動します。

※ ネットワーク環境により、時間がかかる場合があります。

```sh
docker compose up -d
```

## リバースプロキシの設定

Misskey Hub の [Nginxの設定](https://misskey-hub.net/docs/for-admin/install/resources/nginx/) を参照してください。

## アップデートについて

[アップデート手順](./how-to-update.md) を参照してください。
