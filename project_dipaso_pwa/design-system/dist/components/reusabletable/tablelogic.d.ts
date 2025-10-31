import type { TableColumn, TableLogicHook } from "./interface";
/**
 * Custom Hook que maneja toda la lógica de filtrado y paginación de los datos.
 */
export declare const useTableLogic: (data: any[], columns: TableColumn[], initialRowsPerPage?: number) => TableLogicHook;
