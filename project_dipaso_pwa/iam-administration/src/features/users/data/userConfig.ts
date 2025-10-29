// ============================================================================
// CAPA: Data/Configuración - Configuración y tipos para el módulo de usuarios
// ============================================================================

import type { PersonModel } from "../../../models/api/personModel";
import type { EmployeeSelectorColumn } from "../content/EmployeeSelector";

/**
 * Configuración de columnas para el selector de empleados
 */
export const EMPLOYEE_SELECTOR_COLUMNS: EmployeeSelectorColumn<PersonModel>[] = [
  { field: 'givenName', header: 'Nombres' },
  { field: 'surName', header: 'Apellidos' },
  {
    field: 'documents',
    header: 'Identificación',
    bodyTemplate: (person: PersonModel) =>
      person.documents?.[0]?.docNumber || ''
  },
];

/**
 * Configuración del selector de empleados
 */
export const EMPLOYEE_SELECTOR_CONFIG = {
  rowKey: 'personId',
  searchFields: ['givenName', 'surName', 'documents'],
  searchPlaceholder: 'Buscar por nombres, apellidos, cédula...',
  emptyMessage: 'No se encontraron empleados',
  label: 'Empleado:'
};

/**
 * Interfaz para dirección
 */
export interface Direccion {
  id?: string | number;
  tipo: string;
  pais: string;
  provincia: string;
  ciudad: string;
  direccion: string;
  codigoPostal: string;
}

/**
 * Configuración de columnas para la tabla de direcciones
 */
export const ADDRESS_TABLE_COLUMNS = [
  { field: 'tipo', header: 'Tipo de dirección' },
  { field: 'pais', header: 'País' },
  { field: 'provincia', header: 'Provincia' },
  { field: 'ciudad', header: 'Ciudad' },
  { field: 'direccion', header: 'Dirección' },
  { field: 'codigoPostal', header: 'Código postal' }
];

/**
 * Configuración de la tabla de direcciones
 */
export const ADDRESS_TABLE_CONFIG = {
  title: 'Listado de Direcciones',
  dataKey: 'id',
  deleteLabel: 'Eliminar',
  addLabel: 'Agregar',
  emptyMessage: 'No hay direcciones registradas'
};

/**
 * Metadata de los pasos del stepper
 */
export interface StepperMetadata {
  number: number;
  label: string;
  shortLabel: string;
}

/**
 * Configuración de los pasos del stepper
 */
export const STEPPER_STEPS: StepperMetadata[] = [
  { number: 1, label: 'Selección\nEmpleado', shortLabel: 'Selección' },
  { number: 2, label: 'Configuración', shortLabel: 'Config.' },
  { number: 3, label: 'Sucursales', shortLabel: 'Sucursales' },
  { number: 4, label: 'Autenticación', shortLabel: 'Autent.' }
];

/**
 * Datos mock de direcciones para testing
 */
export const MOCK_DIRECCIONES: Direccion[] = [
  {
    id: 1,
    tipo: 'Oficina',
    pais: 'Ecuador',
    provincia: 'Pichincha',
    ciudad: 'Quito',
    direccion: 'Av. Naciones Unidas y Amazonas',
    codigoPostal: '170135'
  },
  {
    id: 2,
    tipo: 'Apartamento',
    pais: 'Ecuador',
    provincia: 'Azuay',
    ciudad: 'Cuenca',
    direccion: 'Calle Larga 10-25',
    codigoPostal: '010101'
  }
];

/**
 * Interfaz para grupos de usuario
 */
export interface UserGroup {
  id: string;
  name: string;
}

/**
 * Datos mock de grupos de usuarios
 */
export const MOCK_USER_GROUPS: UserGroup[] = [
  { id: '01', name: 'ADMINISTRACION' },
  { id: '02', name: 'CREDITO' },
  { id: '03', name: 'COMPRAS' },
  { id: '04', name: 'CAJA' },
  { id: '05', name: 'VENTAS' },
  { id: '06', name: 'DESPACHO' },
  { id: '07', name: 'BODEGA' },
  { id: '08', name: 'SUCURSAL DIPASO JUNIOR' },
  { id: '09', name: 'SUCURSAL PLAZA CENTRAL' },
  { id: '10', name: 'SISTEMAS' }
];

/**
 * Datos mock de políticas en estructura de árbol jerárquico para PrimeReact Tree
 */
export const MOCK_POLICIES_TREE = [
  {
    key: '0',
    label: 'Administración',
    data: 'Administración',
    icon: 'pi pi-fw pi-briefcase',
    children: [
      {
        key: '0-0',
        label: 'Usuarios',
        data: 'Usuarios',
        icon: 'pi pi-fw pi-users',
        children: [
          {
            key: '0-0-0',
            label: 'Crear Usuarios',
            data: 'Crear Usuarios',
            icon: 'pi pi-fw pi-user-plus'
          },
          {
            key: '0-0-1',
            label: 'Actualizar Usuarios',
            data: 'Actualizar Usuarios',
            icon: 'pi pi-fw pi-user-edit'
          },
          {
            key: '0-0-2',
            label: 'Eliminar Usuarios',
            data: 'Eliminar Usuarios',
            icon: 'pi pi-fw pi-user-minus'
          }
        ]
      },
      {
        key: '0-1',
        label: 'Configuración',
        data: 'Configuración',
        icon: 'pi pi-fw pi-cog',
        children: [
          {
            key: '0-1-0',
            label: 'Gestión de Roles',
            data: 'Gestión de Roles',
            icon: 'pi pi-fw pi-shield'
          },
          {
            key: '0-1-1',
            label: 'Parámetros del Sistema',
            data: 'Parámetros del Sistema',
            icon: 'pi pi-fw pi-sliders-h'
          }
        ]
      }
    ]
  },
  {
    key: '1',
    label: 'Operaciones',
    data: 'Operaciones',
    icon: 'pi pi-fw pi-shopping-cart',
    children: [
      {
        key: '1-0',
        label: 'Caja',
        data: 'Caja',
        icon: 'pi pi-fw pi-wallet',
        children: [
          {
            key: '1-0-0',
            label: 'Abrir Caja',
            data: 'Abrir Caja',
            icon: 'pi pi-fw pi-unlock'
          },
          {
            key: '1-0-1',
            label: 'Cerrar Caja',
            data: 'Cerrar Caja',
            icon: 'pi pi-fw pi-lock'
          },
          {
            key: '1-0-2',
            label: 'Cuadre de Caja',
            data: 'Cuadre de Caja',
            icon: 'pi pi-fw pi-calculator'
          }
        ]
      },
      {
        key: '1-1',
        label: 'Ventas',
        data: 'Ventas',
        icon: 'pi pi-fw pi-shopping-bag',
        children: [
          {
            key: '1-1-0',
            label: 'Crear factura',
            data: 'Crear factura',
            icon: 'pi pi-fw pi-file'
          },
          {
            key: '1-1-1',
            label: 'Anular factura',
            data: 'Anular factura',
            icon: 'pi pi-fw pi-times-circle'
          },
          {
            key: '1-1-2',
            label: 'Venta Gift Card',
            data: 'Venta Gift Card',
            icon: 'pi pi-fw pi-gift'
          }
        ]
      }
    ]
  },
  {
    key: '2',
    label: 'Inventario',
    data: 'Inventario',
    icon: 'pi pi-fw pi-box',
    children: [
      {
        key: '2-0',
        label: 'Transferencias',
        data: 'Transferencias',
        icon: 'pi pi-fw pi-sync',
        children: [
          {
            key: '2-0-0',
            label: 'Crear Transferencia',
            data: 'Crear Transferencia',
            icon: 'pi pi-fw pi-arrow-right-arrow-left'
          },
          {
            key: '2-0-1',
            label: 'Aprobar Transferencia',
            data: 'Aprobar Transferencia',
            icon: 'pi pi-fw pi-check-circle'
          }
        ]
      },
      {
        key: '2-1',
        label: 'Ajustes de Stock',
        data: 'Ajustes de Stock',
        icon: 'pi pi-fw pi-align-justify',
        children: [
          {
            key: '2-1-0',
            label: 'Ajuste de Entrada',
            data: 'Ajuste de Entrada',
            icon: 'pi pi-fw pi-plus'
          },
          {
            key: '2-1-1',
            label: 'Ajuste de Salida',
            data: 'Ajuste de Salida',
            icon: 'pi pi-fw pi-minus'
          }
        ]
      }
    ]
  },
  {
    key: '3',
    label: 'Reportes',
    data: 'Reportes',
    icon: 'pi pi-fw pi-chart-bar',
    children: [
      {
        key: '3-0',
        label: 'Ventas',
        data: 'Reportes de Ventas',
        icon: 'pi pi-fw pi-chart-line'
      },
      {
        key: '3-1',
        label: 'Inventario',
        data: 'Reportes de Inventario',
        icon: 'pi pi-fw pi-list'
      },
      {
        key: '3-2',
        label: 'Financieros',
        data: 'Reportes Financieros',
        icon: 'pi pi-fw pi-money-bill'
      }
    ]
  }
];
