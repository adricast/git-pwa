// 📁 src/datacomponents/useCatalogMapInitializationStatus.ts

import { useState, useEffect } from 'react';
// 🚨 IMPORTACIONES REQUERIDAS (Asumidas)
import { IamCatalogRepository } from "./../db/iamCatalogRepository"; 
import { GLOBAL_CATALOG_ID_MAP, CATALOG_NAMES } from "./../configurations/parameters/catalogParameters";


/**
 * Define el estado de inicialización de los catálogos.
 */
interface InitializationStatus {
    isMapInitialized: boolean;
    mapInitializationError: Error | null;
}

// Inicializa el repositorio fuera del hook para evitar recrearlo.
const iamCatalogRepo = new IamCatalogRepository(); 

export const useCatalogMapInitializationStatus = (): InitializationStatus => {
    const [status, setStatus] = useState<InitializationStatus>({
        isMapInitialized: false,
        mapInitializationError: null,
    });

    useEffect(() => {
        // Obtenemos todos los nombres de catálogo que el sistema necesita mapear a IDs
        const requiredNames = Object.values(CATALOG_NAMES); 

        const initializeMap = async () => {
            try {
                // 🛑 LÓGICA DE MAPEO REAL: Leer la base de datos y llenar el mapa global

                for (const name of requiredNames) {
                    // 1. Usar el método eficiente corregido para obtener el catálogo por nombre
                    const catalogs = await iamCatalogRepo.getCatalogsByName(name); 
                    
                    if (catalogs.length > 0) {
                        // 2. Llenar el mapa global
                        GLOBAL_CATALOG_ID_MAP[name] = catalogs[0].catalogId;
                    } else {
                        // Si un catálogo crítico falta en IndexedDB, lanzamos un error
                        console.error(`Error de inicialización: El catálogo crítico '${name}' no fue encontrado en IndexedDB.`);
                        throw new Error(`Critical catalog data missing: ${name}`);
                    }
                }
                
                // Finalizar el proceso con éxito
                setStatus({ isMapInitialized: true, mapInitializationError: null });
                
            } catch (err: any) {
                console.error("Fallo la inicialización crítica del mapa de IDs.", err);
                setStatus({ isMapInitialized: false, mapInitializationError: err });
            }
        };

        // Ejecutar el proceso de inicialización inmediatamente.
        initializeMap();
    }, []);

    return status;
};