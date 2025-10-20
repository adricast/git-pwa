// src/components/AddEditGroupContent.tsx (VERSIÓN CON DYNAMIC FORM)

import React, { useCallback, useMemo } from "react";
// Asumiendo que Group está en "../../models/api/groupModel"
import type { Group } from "../../models/api/groupModel"; 
import { groupFormSections } from "./groupformconfig"; // Ajusta la ruta
import { DynamicFormProvider } from "@dipaso/design-system";

// --- Tipado de los datos del formulario que DynamicForm devolverá ---
interface GroupFormData {
    groupName: string;
    description: string;
}

/**
 * Formulario de creación / edición de grupos refactorizado con DynamicForm.
 */
const AddEditGroupContent: React.FC<{
    group: Group | null;
    // La prop onSave ahora es llamada DENTRO del onSubmit del DynamicForm
    onSave: (group: Group | null, groupName: string, description: string) => void; 
    onClose: () => void;
}> = ({ group, onSave, onClose }) => {

    // 1. Preparamos los datos iniciales para el formulario dinámico
    const initialData = useMemo(() => {
        if (group) {
            return {
                groupName: group.groupName || "",
                description: group.description || "",
            };
        }
        return {
            groupName: "",
            description: "",
        };
    }, [group]);

    // 2. Definimos el handler onSubmit que será ejecutado por DynamicForm
    const handleDynamicSubmit = useCallback((data: Record<string, unknown>) => {
        const groupData = data as unknown as GroupFormData;
        
        // Llamamos a tu lógica de guardado, pasando los datos limpios que recibimos
        onSave(
            group, 
            groupData.groupName.trim(), 
            groupData.description.trim()
        );
    }, [group, onSave]);

    // 3. Definimos el botón "Cancelar" usando la estructura de 'actions'
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


    return (
        <div className="group-form-wrapper">
            {/**
                 
                <h3 className="group-form__title">
                    {group ? "Editar Grupo" : "Crear Nuevo Grupo"}
                </h3>
                
             */}
         

            {/* 🛑 DynamicForm maneja los dos botones internamente:
                 - El botón de envío (type="submit") se define por 'buttonText'.
                 - El botón de cancelar se inyecta en 'actions'.
            */}
            <DynamicFormProvider
                sections={groupFormSections}
                initialData={initialData}
                onSubmit={handleDynamicSubmit}
                // Este es el botón "Guardar" / "Actualizar"
                buttonText={group ? "Actualizar Grupo" : "Crear Grupo"}
                className="group-form" // Usamos la clase CSS de tu formulario original
                actions={formActions} // Inyectamos el botón de Cancelar aquí
            />
            
        </div>
    );
};

export default AddEditGroupContent;
