import { Module } from "@nestjs/common";
import { GaikokujinzaiModule } from "./modules/gaikokujinzai";
import { TokuteiGinouModule } from "./modules/tokutei-ginou";
import { IkuseiShurouModule } from "./modules/ikusei-shurou";
import { ChouhyouModule } from "./modules/chouhyou";

// ドメインごとのモジュールをディレクトリ単位で分離し、直接DBアクセスや
// 内部ファイルへの相互参照ではなく、各モジュールの public-api（index.ts）
// 経由でのみ連携する（戦略メモ 4章）。
@Module({
  imports: [
    GaikokujinzaiModule,
    TokuteiGinouModule,
    IkuseiShurouModule,
    ChouhyouModule,
  ],
})
export class AppModule {}
