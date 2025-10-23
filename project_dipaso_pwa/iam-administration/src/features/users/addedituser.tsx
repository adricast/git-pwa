
import React, { useCallback, useMemo } from "react";
import type { User } from "../../models/api/userModel";
import { userFormSections } from "./userformconfig"; 
import { DynamicFormProviderSections } from '@dipaso/design-system';
// Use the FormSection type from the same path as DynamicFormProviderSections expects:
import type { FormSection } from '@dipaso/design-system/dist/components/multisectiondinamicform/interface';


interface UserFormData {
    username: string;
    identification: string;
    email: string;
}

const AddEditUserContent: React.FC<{
    user: User | null;
    onSave: (user: User | null, username: string, identification: string, email: string) => Promise<void>; 
    onClose: () => void;
}> = ({ user, onSave, onClose }) => {
    const formActions = useMemo(() => ([
            // El botón de Cancelar
            {
                label: 'Cancelar',
                type: 'button' as const, 
                outlined: true, 
                onClick: onClose,
            }
    ]), [onClose]);
    
    const initialData = useMemo(() => {
        // ... Lógica de inicialización
        if (user) {
            return { 
                username: user.username || "", 
                identification: user.identification || "", 
                email: user.email || "" 
            };
        }
        return { username: "", identification: "", email: "" };
    }, [user]);

    const handleDynamicSubmit = useCallback(async (data: Record<string, string>) => {
        const userData = data as unknown as UserFormData;
        
        // La lógica del onSubmit sigue siendo la misma: limpiar y llamar a onSave.
        await onSave(
            user, 
            userData.username.trim(), 
            userData.identification.trim(),
            userData.email.trim()
        );
    }, [user, onSave]);

    return (
        <div className="group-form-wrapper">
            
            {/* El DynamicForm renderiza automáticamente las secciones con paginación */}

            <DynamicFormProviderSections
                sections={userFormSections as FormSection[]}
                initialData={initialData}
                onSubmit={handleDynamicSubmit}
                // Este es el botón "Guardar" / "Actualizar"
                buttonText={user ? "Actualizar Grupo" : "Crear Usuario"}
                className="group-form" 
                actions={formActions} // Inyectamos el botón de Cancelar aquí
            />
          
        </div>
    );
};

export default AddEditUserContent;