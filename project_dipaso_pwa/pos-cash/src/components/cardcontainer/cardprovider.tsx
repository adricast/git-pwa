// src/components/CardContainer/CardProvider.tsx (ACTUALIZADO/RENOMBRADO)

import React from 'react';
import { CardContext } from './cardcontextdef'; // 💡 Importamos la constante
//import { type CardContextType } from './interfaz';

interface CardProviderProps {
  children: React.ReactNode;
  id: string | number;
  onClose: (id: string | number) => void;
}

/**
 * Componente que provee el contexto de cierre de la ficha.
 * Es un componente de React válido para Fast Refresh.
 */
export const CardProvider: React.FC<CardProviderProps> = ({ children, id, onClose }) => {
  
  const closeCard = () => {
    onClose(id); 
  };

  return (
    <CardContext.Provider value={{ closeCard, cardId: id }}>
      {children}
    </CardContext.Provider>
  );
};