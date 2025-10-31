import type { DynamicFormContextData } from './interface';
export declare const DynamicFormContext: import("react").Context<DynamicFormContextData | undefined>;
/**
 * Hook customizado para consumir el Contexto del Formulario Dinámico.
 *
 * Este hook debe ser llamado por cualquier componente hijo de DynamicFormProvider
 * que necesite acceder a: formData, handleChange, sections, handleSubmit, o isFormValid.
 *
 * @returns El objeto DynamicFormContextData con el estado y los handlers.
 * @throws Error si se llama fuera de un DynamicFormProvider.
 */
export declare const useDynamicFormContext: () => DynamicFormContextData;
