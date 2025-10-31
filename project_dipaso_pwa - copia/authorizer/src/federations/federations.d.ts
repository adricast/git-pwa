// src/federation/federation.d.ts
declare module "shell/dbService" {
    // Necesitas importar los tipos de 'idb' para tipificar correctamente el retorno.
    import { IDBPDatabase } from 'idb';
    
    /**
     * Define la función getDB que devuelve una promesa de la instancia de la base de datos.
     * Usamos <any> ya que el tipo completo del esquema 'dipasopwa' podría no estar disponible aquí.
     */
    export const getDB: () => Promise<IDBPDatabase<any>>; 
}