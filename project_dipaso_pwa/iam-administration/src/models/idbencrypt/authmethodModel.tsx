// src/models/api/authMethodModel.tsx

/**
 * Define la estructura de un método de autenticación individual.
 */
export interface AuthMethodModel {
  /** ID único del método de autenticación. */
  id: string;

  /** Nombre descriptivo del método (ej: "Biométrico", "Contraseña", "PIN"). */
  name: string;

  /** Tipo de autenticación (credential, biometric, etc.). */
  type: string;

  /** Orden de visualización del método. */
  order: number;

  /** Indica si el método puede ser editado por el usuario. */
  editable: boolean;

  /** Código mnemónico corto (ej: "BIO", "PIN", "PWD"). */
  mnemonic: string;

  /** Fecha y hora de creación (formato ISO 8601). */
  created_at: string;

  /** Fecha y hora de última actualización (formato ISO 8601). */
  updated_at: string;

  /** Descripción detallada del método de autenticación. */
  description: string;

  /** Código corto de referencia (ej: "BIO"). */
  reference_code: string;

  /** Código de integración usado en otros sistemas (ej: "BIOMETRIC"). */
  integration_code: string;

  /** ID del usuario que creó el registro (puede ser null). */
  created_by_user_id: string | null;

  /** ID del usuario que actualizó el registro (puede ser null). */
  updated_by_user_id: string | null;
}
