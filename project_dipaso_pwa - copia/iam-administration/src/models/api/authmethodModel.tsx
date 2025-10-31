export interface AuthMethodModel {
  authMethodId: string;
  authType: string; // UUID referenciando el catálogo de tipos de autenticación
  authData: string; // Hash o datos de autenticación (ej: $2b$12$...)
  nameMethod: string;
  nemonic: string;
}