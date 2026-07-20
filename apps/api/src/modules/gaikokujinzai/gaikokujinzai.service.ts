import { Injectable } from "@nestjs/common";
import { getPrismaClient } from "@tokutei-ginou/db";
import type { ForeignWorkerDto } from "@tokutei-ginou/shared";

// 外国人材データ（6章：最大の資産）。他モジュールへはこのサービスの
// メソッド経由でのみ公開し、Prismaモデルを直接他モジュールへ露出しない。
//
// 注意：ForeignWorker／IdentifierHistoryはtenantIdを持たない共有マスタで
// あり、意図的にRLS（4.5章）の対象外としている（複数テナントを横断する
// 資産のため）。そのためforTenant()は使わずgetPrismaClient()を直接使う。
// この点は`prisma/migrations/20260715120100_add_row_level_security/
// migration.sql`の先頭コメントにも明記している。将来このサービスに
// Affiliation等tenantIdを持つテーブルへのクエリを追加する場合は、
// 該当箇所のみforTenant(tenantId)経由にすること（アクセス制御は
// Affiliation経由の関連チェックとしてアプリケーション層で行う）。
@Injectable()
export class GaikokujinzaiService {
  private get prisma() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<ForeignWorkerDto | null> {
    const worker = await this.prisma.foreignWorker.findUnique({
      where: { id },
      include: { identifiers: true },
    });
    if (!worker) return null;
    return {
      id: worker.id,
      familyName: worker.familyName,
      givenName: worker.givenName,
      familyNameKana: worker.familyNameKana ?? undefined,
      givenNameKana: worker.givenNameKana ?? undefined,
      dateOfBirth: worker.dateOfBirth.toISOString(),
      nationality: worker.nationality,
      gender: worker.gender,
      identifiers: worker.identifiers.map((identifier: any) => ({
        type: identifier.type,
        number: identifier.number,
        issuedAt: identifier.issuedAt?.toISOString(),
        expiredAt: identifier.expiredAt?.toISOString(),
        isActive: identifier.isActive,
      })),
    };
  }
}
