// テナントスコープのPrisma拡張クライアント。
//
// 戦略メモ 4.5章のRow Level Security（`prisma/migrations/
// 20260715120100_add_row_level_security/migration.sql`）が参照する
// `app.tenant_id` セッション変数を、クエリと同一コネクション・同一
// トランザクション内で確実に設定してからクエリを実行するためのラッパー。
//
// 実装方式：Prisma Client Extensions の `query.$allOperations` で全クエリを
// 横断的にフックし、各クエリを
//   `$transaction([set_config('app.tenant_id', tenantId, true), 元のクエリ])`
// という2文からなる暗黙のトランザクションとして実行する。
// `set_config(..., true)` の第3引数 `is_local=true` は `SET LOCAL` と同義で、
// トランザクション終了時に自動的に元へ戻る。
//
// 注意点：
// - `$transaction` / `$executeRaw` は「拡張前の素のclient」を閉包で参照する
//   こと。拡張後のclient（このモジュールの戻り値）に対して呼ぶと、
//   $allOperationsフックが再帰的に発火してしまう。
// - RLSは`FORCE ROW LEVEL SECURITY`を付けていてもPostgresの
//   スーパーユーザー接続には適用されない。本番ではAWS RDSのマスターユーザー
//   （非スーパーユーザー）または専用ロールで接続すること
//   （migration.sqlの先頭コメントも参照）。
// - `ForeignWorker`／`IdentifierHistory`等、tenantIdを持たない共有マスタへの
//   クエリはこの関数を経由する必要はない（6章：アクセス制御はAffiliation
//   経由でアプリケーション層が担う）。
//
// 型については、`packages/db/src/index.ts`と同様の理由（このリポジトリの
// 検証環境ではネットワーク制限により`prisma generate`が実行できず、生成済み
// クライアントの型に依存した厳密な型付けを検証できないため）で、
// 意図的に緩い型に留めている。呼び出し側（apps/api）は
// `PrismaClient`（生成後の実体）を渡すこと。

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function forTenant(client: any, tenantId: string): any {
  if (!tenantId) {
    // 空文字列やundefinedをそのまま`set_config`に渡すと、RLS側の
    // `NULLIF(current_setting(...), '')`がNULL化しfail-closed（何も見えない）
    // になるだけで実行時エラーにはならないが、呼び出し側のバグを早期に
    // 検知できるよう明示的に弾く。
    throw new Error("forTenant: tenantId is required");
  }

  return client.$extends({
    name: "tenant-context",
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async $allOperations({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
          const [, result] = await client.$transaction([
            client.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    },
  });
}
