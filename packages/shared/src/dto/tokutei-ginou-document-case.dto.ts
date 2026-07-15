// Prisma schema (packages/db/prisma/schema.prisma) の
// TokuteiGinouDocumentType / DocumentCaseStatus と対応させる。
export type TokuteiGinouDocumentType =
  | "EMPLOYMENT_CONDITION_NOTICE"
  | "EMPLOYMENT_CONTRACT"
  | "SOCIAL_INSURANCE_PAYMENT_APPLICATION"
  | "LABOR_INSURANCE_PAYMENT_CERTIFICATE"
  | "RESIDENCE_STATUS_CHANGE_APPLICATION"
  | "CERTIFICATE_OF_ELIGIBILITY_APPLICATION"
  | "SUPPORT_PLAN"
  | "REMUNERATION_EXPLANATION_DOCUMENT";

export type DocumentCaseStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SUBMITTED";

export interface TokuteiGinouDocumentCaseDto {
  id: string;
  foreignWorkerId: string;
  documentType: TokuteiGinouDocumentType;
  templateVersion?: string;
  status: DocumentCaseStatus;
  formData: Record<string, unknown>;
  createdByUserId: string;
  approvedByUserId?: string;
  approvedAt?: string;
  submittedAt?: string;
}

export interface CreateTokuteiGinouDocumentCaseDto {
  foreignWorkerId: string;
  documentType: TokuteiGinouDocumentType;
  templateVersion?: string;
  formData: Record<string, unknown>;
}
