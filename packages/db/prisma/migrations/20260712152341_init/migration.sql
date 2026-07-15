-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "chouhyou";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "gaikokujinzai";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ikusei_shurou";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tokutei_ginou";

-- CreateEnum
CREATE TYPE "core"."UserRole" AS ENUM ('COMPANY_ADMIN', 'COMPANY_STAFF', 'GYOSEI_SHOSHI', 'SHIEN_KIKAN', 'PLATFORM_OPERATOR');

-- CreateEnum
CREATE TYPE "core"."PlanTier" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "core"."ConsentCategory" AS ENUM ('SERVICE_IMPROVEMENT_ANALYTICS', 'ANONYMIZED_INDUSTRY_REPORT', 'THIRD_PARTY_MATCHING', 'THIRD_PARTY_PROVISION');

-- CreateEnum
CREATE TYPE "gaikokujinzai"."IdentifierType" AS ENUM ('PASSPORT', 'RESIDENCE_CARD');

-- CreateEnum
CREATE TYPE "gaikokujinzai"."MatchCandidateStatus" AS ENUM ('PENDING_REVIEW', 'CONFIRMED_MERGE', 'REJECTED');

-- CreateEnum
CREATE TYPE "tokutei_ginou"."TokuteiGinouDocumentType" AS ENUM ('EMPLOYMENT_CONDITION_NOTICE', 'EMPLOYMENT_CONTRACT', 'SOCIAL_INSURANCE_PAYMENT_APPLICATION', 'LABOR_INSURANCE_PAYMENT_CERTIFICATE', 'RESIDENCE_STATUS_CHANGE_APPLICATION', 'CERTIFICATE_OF_ELIGIBILITY_APPLICATION', 'SUPPORT_PLAN', 'REMUNERATION_EXPLANATION_DOCUMENT');

-- CreateEnum
CREATE TYPE "tokutei_ginou"."DocumentCaseStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "tokutei_ginou"."AttachmentDocumentKey" AS ENUM ('SKILL_EXAM_CERTIFICATE_COPY', 'PASSPORT_COPY', 'RESIDENCE_CARD_COPY', 'CORPORATE_REGISTRY_CERTIFICATE', 'RESIDENT_CERTIFICATE', 'FINANCIAL_STATEMENTS', 'HOME_COUNTRY_ISSUED_DOCUMENT');

-- CreateEnum
CREATE TYPE "chouhyou"."DocumentFormat" AS ENUM ('DOCX', 'XLSX');

-- CreateTable
CREATE TABLE "core"."Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planTier" "core"."PlanTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "core"."UserRole" NOT NULL,
    "invitedById" TEXT,
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."Invitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "core"."UserRole" NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."ProxyDataEntryGrant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "grantedToUserId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ProxyDataEntryGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."ConsentRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "category" "core"."ConsentCategory" NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "activeForeignWorkerCount" INTEGER NOT NULL,
    "flatFeeAmount" INTEGER NOT NULL,
    "usageFeeAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."DataImportBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sourceFormatVersion" TEXT NOT NULL,
    "importedByUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rowCount" INTEGER,
    "errorSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DataImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaikokujinzai"."ForeignWorker" (
    "id" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyNameKana" TEXT,
    "givenNameKana" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForeignWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaikokujinzai"."IdentifierHistory" (
    "id" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "type" "gaikokujinzai"."IdentifierType" NOT NULL,
    "number" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revocationCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentifierHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaikokujinzai"."Affiliation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "residenceStatus" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaikokujinzai"."StatusChangeRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "affiliationId" TEXT NOT NULL,
    "reasonType" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "StatusChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaikokujinzai"."ForeignWorkerMatchCandidate" (
    "id" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "status" "gaikokujinzai"."MatchCandidateStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForeignWorkerMatchCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaikokujinzai"."ForeignWorkerMergeRecord" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "mergedByUserId" TEXT NOT NULL,
    "mergedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unmergedAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "ForeignWorkerMergeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokutei_ginou"."TokuteiGinouDocumentCase" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "documentType" "tokutei_ginou"."TokuteiGinouDocumentType" NOT NULL,
    "templateVersion" TEXT,
    "status" "tokutei_ginou"."DocumentCaseStatus" NOT NULL DEFAULT 'DRAFT',
    "formData" JSONB NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokuteiGinouDocumentCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokutei_ginou"."HealthCheckupProgress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthCheckupProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokutei_ginou"."AttachmentChecklistItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "documentKey" "tokutei_ginou"."AttachmentDocumentKey" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "fileRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttachmentChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ikusei_shurou"."TrainingPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "foreignWorkerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chouhyou"."DocumentTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "format" "chouhyou"."DocumentFormat" NOT NULL,
    "isUserProvided" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chouhyou"."DocumentGeneration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetRefId" TEXT,

    CONSTRAINT "DocumentGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "core"."User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "core"."User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "core"."Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_tenantId_idx" ON "core"."Invitation"("tenantId");

-- CreateIndex
CREATE INDEX "ProxyDataEntryGrant_tenantId_idx" ON "core"."ProxyDataEntryGrant"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_occurredAt_idx" ON "core"."AuditLog"("tenantId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRecord_tenantId_category_key" ON "core"."ConsentRecord"("tenantId", "category");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_periodStart_idx" ON "core"."Invoice"("tenantId", "periodStart");

-- CreateIndex
CREATE INDEX "DataImportBatch_tenantId_createdAt_idx" ON "core"."DataImportBatch"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "IdentifierHistory_foreignWorkerId_idx" ON "gaikokujinzai"."IdentifierHistory"("foreignWorkerId");

-- CreateIndex
CREATE INDEX "Affiliation_tenantId_idx" ON "gaikokujinzai"."Affiliation"("tenantId");

-- CreateIndex
CREATE INDEX "Affiliation_foreignWorkerId_idx" ON "gaikokujinzai"."Affiliation"("foreignWorkerId");

-- CreateIndex
CREATE INDEX "StatusChangeRequest_tenantId_status_idx" ON "gaikokujinzai"."StatusChangeRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ForeignWorkerMatchCandidate_foreignWorkerId_idx" ON "gaikokujinzai"."ForeignWorkerMatchCandidate"("foreignWorkerId");

-- CreateIndex
CREATE INDEX "ForeignWorkerMatchCandidate_candidateId_idx" ON "gaikokujinzai"."ForeignWorkerMatchCandidate"("candidateId");

-- CreateIndex
CREATE INDEX "ForeignWorkerMergeRecord_sourceId_idx" ON "gaikokujinzai"."ForeignWorkerMergeRecord"("sourceId");

-- CreateIndex
CREATE INDEX "ForeignWorkerMergeRecord_targetId_idx" ON "gaikokujinzai"."ForeignWorkerMergeRecord"("targetId");

-- CreateIndex
CREATE INDEX "TokuteiGinouDocumentCase_tenantId_documentType_idx" ON "tokutei_ginou"."TokuteiGinouDocumentCase"("tenantId", "documentType");

-- CreateIndex
CREATE INDEX "TokuteiGinouDocumentCase_foreignWorkerId_idx" ON "tokutei_ginou"."TokuteiGinouDocumentCase"("foreignWorkerId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthCheckupProgress_tenantId_foreignWorkerId_key" ON "tokutei_ginou"."HealthCheckupProgress"("tenantId", "foreignWorkerId");

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentChecklistItem_tenantId_foreignWorkerId_documentKe_key" ON "tokutei_ginou"."AttachmentChecklistItem"("tenantId", "foreignWorkerId", "documentKey");

-- CreateIndex
CREATE INDEX "TrainingPlan_tenantId_idx" ON "ikusei_shurou"."TrainingPlan"("tenantId");

-- CreateIndex
CREATE INDEX "TrainingPlan_foreignWorkerId_idx" ON "ikusei_shurou"."TrainingPlan"("foreignWorkerId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_key_version_tenantId_key" ON "chouhyou"."DocumentTemplate"("key", "version", "tenantId");

-- CreateIndex
CREATE INDEX "DocumentGeneration_tenantId_generatedAt_idx" ON "chouhyou"."DocumentGeneration"("tenantId", "generatedAt");

-- AddForeignKey
ALTER TABLE "core"."User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."Invitation" ADD CONSTRAINT "Invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."ProxyDataEntryGrant" ADD CONSTRAINT "ProxyDataEntryGrant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."ConsentRecord" ADD CONSTRAINT "ConsentRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "core"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."IdentifierHistory" ADD CONSTRAINT "IdentifierHistory_foreignWorkerId_fkey" FOREIGN KEY ("foreignWorkerId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."Affiliation" ADD CONSTRAINT "Affiliation_foreignWorkerId_fkey" FOREIGN KEY ("foreignWorkerId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."StatusChangeRequest" ADD CONSTRAINT "StatusChangeRequest_foreignWorkerId_fkey" FOREIGN KEY ("foreignWorkerId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."StatusChangeRequest" ADD CONSTRAINT "StatusChangeRequest_affiliationId_fkey" FOREIGN KEY ("affiliationId") REFERENCES "gaikokujinzai"."Affiliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."ForeignWorkerMatchCandidate" ADD CONSTRAINT "ForeignWorkerMatchCandidate_foreignWorkerId_fkey" FOREIGN KEY ("foreignWorkerId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."ForeignWorkerMatchCandidate" ADD CONSTRAINT "ForeignWorkerMatchCandidate_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."ForeignWorkerMergeRecord" ADD CONSTRAINT "ForeignWorkerMergeRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gaikokujinzai"."ForeignWorkerMergeRecord" ADD CONSTRAINT "ForeignWorkerMergeRecord_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokutei_ginou"."TokuteiGinouDocumentCase" ADD CONSTRAINT "TokuteiGinouDocumentCase_foreignWorkerId_fkey" FOREIGN KEY ("foreignWorkerId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokutei_ginou"."HealthCheckupProgress" ADD CONSTRAINT "HealthCheckupProgress_foreignWorkerId_fkey" FOREIGN KEY ("foreignWorkerId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokutei_ginou"."AttachmentChecklistItem" ADD CONSTRAINT "AttachmentChecklistItem_foreignWorkerId_fkey" FOREIGN KEY ("foreignWorkerId") REFERENCES "gaikokujinzai"."ForeignWorker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chouhyou"."DocumentGeneration" ADD CONSTRAINT "DocumentGeneration_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "chouhyou"."DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
