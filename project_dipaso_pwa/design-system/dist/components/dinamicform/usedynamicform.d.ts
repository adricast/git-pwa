import type { DynamicFormContextData, FormSection } from './interface';
interface UseDynamicFormHookProps {
    sections: FormSection[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
}
/**
 * Hook personalizado que gestiona el estado y la lógica central del formulario dinámico.
 */
export declare const useDynamicForm: ({ sections, initialData, onSubmit }: UseDynamicFormHookProps) => DynamicFormContextData;
export default useDynamicForm;
