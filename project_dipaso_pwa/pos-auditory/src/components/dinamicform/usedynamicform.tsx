// src/hooks/useDynamicForm.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
// CORRECCIÓN: Se elimina DynamicFormProviderProps de la importación
import type { 
    DynamicFormContextData, 
    FormSection,
} from './interface'; // Ajusta la ruta si es necesario

// Nota: Esta interfaz usa FormSection (necesario) y el hook devuelve DynamicFormContextData (necesario).
interface UseDynamicFormHookProps {
    sections: FormSection[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
}

/**
 * Hook personalizado que gestiona el estado y la lógica central del formulario dinámico.
 */
export const useDynamicForm = ({ sections, initialData = {}, onSubmit }: UseDynamicFormHookProps): DynamicFormContextData => {
    
    // 1. Inicializa el estado del formulario
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialState: Record<string, any> = {};

        // Iteramos sobre todas las secciones y campos para establecer un estado inicial
        sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.type === 'checkbox') {
                    // Si viene en initialData, úsalo, si no, por defecto es false
                    initialState[field.name] = initialData[field.name] ?? false;
                } else {
                    // Si viene en initialData, úsalo, si no, por defecto es una cadena vacía
                    initialState[field.name] = initialData[field.name] ?? '';
                }
            });
        });
        return initialState;
    });

    // 2. Sincronización de estado cuando las secciones o initialData cambian
    // Esto asegura que si el esquema (sections) o los datos iniciales cambian, el formulario se actualice.
    useEffect(() => {
        const updatedState: Record<string, any> = {};

        sections.forEach(section => {
            section.fields.forEach(field => {
                // Mantiene el valor actual (formData) si existe, de lo contrario, usa initialData,
                // y si no, usa el valor por defecto basado en el tipo.
                
                // ✅ CORRECCIÓN ESLint: Usar Object.prototype.hasOwnProperty.call para evitar el error 'no-prototype-builtins'
                if (Object.prototype.hasOwnProperty.call(formData, field.name)) {
                    updatedState[field.name] = formData[field.name];
                } else if (Object.prototype.hasOwnProperty.call(initialData, field.name)) {
                    updatedState[field.name] = initialData[field.name];
                } else if (field.type === 'checkbox') {
                    updatedState[field.name] = false;
                } else {
                    updatedState[field.name] = '';
                }
            });
        });
        
        setFormData(updatedState);
    }, [initialData, sections]); 

    // 3. Manejador centralizado de cambios
    const handleChange = useCallback((name: string, value: any) => {
        setFormData(prevData => {
            const field = sections
                .flatMap(s => s.fields)
                .find(f => f.name === name);

            // ✅ CORRECCIÓN: Cambiar 'const' a 'let' para permitir la reasignación
            let finalValue = value; 
            
            // Lógica de conversión de tipo basada en la configuración del campo
            if (field) {
                if (field.type === 'number') {
                    // Convertir a número o null/undefined si el input está vacío
                    finalValue = value === '' ? null : parseFloat(value);
                } else if (field.type === 'checkbox') {
                    // Los checkboxes del DOM devuelven un booleano (true/false)
                    finalValue = !!value; 
                }
                // Los demás tipos (text, email, radio, select, textarea) se mantienen como string
            }

            return {
                ...prevData,
                [name]: finalValue,
            };
        });
    }, [sections]);

    // 4. Manejador de envío
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    }, [formData, onSubmit]);
        
    // 🛑 5. LÓGICA DE VALIDACIÓN DEL FORMULARIO (isFormValid)
    const isFormValid = useMemo(() => {
        // Aplanamos todos los campos requeridos de todas las secciones
        const requiredFields = sections
            .flatMap(s => s.fields)
            .filter(f => f.required);

        // Verificamos que todos los campos requeridos tengan un valor válido
        return requiredFields.every(field => {
            const value = formData[field.name];

            // Es inválido si es null, undefined, o una cadena vacía (después de trim)
            if (value === null || value === undefined) {
                return false;
            }
            if (typeof value === 'string' && value.trim() === '') {
                return false;
            }
            
            // Si es un número (o cualquier otro valor que no sea null/undefined/cadena vacía), es válido.
            return true;
        });
    }, [formData, sections]); // Recalcular cuando los datos cambian o el schema cambia


    return {
        formData,
        handleChange,
        sections,
        handleSubmit,
        isFormValid,
    };
};
