import { Injectable, NotFoundException } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPrismaClient } from "@tokutei-ginou/db";
import { generateDocument } from "@tokutei-ginou/chouhyou-engine";
import type {
  DocumentGenerationRequestDto,
  DocumentGenerationResultDto,
} from "@tokutei-ginou/shared";

export interface GeneratedDocument {
  result: DocumentGenerationResultDto;
  buffer: Buffer;
  fileName: string;
}

// packages/shared のDocumentFormat（Prisma enumに合わせた大文字表記）と、
// chouhyou-engineのDocumentFormat（小文字・拡張子表記）の変換。
function toEngineFormat(format: DocumentGenerationRequestDto["format"]): "docx" | "xlsx" {
  return format === "DOCX" ? "docx" : "xlsx";
}

// 帳票モジュール。「入力データ→生成文書」の契約のみで完結させ、
// 特定技能・育成就労固有のモジュールには一切依存しない
// （.dependency-cruiser.cjs の chouhyou-must-stay-domain-agnostic ルールで強制）。
//
// 実際のテンプレート差し込みは独立リポジトリ `chouhyou-engine`
// （@tokutei-ginou/chouhyou-engine）に委譲する。
@Injectable()
export class ChouhyouService {
  private get prisma() {
    return getPrismaClient();
  }

  async generate(
    tenantId: string,
    generatedBy: string,
    request: DocumentGenerationRequestDto,
  ): Promise<GeneratedDocument> {
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
      throw new NotFoundException(
        `テンプレートが見つかりません: ${request.templateKey} (${request.templateVersion ?? "latest"})`,
      );
    }

    if (!template.sourcePath) {
      // 現時点ではユーザー原本インポート（S3保管）は未実装のため、
      // 運営提供テンプレート（sourcePathがバンドル資産を指すもの）のみ対応する。
      throw new NotFoundException(
        `テンプレート ${template.key} の実体（sourcePath）が未設定です`,
      );
    }

    // apps/api のプロジェクトルート（process.cwd()）からの相対パスとして解決する。
    // NestJSは通常このディレクトリを起点に起動される想定。
    const templateBuffer = await readFile(join(process.cwd(), template.sourcePath));

    const { buffer } = await generateDocument({
      templateBuffer,
      format: toEngineFormat(request.format),
      data: request.data,
    });

    const generation = await this.prisma.documentGeneration.create({
      data: {
        tenantId,
        templateId: template.id,
        generatedBy,
      },
    });

    return {
      result: {
        documentId: generation.id,
        format: request.format,
        generatedAt: generation.generatedAt.toISOString(),
      },
      buffer,
      fileName: `${template.key}_${generation.id}.${toEngineFormat(request.format)}`,
    };
  }
}
