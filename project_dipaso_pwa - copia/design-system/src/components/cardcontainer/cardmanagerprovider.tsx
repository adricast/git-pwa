// src/components/CardManager/CardManagerProvider.tsx (FINAL)

import React from 'react';
import { CardManagerContext } from './cardmanagercontextdef'; // Importamos la constante
import {type CardManagerContextType } from './interface'; // Importamos tipos

interface CardManagerProviderProps {
  children: React.ReactNode;
  // Aceptar las tres funciones del Gestor
  addCardFunction: CardManagerContextType['addCard']; 
  updateCardFunction: CardManagerContextType['updateCard'];
  isCardOpenFunction: CardManagerContextType['isCardOpen'];
  removeCardFunction: CardManagerContextType['removeCard']; 
}

/**
 * Componente que provee el Contexto de Gestión (Add, Update, Check).
 */
export const CardManagerProvider: React.FC<CardManagerProviderProps> = ({ 
    children, 
    addCardFunction, 
    updateCardFunction, 
    isCardOpenFunction,
    // 🔑 CORRECCIÓN: Destructuramos la nueva prop.
    removeCardFunction 
}) => {
  
  return (
    <CardManagerContext.Provider 
        value={{ 
            addCard: addCardFunction,
            updateCard: updateCardFunction,
            isCardOpen: isCardOpenFunction,
            // 🔑 CORRECCIÓN: Incluimos removeCard en el objeto 'value'
            removeCard: removeCardFunction, 
        }}
    >
      {children}
    </CardManagerContext.Provider>
  );
};
export default CardManagerProvider;