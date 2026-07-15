-- AlterTable: インボイス制度対応（11章）。発行時点の税率・税額・自社の適格請求書
-- 発行事業者登録番号をスナップショットとして保持する。
ALTER TABLE "core"."Invoice"
  ADD COLUMN     "taxRate" DECIMAL(4,3) NOT NULL DEFAULT 0.10,
  ADD COLUMN     "taxAmount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN     "issuerRegisteredNumber" TEXT;

-- CreateIndex: 名寄せ候補探索（6章）の事前絞り込み高速化
CREATE INDEX "ForeignWorker_familyName_givenName_dateOfBirth_idx"
  ON "gaikokujinzai"."ForeignWorker"("familyName", "givenName", "dateOfBirth");

-- CreateIndex: 在留カード等番号失効情報照会・重複入力チェック（9.5章）
CREATE INDEX "IdentifierHistory_type_number_idx"
  ON "gaikokujinzai"."IdentifierHistory"("type", "number");
