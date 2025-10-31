// src/components/CardContainer/hooks/useCardContext.ts (ACTUALIZADO)
import { useContext } from 'react';
import { CardContext } from './cardcontextdef'; // 💡 Importamos la constante
/**
 * Hook para acceder a las funciones y el ID de la ficha contenedora.
 */
export const useCardContext = () => {
    const context = useContext(CardContext);
    if (context === undefined) {
        throw new Error('useCardContext must be used within a CardProvider');
    }
    return context;
};
