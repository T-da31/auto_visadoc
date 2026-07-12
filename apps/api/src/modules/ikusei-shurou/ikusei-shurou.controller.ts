import { Controller, Get, Query } from "@nestjs/common";
import { IkuseiShurouService } from "./ikusei-shurou.service";

@Controller("ikusei-shurou/training-plans")
export class IkuseiShurouController {
  constructor(private readonly service: IkuseiShurouService) {}

  @Get()
  async list(@Query("tenantId") tenantId: string) {
    return this.service.listByTenant(tenantId);
  }
}
