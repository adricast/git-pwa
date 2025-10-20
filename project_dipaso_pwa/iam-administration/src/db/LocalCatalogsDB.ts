// iam-administration/src/db/schemas/localCatalogsIDB.ts

import type { DBSchema } from "idb";

// 🚨 Definición local mínima del tipo de valor almacenado, reemplazando a EncryptedCatalogRecord
export interface LocalEncryptedCatalogRecordValue {
    // La clave primaria es 'catalog_id'
    catalog_id: string; 
    
    // Campos de índice (necesarios para el getAllFromIndex)
    catalog_name: string;        
    is_active: boolean;          
    updated_at: string;
    
    // Campo que contiene los datos cifrados (no importa el tipo interno, solo su existencia)
    encrypted_catalog_value: {
        payload: string;
        signature: string;
    };
    // ... otros campos del catálogo (catalog_type, description, etc.)
}

/**
 * Define el esquema de IndexedDB incluyendo SOLAMENTE el store 'catalogs'.
 */
export interface LocalCatalogsDB extends DBSchema {
  catalogs: {
    key: string; // Tipo de la clave primaria (catalog_id)
    
    // Tipo de valor almacenado (el objeto cifrado)
    value: LocalEncryptedCatalogRecordValue; 
    
    // Definición de índices (deben ser CADENAS LITERALES)
    indexes: {
      by_catalog_name: "catalog_name"; 
      by_is_active: "is_active";
      by_updated_at: "updated_at";
    };
  };
}