// iam-administration/src/db/localIDBAccess.ts

import { openDB, type IDBPDatabase } from "idb";
// Importamos la interfaz minimalista que definiste localmente
import type { LocalCatalogsDB } from "./LocalCatalogsDB"; 

// 🚨 La información de conexión debe coincidir con la base de datos creada por el Shell.
const DB_NAME = "dipasopwa-db";
const DB_VERSION = 7; //

// Variable para almacenar la instancia de la base de datos
let dbInstance: IDBPDatabase<LocalCatalogsDB> | null = null;

/**
 * Obtiene o abre la conexión a la base de datos IndexedDB ('dipasopwa-db').
 * * Utiliza el esquema minimalista LocalCatalogsDB para romper la dependencia
 * con el esquema completo (rootIDB) del Shell.
 * * @returns Una promesa que resuelve con la instancia de la base de datos.
 */
export const getLocalDB = async (): Promise<IDBPDatabase<LocalCatalogsDB>> => {
  if (dbInstance) return dbInstance;

  // Abrimos la conexión. Usamos la versión 7, que ya ha sido creada por el Shell.
  dbInstance = await openDB<LocalCatalogsDB>(DB_NAME, DB_VERSION, {
    // Es crucial NO incluir una función 'upgrade' que intente crear o modificar stores,
    // ya que este microservicio solo CONSUME la base de datos existente.
    // La función upgrade solo es necesaria si la versión cambia o si se abriera por primera vez.
  });

  return dbInstance;
};