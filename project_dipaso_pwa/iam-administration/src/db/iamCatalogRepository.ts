// 📁 iam-administration/src/db/iamCatalogRepository.ts

import { getLocalDB } from "./localIDBdatabase"; 
import type { LocalEncryptedCatalogRecordValue } from "./LocalCatalogsDB";
import type { IDBPDatabase } from 'idb';
// Importamos solo Catalog localmente
import type { Catalog } from "./../models/idb/catalogsModel"; 

// ASUME: La función de descifrado es accesible
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
        
        // Obtenemos todos los registros cifrados
        const encryptedRecords: LocalEncryptedCatalogRecordValue[] = await db.getAll(STORE_NAME);

        // Mapear y descifrar cada registro
        return encryptedRecords.map(record => this.decryptCatalog(record));
    }
    
    /**
     * Obtiene catálogos por un índice específico (e.g., por nombre).
     * @param catalogName El nombre del catálogo (ej. 'genders').
     */
   async getCatalogsByName(catalogName: string): Promise<Catalog[]> {
        const db = await getLocalDB();
        
        // 1. Asertamos el tipo del objeto db para obtener el método getAllFromIndex correctamente tipado.
        // Esto le dice a TypeScript que el métodogetAllFromIndex del store 'catalogs'
        // para el índice 'by_catalog_name' acepta una clave de tipo 'string'.
        const typedDb = db as unknown as IDBPDatabase<{
            catalogs: {
                indexes: { by_catalog_name: string };
            };
        }>;

        // 2. Usamos el objeto con el tipo asertado. El error de asignación de 'string' desaparece.
        const encryptedRecords: LocalEncryptedCatalogRecordValue[] = await typedDb.getAllFromIndex(
            STORE_NAME, 
            'by_catalog_name', // Nombre del índice
            catalogName        // Valor de la clave (string, ahora aceptado)
        );
        
        if (!encryptedRecords.length) return [];
        
        // 3. Mapear y descifrar
        return encryptedRecords.map(record => this.decryptCatalog(record));
    }
    // Nota: Otros métodos como getActiveCatalogs se implementarían de manera similar, 
    // usando db.getAllFromIndex con el índice 'by_is_active'.
}