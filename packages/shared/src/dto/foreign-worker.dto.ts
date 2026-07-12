export type IdentifierType = "PASSPORT" | "RESIDENCE_CARD";

export interface IdentifierHistoryDto {
  type: IdentifierType;
  number: string;
  issuedAt?: string;
  expiredAt?: string;
  isActive: boolean;
}

export interface ForeignWorkerDto {
  id: string;
  familyName: string;
  givenName: string;
  familyNameKana?: string;
  givenNameKana?: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  identifiers: IdentifierHistoryDto[];
}
