// src/entities/idb/tokenIDB.ts
import type { DBSchema } from "idb";
import type { Token, TokenSyncStatus } from "../../../../authorizer/src/models/api/tokenModel";

export interface TokenDB extends DBSchema {
  tokens: {
    key: string; // corresponde al campo `id` de Token
    value: Token;
    indexes: {
      by_syncStatus: TokenSyncStatus;
      by_expiresAt: number;
    };
  };
}