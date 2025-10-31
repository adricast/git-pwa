import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ScreenContainerContext } from "./screencontainercontext";
export const ScreenContainerProvider = ({ children }) => {
    // 🟢 ÚNICO ESTADO CRÍTICO: La pila (stack) de pantallas
    const [stack, setStack] = useState([]);
    // Función auxiliar para mantener las minimizadas al final del array
    const sortStack = useCallback((currentStack) => {
        // Ordena: las no minimizadas (false) van primero, las minimizadas (true) van al final.
        return currentStack.sort((a, b) => (a.isMinimized === b.isMinimized ? 0 : a.isMinimized ? 1 : -1));
    }, []);
    // 1. ABRIR PANTALLA
    const openScreen = useCallback((newTitle, newContent) => {
        const newScreen = {
            id: uuidv4(),
            title: newTitle,
            content: newContent,
            isMinimized: false,
            isMaximized: true,
        };
        setStack(prevStack => {
            const minimized = prevStack.filter(s => s.isMinimized);
            const nonMinimized = prevStack.filter(s => !s.isMinimized);
            return [...nonMinimized, newScreen, ...minimized];
        });
    }, []);
    // 2. CERRAR PANTALLA
    const closeScreen = useCallback((id) => {
        setStack(prevStack => prevStack.filter(screen => screen.id !== id));
    }, []);
    // 3. CERRAR PANTALLA SUPERIOR
    const closeTopScreen = useCallback(() => {
        setStack(prevStack => prevStack.slice(0, -1));
    }, []);
    // 4. MINIMIZAR
    const minimizeScreen = useCallback((id) => {
        setStack(prevStack => {
            const updatedStack = prevStack.map(s => s.id === id ? { ...s, isMinimized: true, isMaximized: false } : s);
            // Ordenamos para que la minimizada se vaya al final del array.
            return sortStack(updatedStack);
        });
    }, [sortStack]);
    // 5. RESTAURAR (Desde el dock a pantalla completa)
    const restoreScreen = useCallback((id) => {
        setStack(prevStack => {
            const updatedStack = prevStack.map(s => 
            // Al restaurar, vuelve a estar activa y maximizada (pantalla completa)
            s.id === id ? { ...s, isMinimized: false, isMaximized: true } : s);
            // Asegura que la restaurada suba en la pila
            return sortStack(updatedStack);
        });
    }, [sortStack]);
    // 6. 🟢 NUEVA FUNCIÓN: MAXIMIZAR/RESTAURAR TAMAÑO (Entre 100% y 85% diálogo)
    const toggleMaximizeScreen = useCallback((id) => {
        setStack(prevStack => prevStack.map(s => 
        // Solo si no está minimizada
        s.id === id && !s.isMinimized ? { ...s, isMaximized: !s.isMaximized } : s));
    }, []);
    const contextValue = useMemo(() => ({
        stack,
        openScreen,
        closeScreen,
        closeTopScreen,
        minimizeScreen,
        restoreScreen,
        toggleMaximizeScreen, // 🟢 AÑADIDA al contexto
    }), [stack, openScreen, closeScreen, closeTopScreen, minimizeScreen, restoreScreen, toggleMaximizeScreen]);
    return (_jsx(ScreenContainerContext.Provider, { value: contextValue, children: children }));
};
export default ScreenContainerProvider;
