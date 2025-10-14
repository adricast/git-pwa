// 📁 src/management/people/addeditPerson.tsx (CORREGIDO)

import React, { useCallback, useMemo } from "react";
import type { Person } from "../../../models/api/personModel"; 

// 🛑 Importamos los componentes y la configuración de Persona
import DynamicForm from "../../../components/dinamicform/dynamicformProvider";
// ❌ ELIMINAMOS: DynamicSection ya no se necesita aquí porque DynamicForm lo usa internamente.
// import DynamicSection from "../../components/dinamicform/dynamicsection"; 
import type { DynamicButtonProps } from '../../../components/dinamicform/interface'; 
import { personFormSections } from "./peopleformconfig"; 

// Asumiendo que existe un archivo de estilos para el formulario
import "./../../components/styles/dynamicform.scss"; 


/**
 * Formulario de creación / edición de personas refactorizado con DynamicForm.
 */
const AddEditPersonContent: React.FC<{
    person: Person | null;
    // La tipificación Record<string, any> es suficiente aquí.
    onSave: (person: Person | null, data: Record<string, any>) => Promise<void>; 
    onClose: () => void;
}> = ({ person, onSave, onClose }) => {

    // 1. Preparamos los datos iniciales para el formulario dinámico
    const initialData = useMemo(() => {
        if (person) {
            // Mapeamos todos los campos del modelo Person
            return {
                givenName: person.givenName || "",
                surName: person.surName || "",
                
                phoneNumber: person.phoneNumber || "",
                // Formato de fecha para el input type="date"
                dateOfBirth: person.dateOfBirth ? person.dateOfBirth.substring(0, 10) : "", 
                genderId: person.genderId || "",
                isCustomer: person.isCustomer || false,
                isSupplier: person.isSupplier || false,
                isEmployee: person.isEmployee || false,
            };
        }
        // Valores iniciales para Creación
        return {
            dateOfBirth: "",
            genderId: "",
            isCustomer: false,
            isSupplier: false,
            isEmployee: false,
        };
    }, [person]);
   
    // 2. Definimos el handler onSubmit que será ejecutado por DynamicForm
    const handleDynamicSubmit = useCallback(async (data: Record<string, any>) => {
        // Ejecutamos tu lógica de guardado
        await onSave(person, data);
    }, [person, onSave]);

    // 3. Definimos el botón "Cancelar"
    const formActions: DynamicButtonProps[] = useMemo(() => ([
        {
            label: 'Cancelar',
            color: '#6c757d', 
            textColor: '#fff',
            type: 'button',
            onClick: onClose,
        }
    ]), [onClose]);


    return (
        <div className="person-form-wrapper">
            
            <DynamicForm
                sections={personFormSections} 
                initialData={initialData}
                onSubmit={handleDynamicSubmit}
                buttonText={person ? "Actualizar Persona" : "Crear Persona"}
                className="person-form" 
                actions={formActions} 
            >
                {/* ✅ ELIMINADA LA DUPLICACIÓN: Este bloque de children debe quedar vacío, 
                   ya que el renderizado ocurre con la prop 'sections'. */}
            </DynamicForm>
        </div>
    );
};

export default AddEditPersonContent;