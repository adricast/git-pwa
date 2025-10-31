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

// 🟢 INTERFAZ DE ITEM: Define los datos de cada pantalla en la pila.
export interface ScreenStackItem {
 id: string;
 title: string;
 content: React.ReactNode; // El componente React a renderizar (ej. AddEditGroupContent)
 isMinimized: boolean;
 isMaximized: boolean; // 🟢 NUEVO: Estado de Maximización
 
}

/**
 * 🟢 ESTADO GLOBAL DEL CONTEXTO (Pilada de Pantallas)
 * Los estados individuales (isOpen, title, isMinimized) se gestionan dentro del array `stack`.
 */
export interface ScreenContainerContextProps {
 stack: ScreenStackItem[]; // 🟢 ÚNICO ESTADO PRINCIPAL: La pila de pantallas activas

 // 🟢 openScreen ahora acepta una opción para abrir maximizado y devuelve el id de la pantalla
 openScreen: (title: string, content: React.ReactNode, options?: { maximized?: boolean }) => string; 

 // ❌ ELIMINADAS: isOpen, title, isMinimized (Ahora están dentro de `stack`)

 // 🟢 closeScreen/minimize/restore ahora requieren el ID
 closeScreen: (id: string) => void;
 minimizeScreen: (id: string) => void;
 restoreScreen: (id: string) => void;

 // 🟢 closeTopScreen: Cierra el último elemento de la pila (la pantalla visible)
closeTopScreen: () => void;
toggleMaximizeScreen: (id: string) => void;
}