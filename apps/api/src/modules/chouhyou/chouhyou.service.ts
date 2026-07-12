import { Injectable } from "@nestjs/common";
import { getPrismaClient } from "@tokutei-ginou/db";
import type {
  DocumentGenerationRequestDto,
  DocumentGenerationResultDto,
} from "@tokutei-ginou/shared";

// 帳票モジュール。「入力データ→生成文書」の契約のみで完結させ、
// 特定技能・育成就労固有のモジュールには一切依存しない
// （.dependency-cruiser.cjs の chouhyou-must-stay-domain-agnostic ルールで強制）。
//
// TODO: 実際のテンプレート差し込み処理は独立リポジトリ `chouhyou-engine`
// （private npm package化予定）に委譲する。ここではその呼び出し口の雛形のみ用意する。
@Injectable()
export class ChouhyouService {
  private get prisma() {
    return getPrismaClient();
  }

  async generate(
    tenantId: string,
    generatedBy: string,
    request: DocumentGenerationRequestDto,
  ): Promise<DocumentGenerationResultDto> {
    const template = await this.prisma.documentTemplate.findFirst({
      where: {
        key: request.templateKey,
        ...(request.templateVersion
          ? { version: request.templateVersion }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!template) {
      throw new Error(
        `テンプレートが見つかりません: ${request.templateKey} (${request.templateVersion ?? "latest"})`,
      );
    }

    // TODO: chouhyou-engine を呼び出して実際の docx/xlsx を生成する。
    const generation = await this.prisma.documentGeneration.create({
      data: {
        tenantId,
        templateId: template.id,
        generatedBy,
      },
    });

    return {
      documentId: generation.id,
      format: request.format,
      generatedAt: generation.generatedAt.toISOString(),
    };
  }
}
