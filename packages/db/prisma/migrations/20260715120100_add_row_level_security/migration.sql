-- Row Level Security（テナント間データ分離）
--
-- 戦略メモ 4.5章「Row Level Security（RLS）によるマルチテナントのテナント間
-- データ分離をDBレベルで強制できる」を実装する。
--
-- 運用前提（apps/api 側の実装が必要）：
--   1. アプリのDB接続ロールは、マイグレーション実行ロール（テーブル所有者）とは
--      別の、Postgresスーパーユーザーではないロールにすること。
--      FORCE ROW LEVEL SECURITY を付けているため所有者にもポリシーが適用されるが、
--      スーパーユーザーは常にRLSをバイパスするため、AWS RDSのマスターユーザー
--      （非スーパーユーザー）を利用するか、専用の実行ロールを分けること。
--   2. リクエスト（トランザクション）開始時に必ず
--        SET LOCAL app.tenant_id = '<uuid>';
--      を実行してからクエリを発行すること（NestJS側でPrismaの
--      $transaction / ミドルウェアとして実装する。未実装の間はテーブル所有者
--      ロールで接続している限りRLSは効かないので注意）。
--   3. current_setting('app.tenant_id', true) が未設定（NULL）の場合は
--      全行が非該当となり、fail-closed（何も見えない）になる設計としている。
--
-- 適用範囲外（意図的）：
--   gaikokujinzai."ForeignWorker" / "IdentifierHistory" /
--   "ForeignWorkerMatchCandidate" / "ForeignWorkerMergeRecord" は
--   tenantId を持たない（6章：外国人材データは他ドメインから独立管理される
--   共有マスタであり、特定の1テナントに帰属しない）。これらへのアクセス制御は
--   Affiliation（所属）経由の関連チェックとしてアプリケーション層で行う。

-- ============================================================
-- core
-- ============================================================

ALTER TABLE "core"."Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."Tenant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."Tenant"
  USING ("id" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "core"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."User" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."User"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "core"."Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."Invitation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."Invitation"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "core"."ProxyDataEntryGrant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."ProxyDataEntryGrant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."ProxyDataEntryGrant"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "core"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."AuditLog" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."AuditLog"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "core"."ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."ConsentRecord" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."ConsentRecord"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "core"."Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."Invoice" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."Invoice"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "core"."DataImportBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."DataImportBatch" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "core"."DataImportBatch"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- ============================================================
-- gaikokujinzai（tenantId を持つテーブルのみ。ForeignWorker等は対象外）
-- ============================================================

ALTER TABLE "gaikokujinzai"."Affiliation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gaikokujinzai"."Affiliation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "gaikokujinzai"."Affiliation"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "gaikokujinzai"."StatusChangeRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gaikokujinzai"."StatusChangeRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "gaikokujinzai"."StatusChangeRequest"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- ============================================================
-- tokutei_ginou
-- ============================================================

ALTER TABLE "tokutei_ginou"."TokuteiGinouDocumentCase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tokutei_ginou"."TokuteiGinouDocumentCase" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "tokutei_ginou"."TokuteiGinouDocumentCase"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 健康診断書は要配慮個人情報を含まない（6章：ステータスのみ保持）が、
-- 「誰の健康診断が完了したか」自体は他テナントに見せるべきではないため対象に含める。
ALTER TABLE "tokutei_ginou"."HealthCheckupProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tokutei_ginou"."HealthCheckupProgress" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "tokutei_ginou"."HealthCheckupProgress"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE "tokutei_ginou"."AttachmentChecklistItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tokutei_ginou"."AttachmentChecklistItem" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "tokutei_ginou"."AttachmentChecklistItem"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- ============================================================
-- ikusei_shurou
-- ============================================================

ALTER TABLE "ikusei_shurou"."TrainingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ikusei_shurou"."TrainingPlan" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "ikusei_shurou"."TrainingPlan"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- ============================================================
-- chouhyou
-- ============================================================

-- DocumentTemplate は tenantId が NULL 許容（4.7章：運営提供テンプレートは
-- 全テナント共有、ユーザー原本インポートのみ特定テナントに帰属）。
ALTER TABLE "chouhyou"."DocumentTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chouhyou"."DocumentTemplate" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_or_shared ON "chouhyou"."DocumentTemplate"
  USING (
    "tenantId" IS NULL
    OR "tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  );

ALTER TABLE "chouhyou"."DocumentGeneration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chouhyou"."DocumentGeneration" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "chouhyou"."DocumentGeneration"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
