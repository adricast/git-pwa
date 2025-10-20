// src/components/forms/usedynamicform.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
    DynamicFormContextData, 
    FormField,
    FormSection,
    NestedFormField,
    TableField, // ✅ Mantenido para usar en la lógica (ver findAllFields y validateFields)
} from './interface'; 

// 🛑 MODIFICADO: La interfaz de las Props ahora acepta un array de secciones (sections)
interface UseDynamicFormHookProps {
    sections: FormSection[]; // Usamos sections en lugar de steps
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
}

/**
 * Función auxiliar RECURSIVA para encontrar todos los campos en una estructura de secciones,
 * incluyendo los campos dentro de 'nestedForm'.
 */
const findAllFields = (sections: FormSection[]): FormField[] => {
    return sections.flatMap(section => 
        section.fields.flatMap(field => {
            // Caso recursivo: Si es un formulario anidado, buscamos dentro de sus secciones
            if (field.type === 'nestedForm') {
                const nestedField = field as NestedFormField;
                return [
                    field, 
                    // Devolvemos el campo padre MÁS los campos encontrados recursivamente
                    ...findAllFields(nestedField.sections)
                ];
            }
            
            // ✅ CORRECCIÓN: Si es una tabla, hacemos un casting explícito para usar el tipo TableField,
            // aunque el resultado sea el mismo array que antes, ahora el tipo se considera 'usado'.
            if (field.type === 'table') {
                 // Utilizamos el tipo TableField explícitamente.
                 const tableField = field as TableField;
                 return [tableField];
            }

            // Caso base: Si no es un formulario anidado, devolvemos el campo
            return [field];
        })
    );
};

/**
 * Hook personalizado que gestiona el estado y la lógica central del formulario dinámico.
 */
export const useDynamicForm = ({ 
    sections, // ✅ MODIFICADO: Recibimos 'sections' en lugar de 'steps'
    initialData = {}, 
    onSubmit 
}: UseDynamicFormHookProps): DynamicFormContextData => {
    
    // 🆕 Calculamos la lista plana de TODOS los campos del formulario una sola vez
    const allFormFields = useMemo(() => {
        return findAllFields(sections);
    }, [sections]);


    // 2. Inicializa el estado del formulario (aplana todos los campos)
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialState: Record<string, any> = {};

        allFormFields.forEach(field => {
            if (initialData[field.name] !== undefined) {
                initialState[field.name] = initialData[field.name];
            } else if (field.type === 'checkbox') {
                initialState[field.name] = false;
            } 
            // 🛑 Inicializar campos 'table' como un array vacío
            else if (field.type === 'table') {
                 initialState[field.name] = [];
            }
            else {
                // Solo inicializar si NO es un nestedForm
                if (field.type !== 'nestedForm') {
                    initialState[field.name] = '';
                }
            }
        });
        return initialState;
    });

    // 3. Sincronización de estado (Mantiene la data existente si el esquema cambia)
    useEffect(() => {
        const updatedState: Record<string, any> = {};

        allFormFields.forEach(field => {
            // Prioridad 1: Preservar el valor actual (formData) si existe
            if (Object.prototype.hasOwnProperty.call(formData, field.name)) {
                updatedState[field.name] = formData[field.name];
            } 
            // Prioridad 2: Usar initialData si no hay valor actual
            else if (Object.prototype.hasOwnProperty.call(initialData, field.name)) {
                updatedState[field.name] = initialData[field.name];
            } 
            // Prioridad 3: Usar valor por defecto
            else if (field.type === 'checkbox') {
                updatedState[field.name] = false;
            } 
            // 🛑 Sincronizar 'table' como array
            else if (field.type === 'table') {
                 updatedState[field.name] = []; 
            }
            else if (field.type !== 'nestedForm') {
                updatedState[field.name] = '';
            }
        });
        
        // Evitar actualización si el estado no cambió para prevenir bucles de renderizado
        if (JSON.stringify(updatedState) !== JSON.stringify(formData)) {
            setFormData(updatedState);
        }
    }, [initialData, sections, allFormFields]); 

    
    // 4. Manejador centralizado de cambios
    const handleChange = useCallback((name: string, value: any) => {
        setFormData(prevData => {
            const field = allFormFields.find(f => f.name === name);

            let finalValue = value;

            if (field) {
                if (field.type === 'number') {
                    // ✅ CORRECCIÓN CLAVE: Almacenar '' si el input está vacío. 
                    if (value === '') {
                        finalValue = ''; 
                    } else {
                        finalValue = parseFloat(value);
                    }
                } else if (field.type === 'checkbox') {
                    finalValue = !!value;
                }
                // 🛑 Si el tipo es 'table', el valor es el array completo de filas, 
                // lo asignamos directamente sin transformación.
            }

            return {
                ...prevData,
                [name]: finalValue,
            };
        });
    }, [allFormFields]); 


    /**
     * Función auxiliar RECURSIVA que valida un array de campos/secciones.
     */
    const validateFields = (fieldsOrSections: (FormField | FormSection)[]): boolean => {
        return fieldsOrSections.every(item => {
            if ('fields' in item) {
                // Es una FormSection, validamos sus campos
                return validateFields(item.fields);
            } 
            else {
                // Es un FormField
                const field = item;
                const value = formData[field.name];
                
                // Si es un formulario anidado, validamos recursivamente
                if (field.type === 'nestedForm') {
                    const nestedField = field as NestedFormField;
                    return validateFields(nestedField.sections);
                }
                
                // 🛑 Validar campo de TIPO TABLA
                if (field.type === 'table') {
                    // ✅ Usamos TableField explícitamente para el casting
                    const tableField = field as TableField; 
                    if (tableField.required) {
                        // Una tabla requerida debe ser un array con al menos un elemento
                        const tableValue = value as any[];
                        return Array.isArray(tableValue) && tableValue.length > 0;
                    }
                    // Si no es requerida, es válida.
                    return true;
                }


                if (field.required) {
                    if (value === null || value === undefined) return false;
                    
                    // 🆕 CORRECCIÓN: Si el valor es numérico (después de parseFloat) y es NaN, falla.
                    if (typeof value === 'number' && isNaN(value)) return false; 
                    
                    // Si el valor es la cadena vacía (como pasa al borrar un number), falla si es requerido.
                    if (typeof value === 'string' && value.trim() === '') return false;
                }
                return true;
            }
        });
    };


    // 7. LÓGICA DE VALIDACIÓN DEL FORMULARIO COMPLETO (isFormValid)
    const isFormValid = useMemo(() => {
        // Validamos TODAS las secciones de entrada
        return validateFields(sections);
    }, [formData, sections]);


    // 8. Manejador de envío
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            onSubmit(formData);
        } else {
            // Opcional: Mostrar un mensaje de error o scroll a la primera sección inválida
            console.error("No se puede enviar. Faltan campos requeridos en el formulario.");
        }
    }, [formData, onSubmit, isFormValid]);


    // 9. Retorno actualizado (solo propiedades del formulario y no de navegación)
    return {
        formData,
        handleChange,
        sections, // ✅ DEVUELVE las secciones de entrada
        isFormValid, 
        handleSubmit,
        // 🛑 ELIMINADO: currentStepIndex, isStepValid, goToNextStep, goToPreviousStep
    };
};
    
export default useDynamicForm;