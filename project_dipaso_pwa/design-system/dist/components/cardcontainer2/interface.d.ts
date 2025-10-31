import React from "react";
/**
 * Define la función para agregar una nueva ficha.
 * @param title El título de la nueva ficha.
 * @param contentComponent El componente React a renderizar dentro de la nueva ficha.
 * @param customId El ID opcional de la ficha (string | number).
 */
export type AddCardFunction = (title: React.ReactNode, contentComponent: React.ReactNode, customId?: string | number) => void;
/**
 * Define la función para actualizar una ficha existente por su ID.
 * Se usa la firma de 3 argumentos para coincidir con CardManager.tsx.
 * @param id El ID de la ficha a actualizar.
 * @param title El nuevo título de la ficha.
 * @param contentComponent El nuevo contenido de la ficha.
 */
export type UpdateCardFunction = (id: string | number, title: React.ReactNode, // 🔑 CORRECCIÓN: Usamos 3 argumentos separados
contentComponent: React.ReactNode) => void;
export interface FichaData {
    id: string | number;
    title: React.ReactNode;
    contentComponent: React.ReactNode;
    onCloseCallback?: () => void;
}
/**
 * 🎯 CardManagerContextType: Contexto Global de Gestión de Fichas.
 * Permite a cualquier componente AGREGAR, ACTUALIZAR o CONSULTAR fichas.
 */
export interface CardManagerContextType {
    addCard: (title: React.ReactNode, content: React.ReactNode, id?: string | number, onCloseCallback?: () => void) => void;
    updateCard: (id: string | number, title: React.ReactNode, content: React.ReactNode) => void;
    isCardOpen: (id: string | number) => boolean;
    removeCard: (id: string | number) => void;
}
/**
 * CardContextType: Contexto de la Ficha Individual.
 * Permite al componente anidado CERRAR la ficha en la que reside.
 */
export interface CardContextType {
    closeCard: () => void;
    cardId: string | number;
}
export interface CardContainerProps {
    children: React.ReactNode;
    id: string | number;
    title?: React.ReactNode;
    onClose: (id: string | number) => void;
    className?: string;
    hideHeader?: boolean;
}
