// usedynamicform.tsx (CORREGIDO)

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react'; // Importar FormEvent
// Importar la interfaz DynamicFormContextData, que ahora incluye las propiedades de paso
import type { 
 DynamicFormContextData, 
 FormSection,
} from './interface'; // Ajusta la ruta si es necesario

interface UseDynamicFormHookProps {
 sections: FormSection[];
 initialData?: Record<string, any>;
 onSubmit: (data: Record<string, any>) => void;
}

/**
* Hook personalizado que gestiona el estado, la lógica central del formulario dinámico,
* y el manejo de los pasos (multi-sección).
*/
export const useDynamicForm = ({ sections, initialData = {}, onSubmit }: UseDynamicFormHookProps): DynamicFormContextData => {
 
 // 1. Estado de los datos del formulario (sin cambios)
 const [formData, setFormData] = useState<Record<string, any>>(() => {
 const initialState: Record<string, any> = {};

 sections.forEach(section => {
 section.fields.forEach(field => {
 if (field.type === 'checkbox') {
 initialState[field.name] = initialData[field.name] ?? false;
 } else {
 initialState[field.name] = initialData[field.name] ?? '';
 }
 });
 });
 return initialState;
 });

 // 2. ESTADO DE LA PAGINACIÓN/PASOS (NUEVO)
 const [currentStep, setCurrentStep] = useState(0); 
 const totalSteps = useMemo(() => sections.length, [sections]);

 // 3. Sincronización de estado (sin cambios)
 useEffect(() => {
 const updatedState: Record<string, any> = {};

 sections.forEach(section => {
 section.fields.forEach(field => {
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

 // 4. NAVEGACIÓN ENTRE PASOS (NUEVO)
 const nextStep = useCallback(() => {
 // Solo avanzar si no estamos en el último paso
 if (currentStep < totalSteps - 1) {
 setCurrentStep(currentStep + 1);
 }
 }, [currentStep, totalSteps]);

 const prevStep = useCallback(() => {
 // Solo retroceder si no estamos en el primer paso (paso 0)
 if (currentStep > 0) {
 setCurrentStep(currentStep - 1);
 }
}, [currentStep]);

 // 5. Manejador de cambios (CORREGIDO)
 const handleChange = useCallback((name: string, value: any) => {
 setFormData(prevData => {
 const field = sections
.flatMap(s => s.fields)
.find(f => f.name === name);

 let finalValue = value; 
 
 if (field) {
  if (field.type === 'number') {
                    // ✅ CORRECCIÓN: Si es cadena vacía, mantenemos la cadena vacía (''). 
                    // Esto permite al input de tipo 'number' o 'date' funcionar correctamente
                    // cuando el usuario lo borra, evitando que se convierta a null y se resetea.
 if (value === '') {
                       finalValue = ''; 
                    } else {
                        // Intentamos parsear a número, pero mantenemos el valor original
                        // si es una entrada incompleta o no numérica (ej: '1.')
                        const numValue = parseFloat(value);
                        finalValue = isNaN(numValue) ? value : numValue;
                    }
 } else if (field.type === 'checkbox') {
 finalValue = !!value; 
 }
                // Los campos 'text', 'date', 'email', etc. (que son cadenas) simplemente usan finalValue = value.
 }

 return {
 ...prevData,
 [name]: finalValue,
 };
 });
 }, [sections]);

 // 6. LÓGICA DE VALIDACIÓN DEL PASO ACTUAL (isCurrentStepValid) (NUEVO)
 const isCurrentStepValid = useMemo(() => {
 // Validación básica para evitar errores si no hay secciones
 if (totalSteps === 0 || currentStep >= totalSteps) {
 return false;
 }

 const currentSection = sections[currentStep];

// Solo validamos los campos REQUERIDOS de la SECCIÓN ACTUAL
 const requiredFields = currentSection.fields.filter(f => f.required);

 // Si no hay campos requeridos, el paso es válido
 if (requiredFields.length === 0) {
return true;
 }

// Verificamos que todos los campos requeridos de este paso tengan un valor
return requiredFields.every(field => {
 const value = formData[field.name];

 // Es inválido si es null, undefined, o una cadena vacía (después de trim)
if (value === null || value === undefined) {
 return false;
 }
 if (typeof value === 'string' && value.trim() === '') {
 return false;
 }
 return true;
 });
 }, [formData, sections, currentStep, totalSteps]);

 // 7. LÓGICA DE VALIDACIÓN DEL FORMULARIO COMPLETO (isFormValid) (ACTUALIZADO)
 // Se usa para habilitar el botón final de submit, asegurando que TODO esté lleno.
 const isFormValid = useMemo(() => {
 const requiredFields = sections
 .flatMap(s => s.fields)
 .filter(f => f.required);

 return requiredFields.every(field => {
 const value = formData[field.name];

 if (value === null || value === undefined) {
 return false;
 }
if (typeof value === 'string' && value.trim() === '') {
 return false;
 }
 return true;
 });
 }, [formData, sections]);

 // 8. Manejador de envío (con tipado explícito para FormEvent)
 const handleSubmit = useCallback((e: FormEvent) => {
 e.preventDefault();
 // Solo permitir el submit final si el formulario completo es válido
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
 isFormValid, // Validez total del formulario

 // Propiedades de Multi-Step
 currentStep, 
 totalSteps, 
 nextStep, 
 prevStep, 
 isCurrentStepValid, // Validez del paso actual
};
};