// 📁 src/components/forms/EmployFormWrapper.tsx (VERSIÓN FINAL Y FUNCIONAL)

import React, { useState } from "react"; 
// Importamos los CINCO hooks de datos
import { useGenderOptionsLoader } from "./../../datacomponents/genderData"; 
import { useCountryOptionsLoader }  from "./../../datacomponents/countryData"; 
import { useDocumentTypeOptionsLoader } from "./../../datacomponents/documenttypeData"; 
import { useProvinceOptionsLoader } from "./../../datacomponents/provinceData"; 
import { useCityOptionsLoader } from "./../../datacomponents/cityData"; 
// ✅ REINCORPORACIÓN CRÍTICA: Hook para verificar si el Shell inicializó los IDs.
// ASUME: La ruta es correcta.
import { useCatalogMapInitializationStatus } from "./../../hooks/useCatalogMapInitializationStatus"; 


// Importamos los CINCO arrays mutables (placeholders) desde la configuraciónaq
import { 
    genderOptions, 
    countryOptions, 
    identificationOptions,
    provinceOptions, 
    cityOptions 
} from "./employformconfig"; 
import AddEditEmployContent from "./addeditemploy"; 
import type { PersonModel } from "../../models/api/personModel";

export const EmployFormWrapper: React.FC<{
    employ: PersonModel | null; 
    onSave: (employ: PersonModel | null, data: any) => Promise<void>; 
    onClose: () => void;
}> = ({ 
    // ✅ CORRECCIÓN: Asignar el tipo de la propiedad 'employ' explícitamente
    employ, 
    onSave, 
    onClose 
}: {
    employ: PersonModel | null; 
    onSave: (employ: PersonModel | null, data: any) => Promise<void>; 
    onClose: () => void;
}) => {
    
    // 0. LLAMADA CRÍTICA: Inicializa el GLOBAL_CATALOG_ID_MAP
    const { isMapInitialized, mapInitializationError } = useCatalogMapInitializationStatus();

    // 1. LLAMADA A LOS CINCO HOOKS: PASANDO LA DEPENDENCIA DE INICIALIZACIÓN
    // Los Hooks ahora esperarán isMapInitialized === true antes de intentar el fetch.
    const genderResult = useGenderOptionsLoader(isMapInitialized);
    const countryResult = useCountryOptionsLoader(isMapInitialized);
    const documentTypeResult = useDocumentTypeOptionsLoader(isMapInitialized); 
    const provinceResult = useProvinceOptionsLoader(isMapInitialized); 
    const cityResult = useCityOptionsLoader(isMapInitialized);
    // Consolidación de estados de carga de catálogos
    const hasComponentDataLoaded = (
        !genderResult.isLoading && 
        !countryResult.isLoading && 
        !documentTypeResult.isLoading &&
        !provinceResult.isLoading && 
        !cityResult.isLoading
    );
    
    // 💡 LA CLAVE: Esperar a que el mapa de IDs esté lleno (!isMapInitialized)
    const isLoading = !isMapInitialized || !hasComponentDataLoaded;
    
    // Consolidación de errores
    const error = (
        mapInitializationError || // Error si el mapa no se pudo inicializar
        genderResult.error || 
        countryResult.error || 
        documentTypeResult.error ||
        provinceResult.error || 
        cityResult.error
    );
    
    const [isDataInjected, setIsDataInjected] = useState(false); 

    // 2. 🚨 MUTACIÓN CRÍTICA: Inyecta los cinco sets de datos
    React.useEffect(() => {
        // Ejecutar solo si el mapa de IDs está listo Y la carga de los 5 catálogos terminó.
        if (isMapInitialized && hasComponentDataLoaded && !error && !isDataInjected) {
            
            let dataWasInjected = false;

            // Lógica de inyección consolidada
            const injectionLogic = [
                { source: genderResult.genderOptions, target: genderOptions },
                { source: countryResult.countryOptions, target: countryOptions },
                { source: documentTypeResult.documentTypeOptions, target: identificationOptions },
                { source: provinceResult.provinceOptions, target: provinceOptions },
                { source: cityResult.cityOptions, target: cityOptions },
            ];

            injectionLogic.forEach(({ source, target }) => {
                if (source?.length > 0) { // Usamos el operador ?. para seguridad
                    target.length = 0; 
                    target.push(...source); 
                    dataWasInjected = true;
                }
            });
            
            // Forzar re-renderizado
            if (dataWasInjected) {
                setIsDataInjected(true);
            }
        }
    // Añadimos todas las dependencias necesarias.
    }, [isLoading, error, isDataInjected, isMapInitialized, hasComponentDataLoaded, 
        genderResult, countryResult, documentTypeResult, provinceResult, cityResult, 
        // No es necesario añadir los arrays mutables a las dependencias.
    ]); 
    
    // 3. Manejo de Estados de Carga
    if (isLoading || !isDataInjected) {
        // El componente espera el mapa de IDs Y los 5 catálogos.
        return <div>Cargando datos esenciales de catálogos (Esperando mapa de IDs y 5 catálogos)...</div>;
    }
    if (error) {
        return <div>Error crítico al cargar catálogos: {error.message}. No se puede mostrar el formulario.</div>;
    }

    // 4. Renderiza el formulario de contenido. 
    return (
        <AddEditEmployContent 
            employ={employ} 
            onSave={onSave} 
            onClose={onClose} 
        />
    );
};

export default EmployFormWrapper;