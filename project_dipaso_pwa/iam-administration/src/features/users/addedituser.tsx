// src/components/AddEditUserContent.tsx (El código permanece inalterado)

import React, { useCallback, useMemo } from "react";
import type { User } from "../../models/api/userModel";
import DynamicForm from "../../components/dinamicform/dynamicformProvider"; // Ajusta la ruta
import { userFormSections } from "./userformconfig"; // 🛑 Carga la nueva configuración de 2 y 1 columna

import "./../../components/styles/dynamicform.scss"; 
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
            // El botón de Cancelar debe ir antes del de Guardar si quieres que esté a la izquierda
            {
                label: 'Cancelar',
                type: 'button' as const, // Importante: type='button' evita que se dispare el submit
                // Asumiendo que tu DynamicForm soporta propiedades de estilo (o Tailwind/CSS)
                outlined: true, // Ejemplo: Para un estilo de botón secundario/transparente
                onClick: onClose,
                // Puedes añadir más estilos o clases aquí si tu DynamicForm las soporta
                // className: "group-form__button group-form__button--secondary" 
            }
    ]), [onClose]);
    const initialData = useMemo(() => {
        // ... Lógica de inicialización
        if (user) {
            return { username: user.username || "", identification: user.identification || "", email: user.email || "" };
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
            {/*
            <h3 className="group-form__title">
                {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h3>
             */
            }
            

            {/* El DynamicForm renderiza automáticamente las dos secciones (2 y 1 columna) */}
        
            <DynamicForm
                sections={userFormSections}
                initialData={initialData}
                onSubmit={handleDynamicSubmit}
                // Este es el botón "Guardar" / "Actualizar"
                buttonText={user ? "Actualizar Grupo" : "Crear Usuario"}
                className="group-form" // Usamos la clase CSS de tu formulario original
                actions={formActions} // Inyectamos el botón de Cancelar aquí
            />
          
        </div>
    );
};

export default AddEditUserContent;