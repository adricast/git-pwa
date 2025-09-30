// src/services/db/indexed.ts
import type { dipasopwa } from "./../models/idb/rootIDB";
import { openDB, type IDBPDatabase } from "idb";

let dbInstance: IDBPDatabase<dipasopwa> | null = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<dipasopwa>("dipasopwa-db", 6, {
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
      
    },
  });

  return dbInstance;
};