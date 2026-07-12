import { Module } from "@nestjs/common";
import { GaikokujinzaiController } from "./gaikokujinzai.controller";
import { GaikokujinzaiService } from "./gaikokujinzai.service";

@Module({
  controllers: [GaikokujinzaiController],
  providers: [GaikokujinzaiService],
  exports: [GaikokujinzaiService],
})
export class GaikokujinzaiModule {}
