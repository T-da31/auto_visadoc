import { Module } from "@nestjs/common";
import { ChouhyouController } from "./chouhyou.controller";
import { ChouhyouService } from "./chouhyou.service";

@Module({
  controllers: [ChouhyouController],
  providers: [ChouhyouService],
  exports: [ChouhyouService],
})
export class ChouhyouModule {}
