// 📁 src/db/catalogRepository.ts

import { getDB } from "./indexed";
import type { Catalog, EncryptedFragment } from "./../models/api/catalogsModel"; 
import { encryptAndSignData, decryptAndVerifyData } from "./../hooks/encrypterIdb/useMac";

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
        
        // 1. CIFRAR TODO (incluyendo todos los metadatos y catalog_value)
        const jsonString = JSON.stringify(catalog);
        const encryptedData: EncryptedFragment = encryptAndSignData(jsonString);

        // 2. REGISTRO FINAL: Incluimos las claves necesarias para keyPath e índices (sin cifrar).
        const recordToStore = {
            catalog_id: catalog.catalog_id,      // ⬅️ Clave necesaria para 'keyPath'
            catalog_name: catalog.catalog_name,  // ⬅️ Clave necesaria para índice 'by_catalog_name'
            is_active: catalog.is_active,        // ⬅️ Clave necesaria para índice 'by_is_active'
            updated_at: catalog.updated_at,      // ⬅️ Clave necesaria para índice 'by_updated_at'
            encrypted_data: encryptedData, 
        };
        
        // 3. CLAVE SEPARADA: Se mantiene para referencia.
        return {
            record: recordToStore, 
            key: catalog.catalog_id 
        };
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
            // 1. Limpiar el store completo
            await store.clear(); 
            
            // 2. Cifrar la lista (los registros ahora incluyen las claves no cifradas)
            const encryptionResults = catalogs.map(c => this.encryptCatalog(c));

            // 3. Insertar usando put(value) para cada elemento
            const putPromises = encryptionResults.map(result => store.put(result.record));
            
            await Promise.all(putPromises);
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