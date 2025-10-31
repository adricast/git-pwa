import { type CardManagerContextType } from './interface';
/**
 * Hook para acceder a las funciones de gestión global de fichas (add, update, isCardOpen).
 * Lanza un error si se usa fuera de CardManagerProvider.
 */
export declare const useCardManager: () => CardManagerContextType;
