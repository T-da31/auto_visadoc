import { Injectable } from "@nestjs/common";
import { getPrismaClient } from "@tokutei-ginou/db";

// 特定技能ドメインの雛形サービス。詳細なDB設計・ユースケースは
// 実装ロードマップ（戦略メモ9章）に沿って段階的に拡張する。
@Injectable()
export class TokuteiGinouService {
  private get prisma() {
    return getPrismaClient();
  }

  async listByTenant(tenantId: string) {
    return this.prisma.visaApplication.findMany({ where: { tenantId } });
  }
}
