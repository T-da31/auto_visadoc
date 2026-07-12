import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { GaikokujinzaiService } from "./gaikokujinzai.service";

@Controller("foreign-workers")
export class GaikokujinzaiController {
  constructor(private readonly service: GaikokujinzaiService) {}

  @Get(":id")
  async findById(@Param("id") id: string) {
    const worker = await this.service.findById(id);
    if (!worker) {
      throw new NotFoundException(`ForeignWorker ${id} not found`);
    }
    return worker;
  }
}
