import React from 'react';
interface CardProviderProps {
    children: React.ReactNode;
    id: string | number;
    onClose: (id: string | number) => void;
}
/**
 * Componente que provee el contexto de cierre de la ficha.
 * Es un componente de React válido para Fast Refresh.
 */
export declare const CardProvider: React.FC<CardProviderProps>;
export {};
