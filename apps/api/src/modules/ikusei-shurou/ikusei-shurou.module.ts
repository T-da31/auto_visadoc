import { Module } from "@nestjs/common";
import { IkuseiShurouController } from "./ikusei-shurou.controller";
import { IkuseiShurouService } from "./ikusei-shurou.service";

@Module({
  controllers: [IkuseiShurouController],
  providers: [IkuseiShurouService],
  exports: [IkuseiShurouService],
})
export class IkuseiShurouModule {}
