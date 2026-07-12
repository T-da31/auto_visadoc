import { Body, Controller, Headers, Post } from "@nestjs/common";
import type { DocumentGenerationRequestDto } from "@tokutei-ginou/shared";
import { ChouhyouService } from "./chouhyou.service";

@Controller("chouhyou/documents")
export class ChouhyouController {
  constructor(private readonly service: ChouhyouService) {}

  @Post("generate")
  async generate(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Body() body: DocumentGenerationRequestDto,
  ) {
    return this.service.generate(tenantId, userId, body);
  }
}
