// usedynamicform.tsx (FINAL CON SOPORTE PARA TABLA Y VISIBILIDAD CONDICIONAL)

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react'; 
import type { 
    DynamicFormContextData, 
    FormSection,
    FormField 
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

    // VALIDACIÓN ESPECÍFICA PARA TABLA: Debe ser un array con al menos 1 elemento.
    if (field.type === 'table') {
        // Podrías añadir validación profunda aquí si fuera necesario
        return Array.isArray(value) && value.length > 0;
    }

    // VALIDACIÓN ESTÁNDAR para strings
    if (typeof value === 'string' && value.trim() === '') {
        return false;
    }
    
    return true;
};


/**
 * Hook personalizado que gestiona el estado y la lógica central del formulario dinámico.
 */
export const useDynamicForm = ({ sections, initialData = {}, onSubmit }: UseDynamicFormHookProps): DynamicFormContextData => {
 
    // 1. Estado de los datos del formulario
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialState: Record<string, any> = {};

        sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.type === 'checkbox') {
                    initialState[field.name] = initialData[field.name] ?? false;
                } 
                else if (field.type === 'table') { 
                    initialState[field.name] = initialData[field.name] ?? [];
                } 
                else {
                    initialState[field.name] = initialData[field.name] ?? '';
                }
            });
        });
        return initialState;
    });

    // 2. ESTADO DE LA PAGINACIÓN/PASOS
    const [currentStep, setCurrentStep] = useState(0); 
    const totalSteps = useMemo(() => sections.length, [sections]);

    // 3. Sincronización de estado (Asegura que el formulario recoja nuevos campos de initialData/sections)
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
                    updatedState[field.name] = []; 
                } else {
                    updatedState[field.name] = '';
                }
            });
        });

        setFormData(prevData => {
            const hasChanged = Object.keys(updatedState).some(key => prevData[key] !== updatedState[key]);
            return hasChanged ? updatedState : prevData;
        });

    }, [initialData, sections]); 

    // 4. NAVEGACIÓN ENTRE PASOS
    const nextStep = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    }, [currentStep, totalSteps]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    // 5. Manejador de cambios
    const handleChange = useCallback((name: string, value: any) => {
        setFormData(prevData => {
            const field = sections
                .flatMap(s => s.fields)
                .find(f => f.name === name);

            let finalValue = value; 
            
            if (field) {
                if (field.type === 'number') {
                    if (value === '') {
                        finalValue = ''; 
                    } else {
                        const numValue = parseFloat(value);
                        finalValue = isNaN(numValue) ? value : numValue;
                    }
                } else if (field.type === 'checkbox') {
                    finalValue = !!value; 
                } 
            }

            return {
                ...prevData,
                [name]: finalValue,
            };
        });
    }, [sections]);

    // 6. LÓGICA DE VALIDACIÓN DEL PASO ACTUAL (isCurrentStepValid)
    const isCurrentStepValid = useMemo(() => {
        if (totalSteps === 0 || currentStep >= totalSteps) {
            return false;
        }

        const currentSection = sections[currentStep];
        
        // 🛑 APLICACIÓN DE LA CORRECCIÓN: Filtrar por requerido Y por visibilidad
        const visibleRequiredFields = currentSection.fields.filter(f => 
            f.required && (f.isVisible ? f.isVisible(formData) : true)
        );

        if (visibleRequiredFields.length === 0) {
            return true;
        }

        return visibleRequiredFields.every(field => validateField(field, formData[field.name]));
        
    }, [formData, sections, currentStep, totalSteps]);

    // 7. LÓGICA DE VALIDACIÓN DEL FORMULARIO COMPLETO (isFormValid)
    const isFormValid = useMemo(() => {
        
        // 🛑 APLICACIÓN DE LA CORRECCIÓN: Filtrar por requerido Y por visibilidad en todo el formulario
        const visibleRequiredFields = sections
            .flatMap(s => s.fields)
            .filter(f => 
                f.required && (f.isVisible ? f.isVisible(formData) : true)
            );

        return visibleRequiredFields.every(field => validateField(field, formData[field.name]));
        
    }, [formData, sections]);

    // 8. Manejador de envío
    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            onSubmit(formData);
        } else {
            console.error("No se puede enviar. Faltan campos requeridos en el formulario.");
        }
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