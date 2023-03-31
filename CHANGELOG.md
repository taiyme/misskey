<!--
## 12.x.x (unreleased)

### Improvements

### Bugfixes
- 

You should also include the user name that made the change.
-->

## 12.119.2-taiyme-v1.1.3 (2023/03/31)

- change(frontend): タッチデバイスでのコンテキストメニューを無効化 @taiyme
- fix(frontend): もっと見るを閉じるボタンがボトムメニューに隠れてしまう @taiyme
- chore(frontend): tms: 見やすいリアクションの影を少し薄くする @taiyme
- refactor(frontend): use uuid v4 @taiyme

## 12.119.2-taiyme-v1.1.2 (2023/03/30)

- chore(github/workflow): ジョブの実行順を調整 @taiyme

## 12.119.2-taiyme-v1.1.1 (2023/03/30)

- hotfix(backend): タイムラインの条件式を修正 @taiyme
- hotfix(frontend): tms: Geckoエンジンで見やすいリアクションが正常に描画されない問題 @taiyme
- hotfix(github/workflow): merge PRがコケる問題
- fix: リリース時にバージョン情報が更新されない不具合を修正 (#119) @cffnpwr
- fix(frontend): リアクションが重複してカウントされる, 潰れて描画される問題 @taiyme
- enhance(frontend): MkReactionsViewerをv13仕様に @taiyme

## 12.119.2-taiyme-v1.1.0 (2023/03/29)

- Upgrade pnpm v7.29.1 -> v8.0.0
- update deps
- Update i18n
- hotfix: クリップの作成/追加ができない @taiyme
- fix(frontend): tms: Renoteボタンのカーソル指定を修正 @taiyme
- fix(frontend): Safariでプラグインが複数ある場合に正常に読み込まれない問題を修正 @Fairy-Phy @syuilo @rinsuki
- fix(frontend): 文字数カウンターが表示されないことがある @taiyme
- fix(frontend): ダイアログなどのボタンにフォーカスされない @taiyme
- fix(frontend): ホバー時のURLプレビューにコンテンツ展開ボタンがある @taiyme
- feat(frontend): botアカウントでログイン時にその旨を知らせる表示を追加 (#113) @syuilo @cffnpwr
- feat(mfm): DLsiteのRJ番号をリンク化する (#111) @taiyme
- feat: oEmbedのサポート (#114) @taiyme @saschanaz
- enhance: tms: ノートの操作部をホバー時のみ表示するオプションなど (#106)
  - enhance: tms: ノートの操作部をホバー時のみ表示するオプション @syuilo
  - enhance: tms: ノートのリアクションを見やすくするオプション @taiyme
  - enhance: フォローリクエストのUI改善 @EbiseLutica
  - chore: tms: インスタンスティッカーの調整 @taiyme
  - change: tms: 設定を保存するとき値を比較して同等ならsetしないように @taiyme
  - change/fix: ノートのショートカットキーに関する調整 @taiyme
    - (KeyS): 廃止(検索のショートカットキーがどこでも使えるように)
    - (KeyQ): Renoteメニューが正常に開かない問題を修正
  - fix: 通知のサブアイコンが若干ズレる問題 @taiyme
  - fix: 上向きのページネーションが壊れている @tamaina @Johann150 @acid-chicken
  - (ほか リファクタリングなど) @taiyme @yszkst @cffnpwr
- enhance(frontend): MkDriveをGridレイアウトにする @taiyme
- enhance(frontend): tms: ノートのインスタンス情報の表示位置 (#104) @taiyme
- enhance(frontend): 一部のモーダルで背景クリックしたら閉じるように @taiyme
- enhance(frontend): ウィンドウの絵文字ピッカーをリサイズ可能にする (#101) @taiyme
- Enhance release workflow (#103) @cffnpwr
- perf(backend): improve performance of timeline apis (#115) @syuilo @cffnpwr
- refactor(frontend): use KeyboardEvent.key (+ fix types) @taiyme

## 12.119.2-taiyme-v1.0.48 (2023/03/16)

- feat(frontend): 文字数カウンター (#99) @taiyme
- fix(frontend/backend): deepCloneの戻り値にundefinedを含まないように @taiyme
- chore(frontend): fix types (plugin) @taiyme

## 12.119.2-taiyme-v1.0.47 (2023/03/14)

- Update pnpm v7.28.0 -> v7.29.1
- Update: ローカルのみ -> 連合なし @taiyme
- fix: koa/routerのバージョンを9.0.1から上げるとURL内のパラメータを正しく読み取れない (#94) @cffnpwr
- chore(client): tweak user-info.vue @taiyme
- enhance(client): MkPageHeaderをv13仕様にする (#87) @taiyme @tamaina
- リアクション履歴が公開なら、ログインしていなくても表示できるように @m-hayabusa @taiyme
- enhance(client): rippleエフェクト/reactエフェクト @taiyme
- enhance(frontend): デッキUIのカラムにリロードボタンを追加 @taiyme
- enhance(frontend): メインカラムが無い場合の挙動を調整 @taiyme
- enhance(frontend): tms: リアクションメニュー (#92) @taiyme
- taiyme-servicesの設定をmisskey本体の設定から分離して端末間で同期するようにした (#85) @cffnpwr @taiyme
- enhance(frontend): モバイル表示の公開範囲ピッカーを見やすくする @taiyme
- enhance(backend): 配送先が410 Goneで応答した場合は自動で配送を停止するように (#96) @Steve-0628 @CyberRex0
- refactor(frontend): Use Clipboard API @taiyme
- refactor/perf(frontend): 未使用のimportを削除 / v-bind:keyを記述 (#93) @taiyme
- refactor(frontend): fix types I18nObject @taiyme
- refactor(frontend): fix types, use arrow functions @taiyme
- refactor(frontend): parseObject / parseArray (wrapper function for JSON.parse) @taiyme

## 12.119.2-taiyme-v1.0.46 (2023/03/07)

- fix(backend): block delivery @atsu1125 @taiyme
- fix(backend): Set correct access control of admin/drive/files @CyberRex0
- fix(client): チャートのツールチップが画面に残ることがあるのを修正
- enhance(client): fixMentionsHost @taiyme
- perf: deepClone @syuilo
- [Fix] fixed an typo in error message @daima3629
- enhance(client): make possible to reload page of window @syuilo
- fix(client): チャンネル一覧が最大5個までしか表示されない @taiyme
- enhance(client): ノートメニューからユーザーメニューを開けるように @syuilo
- enhance(client): improve clip menu ux @syuilo
- chore(client): tweak modal/contextmenu position calculation @syuilo

## 12.119.2-taiyme-v1.0.45 (2023/03/05)

- fix: dockerイメージのビルドの際に明示的にブランチを指定 (#80) @cffnpwr
- fix(client): tms: レートリミット対策 @taiyme

## 12.119.2-taiyme-v1.0.44 (2023/03/05)

- hotfix: misskeyのバージョン表示が変わらない問題を修正 (#78) @cffnpwr 

## 12.119.2-taiyme-v1.0.43 (2023/03/05)

- enhance(client): モデレーション画面のスイッチトグルをプルダウンにする @taiyme
- enhance(server): アンテナの検索対象にCWを追加 @taiyme
- fix: 何故かバージョンが下がった依存関係を修正 (#74) @cffnpwr
- fix: 検索画面が開かないバグを修正 @cffnpwr
- **feat(client): tms: いまのなし (#75)** @taiyme

## 12.119.2-taiyme-v1.0.42 (2023/03/03)

- fix: CHANGELOG.mdの変更をマージ後に行なうように修正 (https://github.com/taiyme/misskey/pull/65) @cffnpwr
- Hotfix: arm64 docker image (https://github.com/taiyme/misskey/pull/66) @cffnpwr
- Feature: photo drawer swipe (https://github.com/taiyme/misskey/pull/68) @cffnpwr

## 12.119.2-taiyme-v1.0.41 (2023/03/01)

- feat: upgrade dependencies (#54) @cffnpwr @taiyme
- enhance(mfm): fn.font className @taiyme
- fix: 謎のfile:ディレクトリができる現象を修正 (#60) @cffnpwr
- GitHub Actionsによるリリースの自動化 (#62) @cffnpwr

## 12.119.2-taiyme-v1.0.40 (2023/02/27)

- fix: 複数のタグを持たせるとGithub Actionsがコケるのを修正 (#45) @cffnpwr
- Hotfix: GitHub actions build amd64 (#46) @cffnpwr
- enhance(client): tms: 一度見たノートのRenoteを畳む (#48) @taiyme

## 12.119.2-taiyme-v1.0.39 (2023/02/26)

- hotfix(client): tms: numberquote/_nqadd

## 12.119.2-taiyme-v1.0.38 (2023/02/26)

- **feat(client): tms: パクる・数字引用** @taiyme
- Update pnpm 7.27.1 to 7.28.0

## 12.119.2-taiyme-v1.0.37 (2023/02/26)

- Update ja-KS.yml (#43) @DA-TENSHI
- enhance: Github ActionsでのDockerイメージのビルドの高速化 (#44) @cffnpwr

## 12.119.2-taiyme-v1.0.36 (2023/02/25)

- feat(client): 宛先ダイアログ @taiyme
- enhance(client): has authority @taiyme

## 12.119.2-taiyme-v1.0.35 (2023/02/24)

- hotfix: add chokidar to dependencies (#41) @cffnpwr

## 12.119.2-taiyme-v1.0.34 (2023/02/24)

- カラムの見た目を他と統一 (#36) @hyuoou
- feat: swc on windows (#37) @cffnpwr
- feat(server): add @swc/core-android-arm64 to optional (#38) @cffnpwr
- tms: fix types @taiyme
- Feature/fix dev (#39) @cffnpwr

## 12.119.2-taiyme-v1.0.33 (2023/02/23)

- perf(server): アンテナの作成を5つに制限 @taiyme
- refactor(client): explicit showing property for tooltips @saschanaz
- fix: sanitize url @mei23 @syuilo
- fix(client): 一部のダイアログがMFMとしてパースされる @taiyme
- feat(client): チャンネルカラムとお気に入りカラムを追加 #35 @taiyme

## 12.119.2-taiyme-v1.0.32 (2023/02/22)

- Update pnpm 7.27.0 to 7.27.1
- fix(client): メンションがpadding分はみ出る
- enhance(server): アンテナ機能で投稿が適切に取得できるように @Steve-0628 @taiyme
- test(server): isDeleted判定をやめてみる refs #31
- enhance: docker composeでもキャッシュをダウンロードできるようにした (#32) @cffnpwr
- enhance(client): カスタム絵文字が存在しない場合の表示 @taiyme
- enhance: ワードミュート機能を強化 refs #33 @taiyme

Docker環境で利用する方向けのドキュメントが完成しました。  
[Docker Composeを使ったMisskey構築](./docs/install-docker.md)を参照してください。

## 12.119.2-taiyme-v1.0.31 (2023/02/20)

- hotfix(client): リアクション一覧がページネーションされない問題 @taiyme
- enhance(client): add admin to user-info.vue @taiyme
- enhance(client): 通知のノートサマリーを1行にする @syuilo @tamaina @taiyme
- enhance(client): メンションがはみ出る場合は省略する @taiyme
- feat(client): クイックアクションの照会機能 @taiyme
- allow admin to view user's all notes @Steve-0628

## 12.119.2-taiyme-v1.0.30 (2023/02/19)

- hotfix(server): 自分自身の場合管理者権限を削除できないように #22 @taiyme

## 12.119.2-taiyme-v1.0.29 (2023/02/19)

- hotfix: node 18.14.1 security update @cffnpwr
- feat: GitHub actions docker build (#23) @cffnpwr
- feat(client): Renoteした人一覧 #20 @taiyme
- feat: GUIからadminを追加/削除できるように #22 @r-ca @taiyme

@cffnpwr によってtaiyme/misskeyの更新状況を投稿するbotが誕生しました: [@github@mk.taiy.me](https://mk.taiy.me/@github)

## 12.119.2-taiyme-v1.0.28 (2023/02/18)

- enhance(client): add caption in FormSection @taiyme
- enhance(client): 見やすい通報UI #14 @taiyme
- Update patrons

## 12.119.2-taiyme-v1.0.27 (2023/02/17)

- tms: tweak
- enhance(client): モバイル表示のボトムメニューをv13仕様に(デッキUI) @taiyme
- enhance(client): 管理者/モデレーターのアイコンを変更 #7 (500px未満) @taiyme

## 12.119.2-taiyme-v1.0.26 (2023/02/17)

- enhance(client): tms: タブと値チェック強化 @taiyme
- enhance(client): 管理者/モデレーターのアイコンを変更 #7 @taiyme
- enhance(client): case insensitive emoji search (misskey-dev/misskey#9346) @saschanaz
- Update contributors

## 12.119.2-taiyme-v1.0.25 (2023/02/17)

- enhance(client): tabler icons v2 @cffnpwr @taiyme
- fix(server): アンテナタイムライン（ストリーミング）が、フォローしていないユーザーの鍵投稿も拾ってしまう問題を修正 @syuilo @taiyme

## 12.119.2-taiyme-v1.0.24 (2023/02/16)

- **feat(client): グループ機能を復活 #15** @taiyme
- fix: .dockerignoreでignoreすべきファイルの指定を修正 (#17) @cffnpwr
- fix(client): 引用内・返信元の長文ノートが畳まれない・畳まれていても開くと閉じられない (#16) @taiyme
- enhance(client): 迷惑になる可能性のある投稿を行う前に警告を表示 @syuilo @taiyme
- fix(client): クライアント起動時にも言語ファイルのチェックを行うように #9 @syuilo

## 12.119.2-taiyme-v1.0.23 (2023/02/15)

- fix(client): ミュートされたノートのユーザー名がはみ出る @taiyme
- fix(client): validate urls to improve security @syuilo
- **新机能(ケう亻マソ卜): 怪レい日本语ゐ亻ソヌ卜ー儿が完了レまレだ！** @taiyme @HiSubway

## 12.119.2-taiyme-v1.0.22 (2023/02/15)

- chore(client): donate @taiyme

## 12.119.2-taiyme-v1.0.21 (2023/02/15)

- enhance(client): モバイル表示のボトムメニューをv13仕様に @taiyme
- fix(client): ぼかし効果のデフォルト値を戻す @taiyme
- fix(client): Wrap user name text on MkNoteDetailed @tamaina
- hotfix: migration, nsfw-model, assetsの追加忘れ @cffnpwr

## 12.119.2-taiyme-v1.0.20 (2023/02/15)

- taiyme-services (#3) @taiyme

## 12.119.2-taiyme-v1.0.19 (2023/02/14)

- feat: yarn to pnpm (#8) @cffnpwr
- feat: node v16 to v18 (#10) @cffnpwr
- enhance: Dockerまわりの整備 (#12) @cffnpwr

## 12.119.2-taiyme-v1.0.18 (2023/02/14)

## 12.119.2-taiyme-v1.0.17 (2023/02/14)

- feat(client): taiyme-services @taiyme
- enhance(client): インスタンス情報を左端に移動させる (#4) @taiyme

## 12.119.2-taiyme-v1.0.16 (2023/02/13)

## 12.119.2-taiyme-v1.0.15 (2023/02/13)

- enhance: Alt text in image viewer @taiyme @nullobsi @tamaina @syuilo
- enhance(client): MkNote isLong condexp @taiyme

## 12.119.2-taiyme-v1.0.14 (2023/02/13)

- feat(client): yt-player (for v12) @taiyme @sim1222 @syuilo

## 12.119.2-taiyme-v1.0.13 (2023/02/12)

- enhance(client): 管理者とモデレーターが他人のRenoteを解除できるように 

## 12.119.2-taiyme-v1.0.12 (2023/02/12)

- enhance(client): add new mfm function (scale, position, fg, bg) (for v12) @taiyme @syuilo @itiradi

## 12.119.2-taiyme-v1.0.11 (2023/02/11)

- enhance(client): notification toast (for v12) @taiyme @syuilo @melt-adzuki

## 12.119.2-taiyme-v1.0.10 (2023/02/11)

- fix: 引用内の文章をnyaizeをしないように (for v12) @kabo2468 @syuilo

## 12.119.2-taiyme-v1.0.9 (2023/02/11)

## 12.119.2-taiyme-v1.0.8 (2023/02/11)

## 12.119.2-taiyme-v1.0.7 (2023/02/11)

- feat(client): Use tabler icons (for v12) @taiyme
- feat(client): リアクション一覧詳細ダイアログを表示できるように (for v12) @taiyme

## 12.119.2-taiyme-v1.0.6 (2023/02/10)

## 12.119.2-taiyme-v1.0.5 (2023/02/10)

## 12.119.2-taiyme-v1.0.4 (2023/02/10)

## 12.119.2-taiyme-v1.0.3 (2023/02/10)

- enhance(client): tweak medialist style (for v12)
- フォロー、フォロワーのページでフォローされていることを表示 (misskey-dev/misskey#9093) @nenohi @syuilo @taiyme

## 12.119.2-taiyme-v1.0.2 (2023/02/10)

## 12.119.2-taiyme-v1.0.1 (2023/02/09)

- fix(client): clarify to use props.url (misskey-dev/misskey#9143) @futchitwo
- fix(server): improve security @syuilo
- fix: SQL LIKE escape
- fix(client): 検索ダイアログと絵文字ピッカーで変換確定するとそのまま検索してしまう @tamaina

## 12.119.2-taiyme-v1.0.0 (2023/02/09)

[See here for v12.119.2 or earlier](https://github.com/misskey-dev/misskey/blob/12.119.2/CHANGELOG.md)
