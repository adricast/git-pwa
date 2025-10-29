// 📁 iam-administration/src/db/schemas/localCatalogsIDB.ts

import type { DBSchema } from "idb";

// Importamos EncryptedFragment si es necesario, si no, se define localmente
export interface EncryptedFragment {
    payload: string;
    signature: string;
}

// 🚨 Definición FINAL del tipo de valor almacenado para IndexedDB.
// Solo contiene los campos necesarios para la PK y los índices (sin cifrar),
// y el payload cifrado TOTAL.
export interface LocalEncryptedCatalogRecordValue {
    
    // 1. Clave primaria (PK)
    catalog_id: string; 
    
    // 2. Campos de índice - DEBEN SER CLAROS (sin cifrar) para que IndexedDB funcione
    catalog_name: string; 
    is_active: boolean; 
    updated_at: string;
    
    // 3. Campo que contiene TODOS los datos cifrados (CatalogValue, description, catalogType, etc.)
    // Se elimina 'encrypted_catalog_value' si se usa 'encrypted_data'.
    encrypted_data: EncryptedFragment; 
    
    // ❌ Todos los demás campos (catalog_type, description, etc.) deben ser eliminados de esta lista
    // ya que están incluidos DENTRO de encrypted_data.
}

/**
 * Define el esquema de IndexedDB, asegurando que los índices apunten a los campos existentes.
 */
export interface LocalCatalogsDB extends DBSchema {
    catalogs: {
        key: string; // Tipo de la clave primaria (catalog_id)
        
        // Tipo de valor almacenado (el objeto con el payload cifrado)
        value: LocalEncryptedCatalogRecordValue; 
        
        // Definición de índices
        indexes: {
            by_catalog_name: "catalog_name"; 
            by_is_active: "is_active";
            by_updated_at: "updated_at";
        };
    };
}