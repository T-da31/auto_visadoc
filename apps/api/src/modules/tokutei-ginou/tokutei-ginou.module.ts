import { Module } from "@nestjs/common";
import { ChouhyouModule } from "../chouhyou";
import { TokuteiGinouController } from "./tokutei-ginou.controller";
import { TokuteiGinouService } from "./tokutei-ginou.service";

// 帳票生成（documentCase.formData → docx）はChouhyouModuleへ委譲する。
// chouhyouモジュール側は他ドメインを一切知らない（dependency-cruiserで強制）が、
// 逆方向（tokutei-ginou→chouhyou）は許容される想定（4章の帳票エンジン独立方針）。
@Module({
  imports: [ChouhyouModule],
  controllers: [TokuteiGinouController],
  providers: [TokuteiGinouService],
  exports: [TokuteiGinouService],
})
export class TokuteiGinouModule {}
