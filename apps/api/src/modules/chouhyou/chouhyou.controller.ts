import { Body, Controller, Headers, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import type { DocumentFormat, DocumentGenerationRequestDto } from "@tokutei-ginou/shared";
import { ChouhyouService } from "./chouhyou.service";

const CONTENT_TYPE_BY_FORMAT: Record<DocumentFormat, string> = {
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

@Controller("chouhyou/documents")
export class ChouhyouController {
  constructor(private readonly service: ChouhyouService) {}

  // 生成された文書（docx/xlsx）をそのままダウンロードさせるエンドポイント。
  // レスポンスヘッダに生成メタデータ（documentId/generatedAt）も含める。
  @Post("generate")
  async generate(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Body() body: DocumentGenerationRequestDto,
    @Res() res: Response,
  ) {
    const { result, buffer, fileName } = await this.service.generate(
      tenantId,
      userId,
      body,
    );

    res.setHeader("Content-Type", CONTENT_TYPE_BY_FORMAT[body.format]);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.setHeader("X-Document-Id", result.documentId);
    res.setHeader("X-Generated-At", result.generatedAt);
    res.send(buffer);
  }
}
