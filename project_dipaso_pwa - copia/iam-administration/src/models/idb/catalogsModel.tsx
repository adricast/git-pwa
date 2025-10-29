// 📁 iam-administration/src/models/api/iamCatalogModels.ts

// 🚨 La estructura debe coincidir con el modelo Catalog COMPLETO del Shell.

/**
 * Define la estructura del fragmento cifrado/firmado.
 */
export interface EncryptedFragment {
    payload: string;
    signature: string;
}

/**
 * Define el objeto de valores internos del catálogo.
 */
export interface CatalogValue {
    value_id: string;
    code: string;
    description: string;
    is_active: boolean;
    // ... otros campos de valor de catálogo
}

/**
 * Define el modelo Catalog completo (el objeto que existe antes de cifrar y después de descifrar).
 */
export interface Catalog {
    catalogId: string;
    catalogName: string;
    catalogType: 'list' | 'hierarchical' | 'simple'; // Ejemplo
    description?: string;
    isActive: boolean;
    // La lista de valores internos
    catalogValue?: CatalogValue[]; 
    
    // ... otros campos de metadata
    createdAt: string;
    updatedAt: string;
    created_by_user_id: string;
    updated_by_user_id: string;
}