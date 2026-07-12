import { Injectable } from "@nestjs/common";
import { getPrismaClient } from "@tokutei-ginou/db";

// 育成就労ドメインの雛形サービス（フェーズ4「支援計画書対応」等、後続で拡張）。
@Injectable()
export class IkuseiShurouService {
  private get prisma() {
    return getPrismaClient();
  }

  async listByTenant(tenantId: string) {
    return this.prisma.trainingPlan.findMany({ where: { tenantId } });
  }
}
