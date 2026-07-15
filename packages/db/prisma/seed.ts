// フェーズ1（雇用条件書）の運営提供テンプレートをDocumentTemplateとして登録する。
// sourcePathはapps/api起動時のcwd（apps/apiディレクトリ）からの相対パスとして
// ChouhyouService側で解決される点に注意（apps/api/assets/...ではない）。
import { getPrismaClient } from "../src";

async function main() {
  const prisma = getPrismaClient();

  const key = "employment_condition_notice";
  const version = "v1";

  const existing = await prisma.documentTemplate.findFirst({
    where: { key, version, tenantId: null },
  });

  if (existing) {
    console.log(`already seeded: ${existing.id}`);
    return;
  }

  const created = await prisma.documentTemplate.create({
    data: {
      key,
      name: "雇用条件書（参考様式第1-6号準拠）",
      version,
      format: "DOCX",
      isUserProvided: false,
      sourcePath:
        "assets/templates/tokutei-ginou/employment-condition-notice/v1.docx",
    },
  });

  console.log(`seeded: ${created.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrismaClient().$disconnect();
  });
