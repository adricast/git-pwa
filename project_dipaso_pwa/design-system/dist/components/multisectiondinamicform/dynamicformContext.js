// src/contexts/dynamicFormContext.ts
import { createContext, useContext } from 'react';
// 1. Definición del Contexto: Almacena el objeto DynamicFormContextData o es undefined.
// El valor inicial es 'undefined' y será poblado por DynamicFormProvider.
export const DynamicFormContext = createContext(undefined);
/**
 * Hook customizado para consumir el Contexto del Formulario Dinámico.
 *
 * Este hook debe ser llamado por cualquier componente hijo de DynamicFormProvider
 * que necesite acceder a: formData, handleChange, currentStep, nextStep, etc.
 *
 * @returns El objeto DynamicFormContextData con el estado y los handlers.
 * @throws Error si se llama fuera de un DynamicFormProvider.
 */
export const useDynamicFormContext = () => {
    const context = useContext(DynamicFormContext);
    // 2. Validación: Aseguramos que el hook se use dentro de su Provider.
    if (context === undefined) {
        throw new Error('useDynamicFormContext debe ser usado dentro de un DynamicFormProvider.');
    }
    // Devuelve el objeto completo, que ahora tiene la lógica de paginación
    return context;
};
