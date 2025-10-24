// src/entities/api/authApi.ts

export type AuthSyncStatus = "pending" | "synced" | "deleted";

export interface Auth {
  aut_id?: number; // El ID que usarás en Token.aut_id
  aut_tempId?: number;
  username?: string; // El nombre de usuario que inició sesión
  // No necesitamos los campos del token aquí, solo la información del usuario/sesión
  syncStatus: AuthSyncStatus; 
}