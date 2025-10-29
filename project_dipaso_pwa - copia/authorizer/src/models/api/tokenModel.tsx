// src/entities/api/tokenApi.ts

export type TokenSyncStatus = "synced" | "expired" | "pending" | "deleted";

export interface Token {
  id: string; 
  key: "access_token" | "refresh_token"; // Distingue qué tipo de token es
  aut_id: number; // Enlace con la entidad de autenticación/usuario
  token: string;
  expiresAt: number; // Timestamp Unix de expiración
  syncStatus: TokenSyncStatus;
}