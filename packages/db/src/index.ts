// PrismaClient のシングルトン提供。
// `prisma generate` 実行後に `../generated/client` が生成される。
// 生成前の型チェックを通すため、型は any にフォールバックする薄いラッパーとする。

// eslint-disable-next-line @typescript-eslint/no-var-requires
let PrismaClientCtor: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClientCtor = require("../generated/client").PrismaClient;
} catch {
  PrismaClientCtor = class {
    constructor() {
      throw new Error(
        "Prisma Client が未生成です。`npm run generate -w @tokutei-ginou/db` を実行してください。",
      );
    }
  };
}

export const PrismaClient = PrismaClientCtor;

let prismaSingleton: any;

export function getPrismaClient() {
  if (!prismaSingleton) {
    prismaSingleton = new PrismaClientCtor();
  }
  return prismaSingleton;
}

export { forTenant } from "./tenant-context";
