// src/models/api/cityModel.tsx

/**
 * Define la estructura de una Ciudad (City) obtenida del valor del catálogo.
 */
export interface AddressType {
  /** ID único del ítem (no confundir con catalog_id). */
  id: string;

  /** Nombre descriptivo del tipo de domicilio (ej: "Domicilio Principal"). */
  name: string;

  /** Tipo de dato del valor (por ahora siempre "text"). */
  type: 'text';

  /** Indica el orden de visualización en el catálogo. */
  order: number;

  /** Indica si el usuario puede editar este ítem. */
  editable: boolean;

  /** Código mnemónico corto (ej: "PRN", "TRB", "FAC"). */
  mnemonic: string;

  /** Fecha y hora de creación (ISO 8601). */
  created_at: string;

  /** Fecha y hora de última actualización (ISO 8601). */
  updated_at: string;

  /** Descripción detallada del tipo de domicilio. */
  description: string;

  /** Código corto de referencia (ej: "DP", "DT", "DF"). */
  reference_code: string;

  /** Código de integración usado por otros sistemas (ej: "MAIN_RESIDENCE"). */
  integration_code: string;

  /** ID del usuario que creó el registro (puede ser null). */
  created_by_user_id: string | null;

  /** ID del usuario que actualizó el registro (puede ser null). */
  updated_by_user_id: string | null;
}
