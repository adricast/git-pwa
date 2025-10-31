// 📁 src/entities/api/catalogApi.ts (FINAL Y CORREGIDO)

/**
 * Tipo para el fragmento cifrado (payload + signature)
 * Representa la estructura que usa el cifrado AES+HMAC.
 */
export interface EncryptedFragment {
    payload: string;
    signature: string;
}

// ----------------------------------------------------------------------
// INTERFAZ PRINCIPAL (TEXTO PLANO)
// ----------------------------------------------------------------------

/**
 * 🚨 INTERFAZ PRINCIPAL DE LA APLICACIÓN
 * Define la estructura del catálogo en texto plano (lo que la aplicación consume).
 */
export interface Catalog {
    catalogId: string;
    catalogName: string;        // Ej: "countries", "document_types"
    catalogValue: any;          // Full, complex data
    catalogtype: string;        
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    created_by_user_id?: string | null;
    updated_by_user_id?: string | null;
}

// ----------------------------------------------------------------------
// INTERFAZ DE ALMACENAMIENTO (CIFRADA) - CORREGIDA PARA BÚSQUEDA EFICIENTE
// ----------------------------------------------------------------------

/**
 * 🚨 TIPO ALMACENADO REAL (IDB) - FUNCIONAL
 * Define la estructura del objeto tal como se guarda en IndexedDB.
 * Mantiene las claves de búsqueda (sin cifrar) y cifra todo el resto del objeto.
 */
export interface EncryptedCatalogRecord {
    // 1. Clave Primaria (PK) - Sin cifrar para db.put(value)
    catalog_id: string; 
    
    // 2. Clave de Índice - Sin cifrar para búsqueda por nombre (by_catalog_name)
    catalog_name: string;
    
    // 3. Payload Cifrado - Contiene *todos* los metadatos y el valor (CatalogValue)
    // Se usa 'encrypted_data' como la clave para el payload cifrado TOTAL.
    encrypted_data: EncryptedFragment; 
}