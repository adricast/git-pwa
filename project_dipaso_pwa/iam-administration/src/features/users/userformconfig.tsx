// src/components/forms/userformconfig.tsx

import type { FormSection } from './../../components/multisectiondinamicform/interface'; // Ruta de importación actualizada

// Opciones para el campo 'Tipo de Documentación'
const identificationOptions = [
    { value: 'cedula', label: 'Cédula' },
    { value: 'ruc', label: 'RUC' },
    { value: 'pasaporte', label: 'Pasaporte' },
];

export const userFormSections: FormSection[] = [

    // ----------------------------------------------------
    // SECCIÓN 1: CREDENCIALES DE ACCESO (Paso 1/5)
    // ----------------------------------------------------
    {
        title: "Credenciales de Acceso",
        columns: 2, // Usuario y Contraseña/Confirmación
        fields: [
            // 1. USUARIO (Nombre de Usuario)
            {
                name: "username",
                label: "Nombre de Usuario",
                type: "text",
                required: true,
                placeholder: "Crea un nombre de usuario",
            },
            // Campo de relleno (útil para alinear el grid)
            {
                name: "passwordFiller", 
                type: "custom", 
                label: " ", // Etiqueta vacía
                required: false,
                // Nota: Podrías inyectar un componente de fortaleza de contraseña aquí.
            },
            // 2. PASSWORD
            {
                name: "password",
                label: "Contraseña",
                type: "password",
                required: true,
                placeholder: "Ingresa tu contraseña",
            },
            // 3. CONFIRMACIÓN DE PASSWORD
            {
                name: "confirmPassword",
                label: "Confirmar Contraseña",
                type: "password",
                required: true,
                placeholder: "Repite tu contraseña",
                // Nota: La validación de que coincidan debe hacerse en useDynamicForm.
            },
        ],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 2: IDENTIFICACIÓN (Paso 2/5)
    // ----------------------------------------------------
    {
        title: "Información de Identificación",
        columns: 2, 
        fields: [
            // 4. TIPO DE DOCUMENTACIÓN
            {
                name: "idType",
                label: "Tipo de Documentación",
                type: "select",
                required: true,
                options: identificationOptions, 
                placeholder: "Selecciona el tipo de documento",
            },
            // 5. #IDENTIFICACION
            {
                name: "identification",
                label: "Número de Identificación",
                type: "text",
                required: true,
                placeholder: "Número de Identificación",
            },
        ],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 3: DATOS PERSONALES (Paso 3/5)
    // ----------------------------------------------------
    {
        title: "Datos Personales",
        columns: 2,
        fields: [
            // 6. PRIMER NOMBRE
            {
                name: "firstName",
                label: "Primer Nombre",
                type: "text",
                required: true,
                placeholder: "Primer Nombre (Obligatorio)",
            },
            // 7. SEGUNDO NOMBRE (Opcional)
            {
                name: "middleName",
                label: "Segundo Nombre",
                type: "text",
                required: false, 
                placeholder: "Segundo Nombre (Opcional)",
            },
            // 8. PRIMER APELLIDO
            {
                name: "firstLastName",
                label: "Primer Apellido",
                type: "text",
                required: true,
                placeholder: "Primer Apellido (Obligatorio)",
            },
            // 9. SEGUNDO APELLIDO (Opcional)
            {
                name: "secondLastName",
                label: "Segundo Apellido",
                type: "text",
                required: false, 
                placeholder: "Segundo Apellido (Opcional)",
            },
        ],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 4: INFORMACIÓN DE CONTACTO (Paso 4/5)
    // ----------------------------------------------------
    {
        title: "Información de Contacto",
        columns: 2, 
        fields: [
            // 10. CORREO
            {
                name: "email",
                label: "Correo Electrónico",
                type: "email",
                required: true,
                placeholder: "correo@ejemplo.com (Obligatorio)",
            },
            // 11. TELÉFONO
            {
                name: "phone",
                label: "Teléfono",
                type: "text", 
                required: true,
                placeholder: "000 000 0000 (Obligatorio)",
            },
        ],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 5: DIRECCIÓN (Paso 5/5)
    // ----------------------------------------------------
    {
        title: "Dirección de Residencia",
        columns: 1, 
        fields: [
            // 12. DIRECCIÓN
            {
                name: "address",
                label: "Dirección",
                type: "textarea", 
                required: true,
                placeholder: "Dirección de Residencia Completa (Obligatorio)",
                helperText: "Asegúrese de incluir calle principal, calle secundaria y referencia." // Ejemplo de helperText
            },
        ],
    },
];