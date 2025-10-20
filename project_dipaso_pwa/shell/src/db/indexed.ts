// src/services/db/indexed.ts
import type { dipasopwa } from "./../models/idb/rootIDB";
import { openDB, type IDBPDatabase } from "idb";

let dbInstance: IDBPDatabase<dipasopwa> | null = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  // 🚨 CAMBIO 1: Incrementamos la versión de la base de datos a 7
  dbInstance = await openDB<dipasopwa>("dipasopwa-db", 7, {
    upgrade(db) {
 

      // Resto de los stores (sin cambios)
      if (!db.objectStoreNames.contains("auths")) {
        const authStore = db.createObjectStore("auths", { keyPath: "auth_id", autoIncrement: true });
        authStore.createIndex("by_syncStatus", "syncStatus");
        authStore.createIndex("by_tempId", "tempId");
      }
      if (!db.objectStoreNames.contains("tokens")) {
        const tokenStore = db.createObjectStore("tokens", { keyPath: "key" });
        tokenStore.createIndex("by_expiresAt", "expiresAt");
      }
      
      // 🚨 CAMBIO 2: Añadimos el nuevo almacén 'catalogs'
      if (!db.objectStoreNames.contains("catalogs")) {
        const catalogStore = db.createObjectStore("catalogs", { 
            keyPath: "catalog_id" // Usa 'catalog_id' como clave primaria (keyPath)
        });
        
        // Creación de índices
        catalogStore.createIndex("by_catalog_name", "catalog_name");
        catalogStore.createIndex("by_is_active", "is_active");
        catalogStore.createIndex("by_updated_at", "updated_at");
      }
      
    },
  });

  return dbInstance;
};