# taiyme/misskeyのリリース手順

## Pull Requestの作成

`release`ブランチに対するPRを作成する。
このとき、PRの本文にチェンジログを書く。
タイトルは影響しない。

## Pull Requestにラベルを付与

作成したPRに`release-major`, `release-minor`, `release-patch`のいずれかのラベルを付与する。
被せて付与することも可能だが、最上位のバージョン更新のみが適用される。

## Github Actionsの完了を待つ

待ちましょう。
Githubに障害等がなければ10分程度で終わる。

## リリース完了

リリース完了。
`https://github.com/taiyme/misskey/releases/latest`から最新のリリースを確認できる。
