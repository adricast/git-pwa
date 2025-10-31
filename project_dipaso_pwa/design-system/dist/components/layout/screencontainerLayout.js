import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useScreenContainer } from "./../screencontainer/usescreencontainer";
//import "./../../styles/screencontainerLayout.sass";
// 🟢 Constante para el ancho de la barra minimizada + margen
const DOCK_WIDTH = 260;
const ScreenContainerLayout = () => {
    // ... (otras variables y hook)
    const { stack, closeScreen, minimizeScreen, restoreScreen, toggleMaximizeScreen } = useScreenContainer();
    if (stack.length === 0)
        return null;
    // 1. Identificar la pantalla superior activa (la última que NO esté minimizada)
    const activeScreen = stack.slice().reverse().find(item => !item.isMinimized);
    // 2. Identificar las pantallas minimizadas
    const minimizedScreens = stack.filter(item => item.isMinimized);
    // Función que renderiza la estructura de una sola pantalla
    const renderScreen = (item, isTop, indexInMinimized) => {
        // Lógica de Minimizar/Restaurar
        const handleMinimizeRestore = item.isMinimized
            ? () => restoreScreen(item.id) // 🟢 Si está minimizado, RESTAURAR
            : () => minimizeScreen(item.id); // 🟢 Si no, MINIMIZAR
        const minimizeRestoreIcon = item.isMinimized ? "🗖" : "―";
        // Lógica de Maximizar/Restaurar
        const handleMaximizeRestore = () => toggleMaximizeScreen(item.id);
        const maximizeRestoreIcon = item.isMaximized ? "❐" : "🗗";
        // 🟢 LÓGICA CLAVE para la clase y el botón de Maximizar
        const isCurrentlyMaximized = !item.isMinimized && item.isMaximized;
        const additionalStyles = {};
        if (item.isMinimized && indexInMinimized !== undefined) {
            additionalStyles.transform = `translateX(${indexInMinimized * DOCK_WIDTH}px)`;
            additionalStyles.zIndex = 10 + indexInMinimized;
        }
        const activeZIndex = 1000 + stack.indexOf(item);
        const combinedStyle = {
            zIndex: item.isMinimized ? additionalStyles.zIndex : activeZIndex,
            ...(item.isMinimized ? additionalStyles : {})
        };
        return (_jsxs("div", { className: `screen-container 
                    ${item.isMinimized ? 'is-minimized' : ''} 
                    ${isCurrentlyMaximized ? 'is-maximized' : ''} 
                    ${isTop && !item.isMinimized ? 'is-active' : 'is-stacked'}
                `, style: combinedStyle, children: [_jsxs("header", { className: "screen-header", 
                    // Doble clic para cambiar entre Maximizado y Normal
                    onDoubleClick: item.isMinimized ? () => restoreScreen(item.id) : handleMaximizeRestore, children: [_jsx("h2", { className: "screen-title", style: { cursor: item.isMinimized ? 'pointer' : 'default' }, onClick: item.isMinimized ? () => restoreScreen(item.id) : undefined, children: item.title }), _jsxs("div", { className: "screen-actions", children: [_jsx("button", { className: "screen-maximize-btn", "aria-label": isCurrentlyMaximized ? "Restaurar tamaño" : "Maximizar pantalla", onClick: handleMaximizeRestore, 
                                    // 🟢 DESHABILITADO solo si está minimizado
                                    disabled: item.isMinimized, children: maximizeRestoreIcon }), _jsx("button", { className: "screen-minimize-btn", "aria-label": item.isMinimized ? "Restaurar pantalla" : "Minimizar pantalla", onClick: handleMinimizeRestore, 
                                    // 🟢 HABILITADO siempre, excepto si está en modo RESTAURADO (no maximizado)
                                    disabled: !item.isMinimized && !item.isMaximized, children: minimizeRestoreIcon }), _jsx("button", { className: "screen-close-btn", "aria-label": "Cerrar pantalla", onClick: () => closeScreen(item.id), children: "\u2715" })] })] }), !item.isMinimized && _jsx("div", { className: "screen-body", children: item.content })] }, item.id));
    };
    return (_jsxs(_Fragment, { children: [stack
                .filter(item => !item.isMinimized)
                .map((item) => renderScreen(item, item.id === activeScreen?.id)), minimizedScreens.map((item, index) => renderScreen(item, false, index))] }));
};
export default ScreenContainerLayout;
