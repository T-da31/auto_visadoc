import { Body, Controller, Get, Headers, Param, Post, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import type { CreateTokuteiGinouDocumentCaseDto } from "@tokutei-ginou/shared";
import { TokuteiGinouService } from "./tokutei-ginou.service";

@Controller("tokutei-ginou/document-cases")
export class TokuteiGinouController {
  constructor(private readonly service: TokuteiGinouService) {}

  @Get()
  async list(
    @Headers("x-tenant-id") tenantId: string,
    @Query("documentType") documentType?: string,
  ) {
    return this.service.listByTenant(tenantId, documentType);
  }

  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Body() body: CreateTokuteiGinouDocumentCaseDto,
  ) {
    return this.service.create(tenantId, userId, body);
  }

  @Post(":id/approve")
  async approve(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Param("id") id: string,
  ) {
    return this.service.approve(tenantId, id, userId);
  }

  // formData（JSONB）をもとにdocxを生成してダウンロードさせる
  // （承認前のプレビューとしても、承認後の本生成としても利用できる）。
  @Post(":id/generate-document")
  async generateDocument(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.service.generateDocument(
      tenantId,
      userId,
      id,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.send(buffer);
  }
}
