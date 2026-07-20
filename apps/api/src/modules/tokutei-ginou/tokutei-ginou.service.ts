import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { forTenant, getPrismaClient } from "@tokutei-ginou/db";
import type {
  CreateTokuteiGinouDocumentCaseDto,
  TokuteiGinouDocumentCaseDto,
  TokuteiGinouDocumentType,
} from "@tokutei-ginou/shared";
import { ChouhyouService, type GeneratedDocument } from "../chouhyou";

// documentType → chouhyouの帳票テンプレートキーの対応（4.7章のデータ辞書相当）。
// フェーズ1（雇用条件書・雇用契約書）以外は未実装のため、対応するキーが無い
// ものは生成時にエラーとする。9章の実装ロードマップに沿って順次追加する。
const TEMPLATE_KEY_BY_DOCUMENT_TYPE: Partial<Record<TokuteiGinouDocumentType, string>> = {
  EMPLOYMENT_CONDITION_NOTICE: "employment_condition_notice",
};

// 特定技能ドメインのサービス。9章の実装ロードマップに登場する書類は、
// 可変フォーム項目をJSONBに逃がした汎用ケースモデル
// （TokuteiGinouDocumentCase）で扱う。
//
// 7章の承認フロー：行政書士・登録支援機関（サブアカウント）が入力した内容は
// DRAFTのまま留め、受入企業側の承認（approve）を経てはじめてSUBMITTED可能な
// 状態に確定させる。
@Injectable()
export class TokuteiGinouService {
  constructor(private readonly chouhyou: ChouhyouService) {}

  // RLS（4.5章）が参照する app.tenant_id を、クエリと同一トランザクション内で
  // 設定してから実行するテナントスコープのクライアントを都度生成する。
  // 呼び出し側からtenantIdが渡されない限りこのモジュールはDBへ触れられない。
  private prismaFor(tenantId: string) {
    return forTenant(getPrismaClient(), tenantId);
  }

  async listByTenant(
    tenantId: string,
    documentType?: string,
  ): Promise<TokuteiGinouDocumentCaseDto[]> {
    return this.prismaFor(tenantId).tokuteiGinouDocumentCase.findMany({
      where: { tenantId, ...(documentType ? { documentType } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(
    tenantId: string,
    createdByUserId: string,
    input: CreateTokuteiGinouDocumentCaseDto,
  ): Promise<TokuteiGinouDocumentCaseDto> {
    return this.prismaFor(tenantId).tokuteiGinouDocumentCase.create({
      data: {
        tenantId,
        foreignWorkerId: input.foreignWorkerId,
        documentType: input.documentType,
        templateVersion: input.templateVersion,
        formData: input.formData,
        createdByUserId,
        status: "DRAFT",
      },
    });
  }

  // 受入企業側の承認。行政書士・登録支援機関のサブアカウントには承認権限を
  // 与えない想定のため、呼び出し元（コントローラ／認可ガード）で
  // COMPANY_ADMIN/COMPANY_STAFF ロールのみに制限する。
  async approve(
    tenantId: string,
    caseId: string,
    approvedByUserId: string,
  ): Promise<TokuteiGinouDocumentCaseDto> {
    const prisma = this.prismaFor(tenantId);
    const documentCase = await prisma.tokuteiGinouDocumentCase.findFirst({
      where: { id: caseId, tenantId },
    });

    if (!documentCase) {
      throw new NotFoundException(`DocumentCase ${caseId} not found`);
    }

    if (documentCase.status === "SUBMITTED") {
      throw new ForbiddenException("提出済みの書類は承認できません");
    }

    return prisma.tokuteiGinouDocumentCase.update({
      where: { id: caseId },
      data: {
        status: "APPROVED",
        approvedByUserId,
        approvedAt: new Date(),
      },
    });
  }

  // formData（JSONB）を帳票エンジンへそのまま渡し、docxを生成する。
  // 承認前（DRAFT）でもプレビュー目的で呼び出せる想定（4.7章：試し差し込み機能）。
  async generateDocument(
    tenantId: string,
    generatedByUserId: string,
    caseId: string,
  ): Promise<GeneratedDocument> {
    const documentCase = await this.prismaFor(tenantId).tokuteiGinouDocumentCase.findFirst({
      where: { id: caseId, tenantId },
    });

    if (!documentCase) {
      throw new NotFoundException(`DocumentCase ${caseId} not found`);
    }

    const templateKey =
      TEMPLATE_KEY_BY_DOCUMENT_TYPE[documentCase.documentType as TokuteiGinouDocumentType];

    if (!templateKey) {
      throw new ForbiddenException(
        `書類種別 ${documentCase.documentType} の帳票生成は未対応です`,
      );
    }

    return this.chouhyou.generate(tenantId, generatedByUserId, {
      templateKey,
      templateVersion: documentCase.templateVersion ?? undefined,
      format: "DOCX",
      data: documentCase.formData as Record<string, unknown>,
    });
  }
}
