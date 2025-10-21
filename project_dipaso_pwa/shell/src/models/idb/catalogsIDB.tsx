import type { DBSchema } from "idb";
// import type { Catalog } from "../api/catalogsModel"; // LÍNEA ELIMINADA
// 🚨 CLAVE: ASUMIMOS que EncryptedCatalogRecord se importa (de catalogsModel o similar).
// Si no existe, debes definirlo junto a Catalog en catalogsModel.ts.
import type { EncryptedCatalogRecord } from "../api/catalogsModel"; // <--- Ajustar si el tipo está en otra parte

export interface CatalogsDB extends DBSchema {
  catalogs: {
    key: string;
    // 🚨 CORRECCIÓN CLAVE 1: value debe ser el registro CIFRADO para que db.put/get no fallen.
    value: EncryptedCatalogRecord; 
    indexes: {
      // 🚨 CORRECCIÓN CLAVE 2: Los índices deben ser CADENAS LITERALES.
      by_catalog_name: "catalog_name"; 
      by_is_active: "is_active";
      by_updated_at: "updated_at";
    };
  };
}
