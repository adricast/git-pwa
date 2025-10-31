// 📁 iam-administration/src/db/localIDBAccess.ts (SOLUCIÓN)

import { openDB } from "idb"; 
// 💡 Mover 'IDBPDatabase' a una importación de tipo separada.
import type { IDBPDatabase } from "idb"; 
// Importamos la interfaz minimalista que definiste localmente
import type { LocalCatalogsDB } from "./LocalCatalogsDB"; 

// 🚨 La información de conexión debe coincidir con la base de datos creada por el Shell.
const DB_NAME = "dipasopwa-db";
const DB_VERSION = 7; //

// Variable para almacenar la instancia de la base de datos
let dbInstance: IDBPDatabase<LocalCatalogsDB> | null = null; // USADO COMO TIPO

/**
 * Obtiene o abre la conexión a la base de datos IndexedDB ('dipasopwa-db').
 * * @returns Una promesa que resuelve con la instancia de la base de datos.
 */
export const getLocalDB = async (): Promise<IDBPDatabase<LocalCatalogsDB>> => { // USADO COMO TIPO
  if (dbInstance) return dbInstance;

  // openDB se importa sin problemas.
  dbInstance = await openDB<LocalCatalogsDB>(DB_NAME, DB_VERSION, {
    // ...
  });

  return dbInstance;
};