// 📁 src/components/forms/EmployFormWrapper.tsx (VERSIÓN FINAL MULTI-CATÁLOGO)

import React, { useState } from "react"; 
// Importamos los CINCO hooks de datos
import { useGenderOptionsLoader } from "./../../datacomponents/genderData"; 
import { useCountryOptionsLoader } from "./../../datacomponents/countryData"; 
import { useDocumentTypeOptionsLoader } from "./../../datacomponents/documenttypeData"; 
import { useProvinceOptionsLoader } from "./../../datacomponents/provinceData"; // 🚨 Agregado
import { useCityOptionsLoader } from "./../../datacomponents/cityData"; // 🚨 Agregado

// Importamos los CINCO arrays mutables (placeholders) desde la configuración
import { 
    genderOptions, 
    countryOptions, 
    identificationOptions,
    provinceOptions, // 🚨 Agregado
    cityOptions // 🚨 Agregado
} from "./employformconfig"; 
import AddEditEmployContent from "./addeditemploy"; 
import type { PersonModel } from "../../models/api/personModel";


export const EmployFormWrapper: React.FC<{
    employ: PersonModel | null; 
    onSave: (employ: PersonModel | null, data: any) => Promise<void>; 
    onClose: () => void;
}> = ({ employ, onSave, onClose }) => {
    
    // 1. LLAMADA A LOS CINCO HOOKS EN PARALELO
    const genderResult = useGenderOptionsLoader();
    const countryResult = useCountryOptionsLoader();
    const documentTypeResult = useDocumentTypeOptionsLoader(); 
    const provinceResult = useProvinceOptionsLoader(); // 🚨 Resultado de Provincia
    const cityResult = useCityOptionsLoader(); // 🚨 Resultado de Ciudad

    // Consolidación de estados de carga
    const isLoading = (
        genderResult.isLoading || 
        countryResult.isLoading || 
        documentTypeResult.isLoading ||
        provinceResult.isLoading || // 🚨 Incluido
        cityResult.isLoading // 🚨 Incluido
    );
    
    // Consolidación de estados de error
    const error = (
        genderResult.error || 
        countryResult.error || 
        documentTypeResult.error ||
        provinceResult.error || // 🚨 Incluido
        cityResult.error // 🚨 Incluido
    );
    
    const [isDataInjected, setIsDataInjected] = useState(false); 

    // 2. 🚨 MUTACIÓN CRÍTICA: Inyecta los cinco sets de datos
    React.useEffect(() => {
        // Ejecutar solo si la carga TOTAL finalizó y aún no hemos inyectado la data
        if (!isLoading && !error && !isDataInjected) {
            
            let dataWasInjected = false;

            // MUTACIÓN 1: GÉNEROS
            if (genderResult.genderOptions.length > 0) {
                genderOptions.length = 0; 
                genderOptions.push(...genderResult.genderOptions); 
                dataWasInjected = true;
            }

            // MUTACIÓN 2: PAÍSES
            if (countryResult.countryOptions.length > 0) {
                countryOptions.length = 0; 
                countryOptions.push(...countryResult.countryOptions); 
                dataWasInjected = true;
            }
            
            // MUTACIÓN 3: TIPOS DE DOCUMENTO
            if (documentTypeResult.documentTypeOptions.length > 0) {
                identificationOptions.length = 0; 
                identificationOptions.push(...documentTypeResult.documentTypeOptions); 
                dataWasInjected = true;
            }

            // MUTACIÓN 4: PROVINCIAS 🚨 NUEVO
            if (provinceResult.provinceOptions.length > 0) {
                provinceOptions.length = 0; 
                provinceOptions.push(...provinceResult.provinceOptions); 
                dataWasInjected = true;
            }

            // MUTACIÓN 5: CIUDADES 🚨 NUEVO
            if (cityResult.cityOptions.length > 0) {
                cityOptions.length = 0; 
                cityOptions.push(...cityResult.cityOptions); 
                dataWasInjected = true;
            }
            
            // 🚨 FORZAR RE-RENDERIZACIÓN si la carga finalizó (y si la mutación ocurrió o no hubo errores)
            if (dataWasInjected || (!genderResult.error && !countryResult.error && !documentTypeResult.error && !provinceResult.error && !cityResult.error)) {
                setIsDataInjected(true);
            }
        }
    // Añadimos todas las dependencias necesarias.
    }, [isLoading, error, isDataInjected, genderResult, countryResult, documentTypeResult, provinceResult, cityResult, genderOptions, countryOptions, identificationOptions, provinceOptions, cityOptions]); 
    
    // 3. Manejo de Estados de Carga
    if (isLoading || !isDataInjected) {
        // El mensaje ahora incluye la carga de los 5 catálogos
        return <div>Cargando datos esenciales de catálogos (Géneros, Países, Documentos, Provincias, Ciudades)...</div>;
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