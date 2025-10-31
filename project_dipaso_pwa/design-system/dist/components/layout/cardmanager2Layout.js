import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/CardManager/cardmanagerLayout.tsx (MODIFICADO)
import { useState, useCallback /*, useMemo*/ } from 'react';
import { v4 as uuidv4 } from 'uuid';
// 🔑 NECESARIO para el botón de cerrar en la pestaña
import { FaTimes } from 'react-icons/fa';
import { CardManagerProvider } from '../cardcontainer2/cardmanagerprovider';
import CardContainer from '../cardcontainer2/cardcontainer';
//import './../../styles/cardmanager2Layout.sass';
// ... (Componentes de ejemplo/usoMemo - omitido por brevedad en este snippet)
const CardManager = ({ children }) => {
    const [fichas, setFichas] = useState([]);
    // 🔑 ESTADO CLAVE: ID de la ficha activa. Inicialmente null.
    const [activeCardId, setActiveCardId] = useState(null);
    // Busca la ficha activa para renderizar su contenido
    const activeFicha = fichas.find(f => f.id === activeCardId);
    // A. AGREGAR FICHA (ADD) - Modificada para manejar activeCardId
    const handleAddCard = useCallback((title, contentComponent, customId, onCloseCallback) => {
        const newId = customId || uuidv4();
        setFichas(prev => {
            // Si la ficha ya está abierta, solo la activamos
            if (prev.some(f => f.id === newId)) {
                setActiveCardId(newId);
                return prev;
            }
            const nuevaFicha = {
                id: newId,
                title: title,
                contentComponent: contentComponent,
                onCloseCallback: onCloseCallback,
            };
            // 🎯 CLAVE: Hace la nueva ficha la activa
            setActiveCardId(newId);
            return [...prev, nuevaFicha];
        });
    }, []);
    // B. CERRAR FICHA (REMOVE/CLOSE) - Modificada para manejar activeCardId
    const handleCloseCard = useCallback((id) => {
        setFichas(prevFichas => {
            const indexToClose = prevFichas.findIndex(f => f.id === id);
            if (indexToClose === -1)
                return prevFichas;
            const fichaCerrada = prevFichas[indexToClose];
            fichaCerrada.onCloseCallback?.();
            const newFichas = prevFichas.filter(f => f.id !== id);
            // 🎯 LÓGICA CLAVE: Si la ficha cerrada era la activa, seleccionar la siguiente.
            if (activeCardId === id) {
                // Intenta activar la ficha a la derecha, o la de la izquierda, o null.
                const nextFicha = newFichas[indexToClose] || newFichas[indexToClose - 1] || null;
                setActiveCardId(nextFicha ? nextFicha.id : null);
            }
            return newFichas;
        });
    }, [activeCardId]); // activeCardId es una dependencia para la lógica de selección
    // C. ACTUALIZAR FICHA (UPDATE) - Aseguramos que se active al actualizar
    const handleUpdateCard = useCallback((id, title, contentComponent) => {
        setFichas(prev => prev.map(ficha => ficha.id === id ? { ...ficha, title, contentComponent } : ficha));
        // Activamos la ficha al actualizar
        setActiveCardId(id);
    }, []);
    // D. VERIFICAR FICHA ABIERTA (IS OPEN)
    const isCardOpen = useCallback((id) => {
        return fichas.some(ficha => ficha.id === id);
    }, [fichas]);
    return (_jsx(CardManagerProvider, { addCardFunction: handleAddCard, updateCardFunction: handleUpdateCard, isCardOpenFunction: isCardOpen, removeCardFunction: handleCloseCard, children: _jsxs("div", { className: "card-manager-container", children: [children, fichas.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "tab-list-bar", children: fichas.map(ficha => (_jsxs("div", { className: `ficha-tab ${ficha.id === activeCardId ? 'active' : ''}`, onClick: () => setActiveCardId(ficha.id), children: [_jsx("span", { className: "ficha-title", children: ficha.title }), _jsx("button", { className: "ficha-close-btn", 
                                        // 🔑 CLAVE: Detener la propagación para que el click no active la pestaña
                                        onClick: (e) => { e.stopPropagation(); handleCloseCard(ficha.id); }, children: _jsx(FaTimes, {}) })] }, ficha.id))) }), _jsx("div", { className: "tab-content-panel", children: activeFicha && (_jsx(CardContainer, { id: activeFicha.id, title: activeFicha.title, onClose: handleCloseCard, 
                                // 🔑 CLAVE: Indicar al contenedor que oculte su cabecera interna
                                hideHeader: true, className: "active-tab-content", children: activeFicha.contentComponent }, activeFicha.id)) })] }))] }) }));
};
export default CardManager;
