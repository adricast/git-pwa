// usedynamicform.tsx (FINAL CON SOPORTE PARA TABLA)

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react'; // Importar FormEvent
import type { 
    DynamicFormContextData, 
    FormSection,
    FormField // 🛑 Importar FormField para el tipado en la validación
} from './interface'; 

interface UseDynamicFormHookProps {
    sections: FormSection[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
}

// 🛑 Función auxiliar para validar cualquier tipo de campo requerido
const validateField = (field: FormField, value: any): boolean => {
    // Si no es requerido, es válido.
    if (!field.required) return true;

    // Si el valor es null o undefined, es inválido.
    if (value === null || value === undefined) {
        return false;
    }

    // 🛑 VALIDACIÓN ESPECÍFICA PARA TABLA: Debe ser un array con al menos 1 elemento.
    if (field.type === 'table') {
        return Array.isArray(value) && value.length > 0; //
    }

    // VALIDACIÓN ESTÁNDAR para strings (text, email, date, etc.) y numbers (cuando son '')
    if (typeof value === 'string' && value.trim() === '') {
        return false; //
    }
    
    // Para 'checkbox', 'file', y otros, si no es null/undefined, es válido.
    return true;
};


/**
 * Hook personalizado que gestiona el estado, la lógica central del formulario dinámico,
 * y el manejo de los pasos (multi-sección).
 */
export const useDynamicForm = ({ sections, initialData = {}, onSubmit }: UseDynamicFormHookProps): DynamicFormContextData => {
 
    // 1. Estado de los datos del formulario (Añadido 'table')
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialState: Record<string, any> = {};

        sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.type === 'checkbox') {
                    initialState[field.name] = initialData[field.name] ?? false; //
                } 
                // 🛑 Inicializar campos 'table' como un array vacío o con datos iniciales
                else if (field.type === 'table') { 
                    initialState[field.name] = initialData[field.name] ?? []; //
                } 
                else {
                    initialState[field.name] = initialData[field.name] ?? ''; //
                }
            });
        });
        return initialState;
    });

    // 2. ESTADO DE LA PAGINACIÓN/PASOS (NUEVO)
    const [currentStep, setCurrentStep] = useState(0); 
    const totalSteps = useMemo(() => sections.length, [sections]); //

    // 3. Sincronización de estado (Añadido 'table' en la inicialización de estado)
    useEffect(() => {
        const updatedState: Record<string, any> = {};

        sections.forEach(section => {
            section.fields.forEach(field => {
                const isExisting = Object.prototype.hasOwnProperty.call(formData, field.name);
                const isInitial = Object.prototype.hasOwnProperty.call(initialData, field.name);

                if (isExisting) {
                    updatedState[field.name] = formData[field.name];
                } else if (isInitial) {
                    updatedState[field.name] = initialData[field.name];
                } else if (field.type === 'checkbox') {
                    updatedState[field.name] = false;
                } else if (field.type === 'table') { 
                    updatedState[field.name] = []; // Por defecto, array vacío
                } else {
                    updatedState[field.name] = '';
                }
            });
        });

        // Solo actualizar si realmente ha cambiado la estructura de datos
        setFormData(prevData => {
            const hasChanged = Object.keys(updatedState).some(key => prevData[key] !== updatedState[key]);
            return hasChanged ? updatedState : prevData;
        });

    }, [initialData, sections]); 

    // 4. NAVEGACIÓN ENTRE PASOS (Se mantiene sin cambios)
    const nextStep = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    }, [currentStep, totalSteps]); //

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]); //

    // 5. Manejador de cambios (ACTUALIZADO para manejar campos de tipo 'table' que pasan el array completo)
    const handleChange = useCallback((name: string, value: any) => {
        setFormData(prevData => {
            const field = sections
                .flatMap(s => s.fields)
                .find(f => f.name === name);

            let finalValue = value; 
            
            if (field) {
                if (field.type === 'number') {
                    // ✅ Manejo de números para mantener cadena vacía si se borra el input.
                    if (value === '') {
                        finalValue = ''; 
                    } else {
                        const numValue = parseFloat(value);
                        finalValue = isNaN(numValue) ? value : numValue;
                    } //
                } else if (field.type === 'checkbox') {
                    finalValue = !!value; 
                } 
                // Los campos de tipo 'table' (que son arrays) simplemente usan finalValue = value.
            }

            return {
                ...prevData,
                [name]: finalValue,
            };
        });
    }, [sections]);

    // 6. LÓGICA DE VALIDACIÓN DEL PASO ACTUAL (isCurrentStepValid) (ACTUALIZADO para usar validateField)
    const isCurrentStepValid = useMemo(() => {
        if (totalSteps === 0 || currentStep >= totalSteps) {
            return false;
        }

        const currentSection = sections[currentStep];
        const requiredFields = currentSection.fields.filter(f => f.required); //

        if (requiredFields.length === 0) {
            return true;
        }

        // 🛑 Usar la función auxiliar para la validación
        return requiredFields.every(field => validateField(field, formData[field.name])); //
        
    }, [formData, sections, currentStep, totalSteps]);

    // 7. LÓGICA DE VALIDACIÓN DEL FORMULARIO COMPLETO (isFormValid) (ACTUALIZADO para usar validateField)
    const isFormValid = useMemo(() => {
        const requiredFields = sections
            .flatMap(s => s.fields)
            .filter(f => f.required);

        // 🛑 Usar la función auxiliar para la validación
        return requiredFields.every(field => validateField(field, formData[field.name])); //
        
    }, [formData, sections]);

    // 8. Manejador de envío (con tipado explícito para FormEvent - sin cambios)
    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            onSubmit(formData);
        } else {
            console.error("No se puede enviar. Faltan campos requeridos en el formulario.");
        } //
    }, [formData, onSubmit, isFormValid]);

    
    return {
        formData,
        handleChange,
        sections,
        handleSubmit,
        isFormValid, 
        currentStep, 
        totalSteps, 
        nextStep, 
        prevStep, 
        isCurrentStepValid, 
    };
};
    
export default useDynamicForm;