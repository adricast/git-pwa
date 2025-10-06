// src/components/AddEditUserContent.tsx (El código permanece inalterado)

// src/components/AddEditUserContent.tsx

import React, { useCallback, useMemo } from "react";
import type { User } from "../../models/api/userModel";
// 🛑 CORRECCIÓN: Usar el nuevo DynamicFormProvider con soporte multi-sección
import DynamicForm from "../../components/multisectiondinamicform/dynamicformProvider"; // Ajusta la ruta a tu nuevo componente
import { userFormSections } from "./userformconfig"; 

import "./../../components/styles/multisectiondynamicform.scss"; 

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

    const handleDynamicSubmit = useCallback(async (data: Record<string, any>) => {
        const userData = data as UserFormData;
        
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
        
            <DynamicForm
                sections={userFormSections}
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