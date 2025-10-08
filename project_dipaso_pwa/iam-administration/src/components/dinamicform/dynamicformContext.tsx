// src/contexts/dynamicFormContext.ts

import { createContext, useContext } from 'react';
// Importamos solo el tipo para mantener la limpieza del código
import type { DynamicFormContextData } from './interface'; // Ajusta la ruta

// 1. Definición del Contexto: Almacena el objeto DynamicFormContextData o es undefined si no está envuelto.
// Inicialmente es 'undefined' y será poblado por DynamicFormProvider.
export const DynamicFormContext = createContext<DynamicFormContextData | undefined>(undefined);

/**
 * Hook customizado para consumir el Contexto del Formulario Dinámico.
 *
 * Este hook debe ser llamado por cualquier componente hijo de DynamicFormProvider
 * que necesite acceder a: formData, handleChange, sections, handleSubmit, o isFormValid.
 *
 * @returns El objeto DynamicFormContextData con el estado y los handlers.
 * @throws Error si se llama fuera de un DynamicFormProvider.
 */
export const useDynamicFormContext = (): DynamicFormContextData => {
    const context = useContext(DynamicFormContext);
    
    // 2. Validación: Aseguramos que el hook se use dentro de su Provider.
    if (context === undefined) {
        throw new Error('useDynamicFormContext debe ser usado dentro de un DynamicFormProvider.');
    }
    
    return context;
};
