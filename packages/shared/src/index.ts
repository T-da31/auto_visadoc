// api / web 間で共有する型・DTOのエントリポイント。
// バックエンド（NestJS）とフロントエンド（Next.js）が同一の型を参照することで、
// 契約のずれを防ぐ（4.5章：モノレポでDTO/型を共有）。

export * from "./dto/foreign-worker.dto";
export * from "./dto/document.dto";
export * from "./dto/tokutei-ginou-document-case.dto";
