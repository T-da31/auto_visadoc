/**
 * モジュール境界ルール（戦略メモ 4章「モジュラーモノリス」方針）
 *
 * - ドメインモジュール（gaikokujinzai / tokutei-ginou / ikusei-shurou / chouhyou）は
 *   ディレクトリ単位で分離し、モジュール間は各モジュールの public-api（index.ts）
 *   経由でのみ連携する。内部ファイルへの直接依存は将来のリポジトリ分割を
 *   困難にするため、ここで機械的に検知して禁止する。
 * - 帳票（chouhyou）モジュールは「入力データ→生成文書」の契約のみで完結させ、
 *   特定技能・育成就労固有のモジュールへ依存してはならない（4章参照）。
 */
module.exports = {
  forbidden: [
    {
      name: "no-cross-module-internal-import",
      comment:
        "他ドメインモジュールの内部ファイルへ直接依存せず、index.ts（public-api）経由で連携すること",
      severity: "error",
      from: {
        path: "^apps/api/src/modules/([^/]+)/",
      },
      to: {
        path: "^apps/api/src/modules/([^/]+)/(?!index\\.ts$).+",
        pathNot: "^apps/api/src/modules/$1/",
      },
    },
    {
      name: "chouhyou-must-stay-domain-agnostic",
      comment:
        "帳票モジュールは特定技能・育成就労・外国人財モジュールを知ってはならない（帳票エンジン独立の前提）",
      severity: "error",
      from: {
        path: "^apps/api/src/modules/chouhyou/",
      },
      to: {
        path: "^apps/api/src/modules/(gaikokujinzai|tokutei-ginou|ikusei-shurou)/",
      },
    },
    {
      name: "no-circular",
      comment: "循環依存は禁止",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    // dependency-cruiser の簡易tsconfigパーサーはネストしたextendsの相対パス解決に
    // 対応していないため、apps/api/tsconfig.json を継承させず、検査専用の
    // フラットなtsconfig（tsconfig.depcruise.json）を用意している。
    tsConfig: {
      fileName: "tsconfig.depcruise.json",
    },
  },
};
