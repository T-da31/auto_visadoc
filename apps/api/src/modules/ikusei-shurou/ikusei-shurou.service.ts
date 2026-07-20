import { Injectable } from "@nestjs/common";
import { forTenant, getPrismaClient } from "@tokutei-ginou/db";

// 育成就労ドメインの雛形サービス（フェーズ4「支援計画書対応」等、後続で拡張）。
@Injectable()
export class IkuseiShurouService {
  // RLS（4.5章）が参照するapp.tenant_idを設定してから実行するテナントスコープの
  // クライアントを都度生成する。
  private prismaFor(tenantId: string) {
    return forTenant(getPrismaClient(), tenantId);
  }

  async listByTenant(tenantId: string) {
    return this.prismaFor(tenantId).trainingPlan.findMany({ where: { tenantId } });
  }
}
