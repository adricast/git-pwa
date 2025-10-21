// src/entities/api/catalogApi.ts

/**
 * Tipo para el fragmento cifrado (payload + signature)
 * Representa la estructura que usa el cifrado AES+HMAC.
 */
export interface EncryptedFragment {
    payload: string;
    signature: string;
}

/**
 * 🚨 INTERFAZ PRINCIPAL DE LA APLICACIÓN
 * Define la estructura del catálogo en texto plano (lo que la aplicación consume).
 */
export interface Catalog {
    catalog_id: string;
    catalog_name: string;        // Ej: "countries", "document_types"
    catalog_value: any;          // Puede ser objeto o lista, sin estructura fija
    catalog_type: string;        // Ej: "list", "dropdown", "config"
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by_user_id?: string | null;
    updated_by_user_id?: string | null;
}

/**
 * 🚨 TIPO ALMACENADO REAL (IDB)
 * Define la estructura del objeto Catalog tal como se guarda en IndexedDB.
 * Es una réplica de Catalog, pero reemplaza 'catalog_value' por la versión cifrada.
 */
export interface EncryptedCatalogRecord {
    catalog_id: string;
    catalog_name: string;
    catalog_type: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by_user_id?: string | null;
    updated_by_user_id?: string | null;
    
    // Campo CIFRADO que reemplaza el valor en texto plano
    encrypted_catalog_value: EncryptedFragment;
}
