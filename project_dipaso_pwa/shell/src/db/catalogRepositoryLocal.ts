// 📁 src/db/catalogRepository.ts

import { getDB } from "./indexed";
import type { Catalog, EncryptedFragment } from "../models/api/catalogsModel"; 
import { encryptAndSignData, decryptAndVerifyData } from "../hooks/encrypterIdb/useMac";

const STORE_NAME = "catalogs";

export class CatalogRepository {
    
    // ------------------------------------------------
    // UTILIDADES INTERNAS DE CIFRADO
    // ------------------------------------------------

    /**
     * Cifra el objeto Catalog completo y lo prepara para IndexedDB.
     * Incluye las claves no cifradas necesarias para los índices.
     */
    private encryptCatalog(catalog: Catalog): { record: any, key: string } {
    if (!catalog) {
        console.warn("⚠️ Se intentó cifrar un catálogo undefined o null");
        return { 
            record: {
                catalog_id: crypto.randomUUID(),
                catalog_name: "unknown",
                is_active: true,
                updated_at: new Date().toISOString(),
                encrypted_data: null, // marcamos como null
            },
            key: crypto.randomUUID(),
        };
    }

    const safeId = catalog.catalogId || crypto.randomUUID();
    const jsonString = JSON.stringify({ ...catalog, catalogId: safeId });
    
    let encryptedData: EncryptedFragment | null = null;
    try {
        encryptedData = encryptAndSignData(jsonString);
    } catch (e) {
        console.error("⚠️ Error cifrando catálogo:", catalog, e);
    }

    const recordToStore = {
        catalog_id: safeId,
        catalog_name: catalog.catalogName || "unknown",
        is_active: catalog.isActive ?? true,
        updated_at: catalog.updatedAt || new Date().toISOString(),
        encrypted_data: encryptedData,
    };

    return { record: recordToStore, key: safeId };
}

    /**
     * Descifra el registro completo de la base de datos a un objeto Catalog en texto plano.
     */
    private decryptCatalog(record: any): Catalog {
        try {
            const decryptedJsonString = decryptAndVerifyData(record.encrypted_data);
            const decryptedCatalog: Catalog = JSON.parse(decryptedJsonString);
            return decryptedCatalog; 
        } catch (error) {
            console.error(`Error de seguridad: Fallo al descifrar el catálogo.`, error);
            throw new Error(`Failed to decrypt catalog. Data may be corrupted.`);
        }
    }

    // ------------------------------------------------
    // OPERACIONES CRUD CON CIFRADO
    // ------------------------------------------------

    async saveCatalog(catalog: Catalog): Promise<Catalog> {
        const db = await getDB();
        
        // 1. Cifrar (record ahora contiene todas las claves indexables)
        const { record } = this.encryptCatalog(catalog); 

        // 2. Guardar el registro. 
        await db.put(STORE_NAME, record); 
        
        return catalog; 
    }

    async getCatalog(id: string): Promise<Catalog | undefined> {
        const db = await getDB();
        const encryptedRecord: any | undefined = await db.get(STORE_NAME, id); 

        if (!encryptedRecord) return undefined;

        // 2. Descifrar y devolver el tipo Catalog completo
        return this.decryptCatalog(encryptedRecord);
    }

    async getAllCatalogs(): Promise<Catalog[]> {
        const db = await getDB();
        const encryptedRecords: any[] = await db.getAll(STORE_NAME);
        return encryptedRecords.map(record => this.decryptCatalog(record));
    }

    async deleteCatalog(id: string): Promise<void> {
        const db = await getDB();
        await db.delete(STORE_NAME, id);
    }

    // ------------------------------------------------
    // FUNCIÓN DE LIMPIEZA E INSERCIÓN MASIVA
    // ------------------------------------------------

    /**
     * Elimina todos los catálogos existentes, los cifra y los inserta masivamente.
     */
   async clearAndBulkPutCatalogs(catalogs: Catalog[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    try {
        await store.clear(); 
        
       const encryptionResults = catalogs.map(c => this.encryptCatalog(c));

        for (const { record } of encryptionResults) {
            if (!record.encrypted_data) {
                console.warn("⚠️ Catálogo ignorado por fallo en cifrado:", record);
                continue;
            }
            await store.put(record);
        }

        await tx.done; 
    } catch (error) {
        console.error("Error en la transacción de bulk put para catálogos:", error);
        throw error; 
    }
}

    
    // ------------------------------------------------
    // MÉTODOS ADICIONALES (OPTIMIZADOS PARA USAR ÍNDICES)
    // ------------------------------------------------

    /**
     * Obtiene catálogos por 'catalog_name' usando el índice secundario (Eficiente).
     */
async getCatalogsByName(name: string): Promise<Catalog[]> {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        
        // 1. Obtener el índice.
        const index = store.index('by_catalog_name'); 
        
        // 2. CORRECCIÓN: Usar doble cast: index as unknown as { getAll: (key: string) => Promise<any[]> }
        // Esto le dice a TypeScript que, a pesar de los tipos complejos, este objeto tiene un método getAll que acepta un string.
        const typedIndex = index as unknown as { getAll: (key: string) => Promise<any[]> };
        
        const encryptedRecords: any[] = await typedIndex.getAll(name);
        
        return encryptedRecords.map(record => this.decryptCatalog(record));
    }
    /**
     * Obtiene catálogos por 'is_active' usando el índice secundario (Eficiente).
     */
   async getActiveCatalogs(isActive: boolean): Promise<Catalog[]> {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);

        // 1. Obtener el índice.
        const index = store.index('by_is_active'); 
        
        // 2. CORRECCIÓN: Usar doble cast para que TypeScript acepte el booleano como clave.
        const typedIndex = index as unknown as { getAll: (key: boolean) => Promise<any[]> };
        
        const encryptedRecords: any[] = await typedIndex.getAll(isActive);

        return encryptedRecords.map(record => this.decryptCatalog(record));
    }

    /**
     * Obtiene todos los catálogos ordenados por 'updated_at' usando el índice (Eficiente).
     */
    async getAllOrderedByUpdate(): Promise<Catalog[]> {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);

        // Aquí no necesitamos el casting porque .getAll() sin argumentos siempre es válido.
        const index = store.index('by_updated_at'); 
        const encryptedRecords: any[] = await index.getAll();
        
        return encryptedRecords.map(record => this.decryptCatalog(record));
    }
}