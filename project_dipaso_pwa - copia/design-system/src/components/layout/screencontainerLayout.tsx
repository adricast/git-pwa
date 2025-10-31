import React, { type CSSProperties } from "react"; 
import { useScreenContainer } from "./../screencontainer/usescreencontainer";
//import "./../../styles/screencontainerLayout.sass";

// 🟢 Constante para el ancho de la barra minimizada + margen
const DOCK_WIDTH = 260; 

const ScreenContainerLayout: React.FC = () => {
    // ... (otras variables y hook)
    const { stack, closeScreen, minimizeScreen, restoreScreen, toggleMaximizeScreen } = useScreenContainer();

    if (stack.length === 0) return null;

    // 1. Identificar la pantalla superior activa (la última que NO esté minimizada)
    const activeScreen = stack.slice().reverse().find(item => !item.isMinimized);

    // 2. Identificar las pantallas minimizadas
    const minimizedScreens = stack.filter(item => item.isMinimized);
    
    // Función que renderiza la estructura de una sola pantalla
    const renderScreen = (item: typeof stack[0], isTop: boolean, indexInMinimized?: number) => {
        
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

        const additionalStyles: CSSProperties = {};

        if (item.isMinimized && indexInMinimized !== undefined) {
            additionalStyles.transform = `translateX(${indexInMinimized * DOCK_WIDTH}px)`; 
            additionalStyles.zIndex = 10 + indexInMinimized; 
        }

        const activeZIndex = 1000 + stack.indexOf(item);

        const combinedStyle: CSSProperties = {
            zIndex: item.isMinimized ? additionalStyles.zIndex : activeZIndex,
            ...(item.isMinimized ? additionalStyles : {}) 
        };

        return (
            <div
                key={item.id}
                className={`screen-container 
                    ${item.isMinimized ? 'is-minimized' : ''} 
                    ${isCurrentlyMaximized ? 'is-maximized' : ''} 
                    ${isTop && !item.isMinimized ? 'is-active' : 'is-stacked'}
                `}
                style={combinedStyle} 
            >
                <header 
                    className="screen-header"
                    // Doble clic para cambiar entre Maximizado y Normal
                    onDoubleClick={item.isMinimized ? () => restoreScreen(item.id) : handleMaximizeRestore} 
                >
                    <h2 
                        className="screen-title" 
                        style={{ cursor: item.isMinimized ? 'pointer' : 'default' }}
                        onClick={item.isMinimized ? () => restoreScreen(item.id) : undefined}
                    >
                        {item.title}
                    </h2>
                    <div className="screen-actions">
                        {/* 🟢 Botón MAXIMIZAR/RESTAURAR */}
                        <button
                            className="screen-maximize-btn"
                            aria-label={isCurrentlyMaximized ? "Restaurar tamaño" : "Maximizar pantalla"}
                            onClick={handleMaximizeRestore}
                            // 🟢 DESHABILITADO solo si está minimizado
                            disabled={item.isMinimized} 
                        >
                            {maximizeRestoreIcon}
                        </button>
                        
                        {/* 🟢 Botón MINIMIZAR/RESTAURAR (El que estaba fallando) */}
                        <button
                            className="screen-minimize-btn"
                            aria-label={item.isMinimized ? "Restaurar pantalla" : "Minimizar pantalla"}
                            onClick={handleMinimizeRestore}
                            // 🟢 HABILITADO siempre, excepto si está en modo RESTAURADO (no maximizado)
                            disabled={!item.isMinimized && !item.isMaximized}
                        >
                            {minimizeRestoreIcon}
                        </button>
                        <button
                            className="screen-close-btn"
                            aria-label="Cerrar pantalla"
                            onClick={() => closeScreen(item.id)}
                        >
                            ✕
                        </button>
                    </div>
                </header>
                
                {/* El cuerpo se muestra solo si NO está minimizado */}
                {!item.isMinimized && <div className="screen-body">{item.content}</div>}
            </div>
        );
    };

    return (
        <>
            {/* 1. Renderizar pantallas NO minimizadas */}
            {stack
                .filter(item => !item.isMinimized)
                .map((item) => 
                    renderScreen(item, item.id === activeScreen?.id)
                )
            }

            {/* 2. Renderizar las pantallas minimizadas */}
            {minimizedScreens.map((item, index) => 
                renderScreen(item, false, index)
            )}
        </>
    );
};

export default ScreenContainerLayout;