# バージョン管理

upstream (上流、misskey-dev/misskey のこと) の変更を取り込むとき、そのupstreamのバージョンを [package.json](../../package.json) の `upstreamVersion` フィールドとして保持します。

`version` フィールドを変更するとき (bump version) は、`upstreamVersion` フィールドを参照します。

`version` フィールドは、 `${upstreamVersion}-taiyme.${number}` であることが期待されます。
