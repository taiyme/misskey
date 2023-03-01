# Docker Composeを使ったMisskey構築

[Misskey Hubの構築ガイド](https://misskey-hub.net/docs/install/docker.html)とほぼ同じ流れですが、少し異なる箇所もあるので説明します。

## 前提条件

- DockerおよびDocker Composeがインストールされていること
- `docker` コマンドを実行できるユーザでログインしていること

## リポジトリの取得

```sh
git clone -b release https://github.com/taiyme/misskey.git
cd misskey
```

## 設定

各種設定ファイルのサンプルをコピーします。

```sh
cp .config/docker_example.yml .config/default.yml
cp .config/docker_example.env .config/docker.env
```

`default.yml` と `docker.env` をファイル内の説明に従って編集してください。  
ほとんどの場合、`default.yml` のURLの指定だけで動作します。

## 起動

お疲れ様でした。以下のコマンドでMisskeyをPullして起動できます。  
ご使用のインターネット環境によっては時間がかかることがあります。

```sh
docker compose up -d
```

## Misskeyのアップデート方法

```sh
git stash
git checkout release
git pull
git stash pop
docker compose up -d
```

## 特定のバージョンのMisskeyへの切り替え

最新のリリースに不具合がある場合などは以下の手順でバージョンを切り替えられます。
`[version]`に切り替えたいバージョンを入力してください。
バージョン一覧は[ここ](https://github.com/taiyme/misskey/releases)から確認できます。

```sh
git stash
git checkout [version]
git pull
git stash pop
docker compose up -d
```
