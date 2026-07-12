import { Module } from "@nestjs/common";
import { TokuteiGinouController } from "./tokutei-ginou.controller";
import { TokuteiGinouService } from "./tokutei-ginou.service";

@Module({
  controllers: [TokuteiGinouController],
  providers: [TokuteiGinouService],
  exports: [TokuteiGinouService],
})
export class TokuteiGinouModule {}
