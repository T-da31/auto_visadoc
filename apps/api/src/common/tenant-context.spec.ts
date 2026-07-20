import { forTenant } from "@tokutei-ginou/db";

// forTenant()（packages/db/src/tenant-context.ts）が、実際のPostgres/Prismaに
// 依存せず正しく「set_configとクエリを同一トランザクションにまとめて実行し、
// クエリ側の結果だけを返す」という核心ロジックを持っているかを検証する。
// RLSポリシー自体（app.tenant_idによるテナント分離）が実際に効くかどうかは
// 実DBでの検証が必要（戦略メモ 13.5章参照。ローカルDocker Postgresでの
// prisma migrate deploy / migrate dev --create-only による検証で確認済み）。
describe("forTenant", () => {
  function createFakeClient() {
    const transactionCalls: unknown[][] = [];

    const fakeClient: any = {
      $executeRaw(strings: TemplateStringsArray, ...values: unknown[]) {
        return { __kind: "executeRaw", sql: strings.join("?"), values };
      },
      $transaction: jest.fn(async (ops: unknown[]) => {
        transactionCalls.push(ops);
        // $transaction([executeRawの疑似オブジェクト, queryのPromise]) を
        // 両方awaitして配列で返す、という実際のPrismaの挙動を模す。
        return Promise.all(ops.map((op) => Promise.resolve(op)));
      }),
      $extends(config: {
        query: {
          $allModels: {
            $allOperations: (params: {
              model: string;
              operation: string;
              args: unknown;
              query: (args: unknown) => Promise<unknown>;
            }) => Promise<unknown>;
          };
        };
      }) {
        const intercept = config.query.$allModels.$allOperations;
        return {
          someModel: {
            findMany: (args: unknown) =>
              intercept({
                model: "someModel",
                operation: "findMany",
                args,
                query: async (a: unknown) => ({ received: a }),
              }),
          },
        };
      },
    };

    return { fakeClient, transactionCalls };
  }

  it("set_configとクエリを同一トランザクションにまとめ、クエリ側の結果のみを返す", async () => {
    const { fakeClient, transactionCalls } = createFakeClient();

    const scoped = forTenant(fakeClient, "tenant-123");
    const result = await scoped.someModel.findMany({ where: { x: 1 } });

    expect(result).toEqual({ received: { where: { x: 1 } } });
    expect(fakeClient.$transaction).toHaveBeenCalledTimes(1);

    const [setConfigOp] = transactionCalls[0] as any[];
    expect(setConfigOp.__kind).toBe("executeRaw");
    expect(setConfigOp.values).toEqual(["tenant-123"]);
    expect(setConfigOp.sql).toContain("set_config");
    expect(setConfigOp.sql).toContain("app.tenant_id");
  });

  it("tenantIdが空文字列の場合はエラーを投げる（fail-closedを補強する早期バリデーション）", () => {
    expect(() => forTenant({} as any, "")).toThrow(/tenantId/);
  });
});
