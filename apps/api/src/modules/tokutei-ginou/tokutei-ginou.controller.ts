import { Controller, Get, Query } from "@nestjs/common";
import { TokuteiGinouService } from "./tokutei-ginou.service";

@Controller("tokutei-ginou/visa-applications")
export class TokuteiGinouController {
  constructor(private readonly service: TokuteiGinouService) {}

  @Get()
  async list(@Query("tenantId") tenantId: string) {
    return this.service.listByTenant(tenantId);
  }
}
