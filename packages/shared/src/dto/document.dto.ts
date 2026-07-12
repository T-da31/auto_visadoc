export type DocumentFormat = "DOCX" | "XLSX";

// 帳票モジュールの契約DTO（4.7章：入力データ→生成文書の契約のみで完結させる）
export interface DocumentGenerationRequestDto {
  templateKey: string;
  templateVersion?: string;
  format: DocumentFormat;
  data: Record<string, unknown>;
}

export interface DocumentGenerationResultDto {
  documentId: string;
  format: DocumentFormat;
  generatedAt: string;
}
