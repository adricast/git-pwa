// Configuración de secciones y campos del formulario de usuario
import type { FormSection } from "@dipaso/design-system";

interface FormOption {
	value: string;
	label: string;
}

const estadoOptions: FormOption[] = [
	{ value: 'active', label: 'Activo' },
	{ value: 'inactive', label: 'Inactivo' },
];

const aplicacionesOptions: FormOption[] = [
	{ value: 'dipaso', label: 'Dipaso_Conmigo' },
	{ value: 'invex', label: 'Invex' },
	{ value: 'mabianed', label: 'Mabianed' },
	{ value: 'phantom', label: 'Phantom' },
	{ value: 'sap', label: 'SAP' },
];

export const userFormSections: FormSection[] = [
	{
		title: "Datos Generales",
		columns: 2,
		fields: [
			{ name: "code", label: "Código", type: "text", required: true, placeholder: "Ej: AAFANADOR" },
			{ name: "name", label: "Nombre", type: "text", required: true, placeholder: "Ej: Ashley Afanador" },
			{ name: "password", label: "Contraseña", type: "password", required: true },
			{ name: "web", label: "WEB", type: "text", required: false },
			{ name: "employee", label: "Empleado", type: "text", required: false },
			{ name: "group", label: "Grupo", type: "text", required: false },
			{ name: "estado", label: "Estado", type: "select", required: true, options: estadoOptions },
			{ name: "isActive", label: "Activo", type: "checkbox", required: true },
		],
	},
	{
		title: "Aplicaciones",
		columns: 1,
		fields: [
			{ name: "aplicaciones", label: "Aplicaciones", type: "select", required: false, options: aplicacionesOptions },
		],
	},
	{
		title: "Seguridad Punto de Venta",
		columns: 2,
		fields: [
			{ name: "codigoPV", label: "Código PV", type: "password", required: false },
			{ name: "tarjetaMagnetica", label: "Tarjeta Magnética", type: "text", required: false },
		],
	},
	{
		title: "Perfil de Acceso",
		columns: 1,
		fields: [
			{ name: "perfilAcceso", label: "Perfil de Acceso", type: "select", required: false, options: [
				{ value: 'financiera', label: 'GENERAL FINANCIERA' },
				{ value: 'administrativa', label: 'GENERAL ADMINISTRATIVA' },
				{ value: 'operativa', label: 'GENERAL OPERATIVA' },
				{ value: 'gerencial', label: 'GENERAL GERENCIAL' },
				{ value: 'sistema', label: 'GENERAL DEL SISTEMA' },
				{ value: 'marcas', label: 'GENERAL MARCAS' },
				{ value: 'minimas', label: 'GENERAL MÍNIMAS' },
			] },
		],
	},
];
