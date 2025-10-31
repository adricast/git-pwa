import React from "react";
/**
 * NOTA: ScreenContainerLayoutProps es redundante en la arquitectura de Stack,
 * ya que el layout leerá el array 'stack' directamente del contexto.
 * Se mantiene por si otros componentes la están importando.
 */
export interface ScreenContainerLayoutProps {
    title?: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}
export interface ScreenStackItem {
    id: string;
    title: string;
    content: React.ReactNode;
    isMinimized: boolean;
    isMaximized: boolean;
}
/**
 * 🟢 ESTADO GLOBAL DEL CONTEXTO (Pilada de Pantallas)
 * Los estados individuales (isOpen, title, isMinimized) se gestionan dentro del array `stack`.
 */
export interface ScreenContainerContextProps {
    stack: ScreenStackItem[];
    openScreen: (title: string, content: React.ReactNode) => void;
    closeScreen: (id: string) => void;
    minimizeScreen: (id: string) => void;
    restoreScreen: (id: string) => void;
    closeTopScreen: () => void;
    toggleMaximizeScreen: (id: string) => void;
}
