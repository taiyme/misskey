<!--
## 12.x.x (unreleased)

### Improvements

### Bugfixes
- 

You should also include the user name that made the change.
-->

## 1.0.31 (2023/02/20)

- hotfix(client): リアクション一覧がページネーションされない問題 @taiyme
- enhance(client): add admin to user-info.vue @taiyme
- enhance(client): 通知のノートサマリーを1行にする @syuilo @tamaina @taiyme
- enhance(client): メンションがはみ出る場合は省略する @taiyme
- feat(client): クイックアクションの照会機能 @taiyme
- allow admin to view user's all notes @Steve-0628

## 1.0.30 (2023/02/19)

- hotfix(server): 自分自身の場合管理者権限を削除できないように #22 @taiyme

## 1.0.29 (2023/02/19)

- hotfix: node 18.14.1 security update @cffnpwr
- feat: GitHub actions docker build (#23) @cffnpwr
- feat(client): Renoteした人一覧 #20 @taiyme
- feat: GUIからadminを追加/削除できるように #22 @r-ca @taiyme

@cffnpwr によってtaiyme/misskeyの更新状況を投稿するbotが誕生しました: [@github@mk.taiy.me](https://mk.taiy.me/@github)

## 1.0.28 (2023/02/18)

- enhance(client): add caption in FormSection @taiyme
- enhance(client): 見やすい通報UI #14 @taiyme
- Update patrons

## 1.0.27 (2023/02/17)

- tms: tweak
- enhance(client): モバイル表示のボトムメニューをv13仕様に(デッキUI) @taiyme
- enhance(client): 管理者/モデレーターのアイコンを変更 #7 (500px未満) @taiyme

## 1.0.26 (2023/02/17)

- enhance(client): tms: タブと値チェック強化 @taiyme
- enhance(client): 管理者/モデレーターのアイコンを変更 #7 @taiyme
- enhance(client): case insensitive emoji search (misskey-dev/misskey#9346) @saschanaz
- Update contributors

## 1.0.25 (2023/02/17)

- enhance(client): tabler icons v2 @cffnpwr @taiyme
- fix(server): アンテナタイムライン（ストリーミング）が、フォローしていないユーザーの鍵投稿も拾ってしまう問題を修正 @syuilo @taiyme

## 1.0.24 (2023/02/16)

- **feat(client): グループ機能を復活 #15** @taiyme
- fix: .dockerignoreでignoreすべきファイルの指定を修正 (#17) @cffnpwr
- fix(client): 引用内・返信元の長文ノートが畳まれない・畳まれていても開くと閉じられない (#16) @taiyme
- enhance(client): 迷惑になる可能性のある投稿を行う前に警告を表示 @syuilo @taiyme
- fix(client): クライアント起動時にも言語ファイルのチェックを行うように #9 @syuilo

## 1.0.23 (2023/02/15)

- fix(client): ミュートされたノートのユーザー名がはみ出る @taiyme
- fix(client): validate urls to improve security @syuilo
- **新机能(ケう亻マソ卜): 怪レい日本语ゐ亻ソヌ卜ー儿が完了レまレだ！** @taiyme @HiSubway

## 1.0.22 (2023/02/15)

- chore(client): donate @taiyme

## 1.0.21 (2023/02/15)

- enhance(client): モバイル表示のボトムメニューをv13仕様に @taiyme
- fix(client): ぼかし効果のデフォルト値を戻す @taiyme
- fix(client): Wrap user name text on MkNoteDetailed @tamaina
- hotfix: migration, nsfw-model, assetsの追加忘れ @cffnpwr

## 1.0.20 (2023/02/15)

- taiyme-services (#3) @taiyme

## 1.0.19 (2023/02/14)

- feat: yarn to pnpm (#8) @cffnpwr
- feat: node v16 to v18 (#10) @cffnpwr
- enhance: Dockerまわりの整備 (#12) @cffnpwr

## 1.0.18 (2023/02/14)

## 1.0.17 (2023/02/14)

- feat(client): taiyme-services @taiyme
- enhance(client): インスタンス情報を左端に移動させる (#4) @taiyme

## 1.0.16 (2023/02/13)

## 1.0.15 (2023/02/13)

- enhance: Alt text in image viewer @taiyme @nullobsi @tamaina @syuilo
- enhance(client): MkNote isLong condexp @taiyme

## 1.0.14 (2023/02/13)

- feat(client): yt-player (for v12) @taiyme @sim1222 @syuilo

## 1.0.13 (2023/02/12)

- enhance(client): 管理者とモデレーターが他人のRenoteを解除できるように 

## 1.0.12 (2023/02/12)

- enhance(client): add new mfm function (scale, position, fg, bg) (for v12) @taiyme @syuilo @itiradi

## 1.0.11 (2023/02/11)

- enhance(client): notification toast (for v12) @taiyme @syuilo @melt-adzuki

## 1.0.10 (2023/02/11)

- fix: 引用内の文章をnyaizeをしないように (for v12) @kabo2468 @syuilo

## 1.0.9 (2023/02/11)

## 1.0.8 (2023/02/11)

## 1.0.7 (2023/02/11)

- feat(client): Use tabler icons (for v12) @taiyme
- feat(client): リアクション一覧詳細ダイアログを表示できるように (for v12) @taiyme

## 1.0.6 (2023/02/10)

## 1.0.5 (2023/02/10)

## 1.0.4 (2023/02/10)

## 1.0.3 (2023/02/10)

- enhance(client): tweak medialist style (for v12)
- フォロー、フォロワーのページでフォローされていることを表示 (misskey-dev/misskey#9093) @nenohi @syuilo @taiyme

## 1.0.2 (2023/02/10)

## 1.0.1 (2023/02/09)

- fix(client): clarify to use props.url (misskey-dev/misskey#9143) @futchitwo
- fix(server): improve security @syuilo
- fix: SQL LIKE escape
- fix(client): 検索ダイアログと絵文字ピッカーで変換確定するとそのまま検索してしまう @tamaina

## 1.0.0 (2023/02/09)

[See here for v12.119.2 or earlier](https://github.com/misskey-dev/misskey/blob/12.119.2/CHANGELOG.md)
