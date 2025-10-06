// src/components/forms/userformconfig.tsx

//import type { FormSection } from './../../components/dinamicform/interface';  // Asegúrate que la ruta sea correcta
import type { FormSection } from '../../components/multisectiondinamicform/interface';
// Opciones para el campo 'Tipo de Documentación'
const identificationOptions = [
    { value: 'cedula', label: 'Cédula' },
    { value: 'ruc', label: 'RUC' },
    { value: 'pasaporte', label: 'Pasaporte' },
];

export const userFormSections: FormSection[] = [

    // ----------------------------------------------------
    // NUEVA SECCIÓN 1: CREDENCIALES DE ACCESO (2 Columnas)
    // ----------------------------------------------------
    {
        title: "Credenciales de Acceso",
        columns: 2, // Usuario en una columna, Contraseñas en la otra
        fields: [
            // 1. USUARIO (Nombre de Usuario)
            {
                name: "username",
                label: "Nombre de Usuario",
                type: "text",
                required: true,
                placeholder: "Crea un nombre de usuario",
            },
            // Campo de relleno para alinear la sección de Contraseñas
            {
                name: "passwordFiller", 
                type: "custom", 
                label: " ", // Etiqueta vacía para no mostrar texto
                required: false,
                // Opcional: puedes inyectar un componente para la validación de seguridad de la contraseña aquí
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
                // Nota: La validación de que ambas coincidan debe ir en tu `usedynamicform.tsx`
            },
        ],
    },
    
    // ----------------------------------------------------
    // SECCIÓN 2: IDENTIFICACIÓN (2 Columnas)
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
    // SECCIÓN 3: DATOS PERSONALES (2 Columnas)
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
    // SECCIÓN 4: INFORMACIÓN DE CONTACTO (2 Columnas)
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
    // SECCIÓN 5: DIRECCIÓN (1 Columna)
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
            },
        ],
    },
];