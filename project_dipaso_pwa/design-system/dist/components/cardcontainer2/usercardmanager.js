// src/components/CardManager/useCardManager.ts (FINAL CORREGIDO)
//es un hook
import { useContext } from 'react';
// 💡 1. Importar la constante CardManagerContext desde su archivo de DEFINICIÓN
// (Subir un nivel, buscar CardManagerContextDef.ts)
import { CardManagerContext } from './cardmanagercontextdef';
/**
 * Hook para acceder a las funciones de gestión global de fichas (add, update, isCardOpen).
 * Lanza un error si se usa fuera de CardManagerProvider.
 */
export const useCardManager = () => {
    const context = useContext(CardManagerContext);
    if (context === undefined) {
        throw new Error('useCardManager must be used within a CardManagerProvider');
    }
    // Usamos 'as' para asegurar a TypeScript que el contexto es del tipo CardManagerContextType
    // ya que sabemos que el check 'context === undefined' es correcto.
    return context;
};
