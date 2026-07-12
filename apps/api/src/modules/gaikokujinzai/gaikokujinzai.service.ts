import { Injectable } from "@nestjs/common";
import { getPrismaClient } from "@tokutei-ginou/db";
import type { ForeignWorkerDto } from "@tokutei-ginou/shared";

// 外国人材データ（6章：最大の資産）。他モジュールへはこのサービスの
// メソッド経由でのみ公開し、Prismaモデルを直接他モジュールへ露出しない。
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
