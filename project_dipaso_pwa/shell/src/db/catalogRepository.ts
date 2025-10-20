import { getDB } from "./indexed";
// Importamos Catalog, EncryptedCatalogRecord y EncryptedFragment
import type { Catalog, EncryptedCatalogRecord, EncryptedFragment } from "./../models/api/catalogsModel";
// 🚨 Importamos las funciones de cifrado desde la utilidad
import { encryptAndSignData, decryptAndVerifyData } from "./../hooks/encrypterIdb/useMac";

const STORE_NAME = "catalogs";

// Nota: No se requiere redefinir EncryptedFragment aquí, ya se importa del modelo.

export class CatalogRepository {
    
    // ------------------------------------------------
    // UTILIDADES INTERNAS DE CIFRADO
    // ------------------------------------------------

    private encryptCatalog(catalog: Catalog): EncryptedCatalogRecord {
        // Cifrar el valor dinámico del catálogo
        const encryptedValue: EncryptedFragment = encryptAndSignData(catalog.catalog_value);

        // Separar catalog_value del resto de las propiedades
        // Usamos aserción de tipo para garantizar que el resultado es EncryptedCatalogRecord
        const { catalog_value, ...restOfCatalog } = catalog;

        return {
            ...restOfCatalog,
            encrypted_catalog_value: encryptedValue,
        } as EncryptedCatalogRecord;
    }

    private decryptCatalog(record: EncryptedCatalogRecord): Catalog {
        try {
            // Descifrar el valor dinámico del catálogo
            const decryptedValue = decryptAndVerifyData(record.encrypted_catalog_value);

            // Reconstruir el objeto Catalog
            const { encrypted_catalog_value, ...restOfRecord } = record;

            return {
                ...restOfRecord,
                catalog_value: decryptedValue, // Asignamos el valor descifrado
            } as Catalog;
        } catch (error) {
            // Fallo de seguridad/descifrado
            console.error(`Error de seguridad: Fallo al descifrar el catálogo ${record.catalog_id}.`, error);
            throw new Error(`Failed to decrypt catalog ${record.catalog_id}. Data may be corrupted.`);
        }
    }

    // ------------------------------------------------
    // OPERACIONES CRUD CON CIFRADO
    // ------------------------------------------------

    async saveCatalog(catalog: Catalog): Promise<Catalog> {
        const db = await getDB();
        
        // 1. Cifrar
        const encryptedRecord: EncryptedCatalogRecord = this.encryptCatalog(catalog); 

        // 2. Guardar el registro cifrado. El tipo de put ahora es válido contra EncryptedCatalogRecord
        // porque el esquema de IndexedDB (CatalogsDB) fue corregido para usar este tipo.
        await db.put(STORE_NAME, encryptedRecord); 
        
        // Devolvemos el original Catalog, que es lo que espera la capa de aplicación
        return catalog; 
    }

    async getCatalog(id: string): Promise<Catalog | undefined> {
        const db = await getDB();
        
        // Obtenemos el registro cifrado. TypeScript infiere correctamente EncryptedCatalogRecord
        const encryptedRecord: EncryptedCatalogRecord | undefined = await db.get(STORE_NAME, id); 

        if (!encryptedRecord) return undefined;

        // 3. Descifrar y devolver el tipo Catalog
        return this.decryptCatalog(encryptedRecord);
    }

    async getAllCatalogs(): Promise<Catalog[]> {
        const db = await getDB();
        
        // Obtenemos todos los registros cifrados
        const encryptedRecords: EncryptedCatalogRecord[] = await db.getAll(STORE_NAME);

        // Mapear y descifrar cada registro
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
            
            // 2. Cifrar la lista antes de insertar
            const encryptedRecords = catalogs.map(c => this.encryptCatalog(c));

            const putPromises = encryptedRecords.map(record => store.put(record));
            
            await Promise.all(putPromises);
            await tx.done; 
            
        } catch (error) {
            console.error("Error en la transacción de bulk put para catálogos:", error);
            throw error; 
        }
    }
    
    // ------------------------------------------------
    // MÉTODOS ADICIONALES USANDO ÍNDICES Y CIFRADO
    // ------------------------------------------------

     async getCatalogsByName(name: string): Promise<Catalog[]> {
    const db = await getDB();
    // Usamos IDBKeyRange.only para que TS acepte el valor
    const encryptedRecords: EncryptedCatalogRecord[] = await db.getAllFromIndex(
      STORE_NAME,
      "by_catalog_name",
      IDBKeyRange.only(name)
    );
    return encryptedRecords.map(record => this.decryptCatalog(record));
  }

   async getActiveCatalogs(isActive: boolean): Promise<Catalog[]> {
    const db = await getDB();
    // Igual: usamos IDBKeyRange.only para boolean
    const encryptedRecords: EncryptedCatalogRecord[] = await db.getAllFromIndex(
      STORE_NAME,
      "by_is_active",
      IDBKeyRange.only(isActive)
    );
    return encryptedRecords.map(record => this.decryptCatalog(record));
  }

    async getAllOrderedByUpdate(): Promise<Catalog[]> {
        const db = await getDB();
        // Obtenemos todos los registros cifrados ordenados
        const encryptedRecords: EncryptedCatalogRecord[] = await db.getAllFromIndex(STORE_NAME, "by_updated_at");
        
        // Mapeamos y desciframos los resultados
        return encryptedRecords.map(record => this.decryptCatalog(record));
    }
}
