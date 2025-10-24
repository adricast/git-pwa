// 📁 iam-administration/src/db/iamCatalogRepository.ts (CORREGIDO)

// 💡 CORRECCIÓN: Importamos getLocalDB y LocalEncryptedCatalogRecordValue
// de los archivos que has subido. Ajusta las rutas relativas si es necesario.


// 💡 CORRECCIÓN: Importamos getLocalDB y LocalEncryptedCatalogRecordValue
import { getLocalDB } from "./localIDBdatabase"; 
import type { LocalEncryptedCatalogRecordValue } from "./LocalCatalogsDB"; 

// Importaciones existentes (se mantienen)
import type { Catalog } from "./../models/idb/catalogsModel"; 
import { decryptAndVerifyData } from "./../hooks/encrypterIdb/useMac"; 

const STORE_NAME = "catalogs";

export class IamCatalogRepository {
    
    /**
     * Descifra el registro cifrado (LocalEncryptedCatalogRecordValue) a un objeto Catalog.
     */
    private decryptCatalog(record: LocalEncryptedCatalogRecordValue): Catalog {
        try {
            const decryptedJsonString = decryptAndVerifyData(record.encrypted_data); 
            const decryptedCatalog: Catalog = JSON.parse(decryptedJsonString);
            return decryptedCatalog; 
        } catch (error) {
            console.error(`❌ Error en IAM: Fallo al descifrar el registro.`, error);
            throw new Error(`Failed to decrypt catalog data.`);
        }
    }

    /**
     * Obtiene el objeto de catálogo completo (descifrado) por su ID desde la DB local.
     */
    async getCatalogById(catalogId: string): Promise<Catalog | undefined> {
        // 💡 getLocalDB ahora se encuentra
        const db = await getLocalDB(); 
        
        const encryptedRecord: LocalEncryptedCatalogRecordValue | undefined = await db.get(STORE_NAME, catalogId); 

        if (!encryptedRecord) return undefined;

        return this.decryptCatalog(encryptedRecord);
    }
    // ----------------------------------------------------------------------
    // MÉTODOS DE LECTURA ADICIONALES
    // ----------------------------------------------------------------------

    /**
     * Obtiene todos los catálogos almacenados localmente, descifra y devuelve la lista completa.
     */
    async getAllCatalogs(): Promise<Catalog[]> {
        const db = await getLocalDB(); 
        
        const encryptedRecords: LocalEncryptedCatalogRecordValue[] = await db.getAll(STORE_NAME);

        return encryptedRecords.map(record => this.decryptCatalog(record));
    }
    
    /**
     * Obtiene catálogos por un índice específico (e.g., por nombre).
     * @param catalogName El nombre del catálogo (ej. 'genders').
     */
   async getCatalogsByName(catalogName: string): Promise<Catalog[]> {
        const db = await getLocalDB();
        
        // 1. Abrir la transacción
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('by_catalog_name'); 
        
        // 2. Usar el casting para evitar el error ts(2345)
        const typedIndex = index as unknown as { getAll: (key: string) => Promise<any[]> };

        // 3. Obtener los registros del índice
        const encryptedRecords: LocalEncryptedCatalogRecordValue[] = await typedIndex.getAll(catalogName);

        await tx.done;
        
        if (!encryptedRecords.length) return [];
        
        return encryptedRecords.map(record => this.decryptCatalog(record));
    }
}