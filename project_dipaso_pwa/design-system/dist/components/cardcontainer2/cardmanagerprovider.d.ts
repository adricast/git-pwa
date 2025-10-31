import React from 'react';
import { type CardManagerContextType } from './interface';
interface CardManagerProviderProps {
    children: React.ReactNode;
    addCardFunction: CardManagerContextType['addCard'];
    updateCardFunction: CardManagerContextType['updateCard'];
    isCardOpenFunction: CardManagerContextType['isCardOpen'];
    removeCardFunction: CardManagerContextType['removeCard'];
}
/**
 * Componente que provee el Contexto de Gestión (Add, Update, Check).
 */
export declare const CardManagerProvider: React.FC<CardManagerProviderProps>;
export {};
