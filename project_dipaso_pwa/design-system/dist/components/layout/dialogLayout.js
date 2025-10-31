import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
/**
 * Componente de Diálogo (Modal) Reutilizable y Movible.
 */
const DialogoReutilizable = ({ isOpen, onClose, titulo, children }) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const handleMouseMove = useCallback((e) => {
        if (!isDragging)
            return;
        setPos({
            x: e.clientX - dragStartPos.current.x,
            y: e.clientY - dragStartPos.current.y
        });
    }, [isDragging]);
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
        }
        else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'auto';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'auto';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    if (!isOpen)
        return null;
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartPos.current.x = e.clientX - pos.x;
        dragStartPos.current.y = e.clientY - pos.y;
    };
    return (_jsx("div", { className: "overlay", children: _jsxs("div", { className: "dialogoContenido", style: {
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                cursor: isDragging ? 'grabbing' : 'auto'
            }, children: [_jsxs("div", { className: "dialogoEncabezado", onMouseDown: handleMouseDown, children: [_jsx("h2", { children: titulo }), _jsx("button", { onClick: onClose, className: "cerrarBoton", children: "\u00D7" })] }), _jsx("div", { className: "dialogo-contenido", children: children })] }) }));
};
export default DialogoReutilizable;
