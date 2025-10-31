import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/CardManager/CardManager.tsx (FINAL CORREGIDO)
import { useState, useCallback, /*useMemo*/ } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CardManagerProvider } from '../cardcontainer/cardmanagerprovider';
import CardContainer from '../cardcontainer/cardcontainer';
//import './../../styles/cardmanagerLayout.sass';
// Componentes de ejemplo (Se definirían en archivos separados)
//const ComponenteA = () => <div>Contenido A (Formulario de Pedido)</div>;
//const ComponenteB = () => <div>Contenido B (Gráfico de Ventas)</div>;
// 🎯 CORRECCIÓN CLAVE: Definir el componente para que acepte la prop 'children'
const CardManager = ({ children }) => {
    // Estado principal: Un array de las fichas que están abiertas
    const [fichas, setFichas] = useState([]);
    //  Restauramos el useMemo comentado para que los botones de prueba funcionen si se descomentan
    //const nextId = useMemo(() => fichas.length + 1, [fichas]);
    // --------------------------------------------------------
    // 1. FUNCIONALIDADES DEL GESTOR (Implementación de CardManagerContextType)
    // --------------------------------------------------------
    // A. AGREGAR FICHA (ADD) - 🔑 CORREGIDA
    // Firma: (title, content, customId?, onCloseCallback?)
    const handleAddCard = useCallback((title, contentComponent, customId, 
    // 🔑 NUEVO ARGUMENTO: El callback de cierre
    onCloseCallback) => {
        const newFicha = {
            // USAR el ID personalizado (string|number) o generar uno aleatorio (string)
            id: customId || uuidv4(),
            title: title,
            contentComponent: contentComponent,
            onCloseCallback: onCloseCallback, // 🔑 Almacenamos el callback
        };
        // Simple append. La lógica de 'update si ya existe' debería estar en el componente que lo llama.
        setFichas(prev => [...prev, newFicha]);
    }, []);
    // B. CERRAR FICHA (REMOVE/CLOSE) - 🔑 CORREGIDA
    // Implementación de la lógica de remoción. Se pasa a CardManagerProvider como removeCardFunction.
    const handleCloseCard = useCallback((id) => {
        // 1. Buscamos la ficha para obtener el callback
        const fichaToClose = fichas.find(ficha => ficha.id === id);
        // 2. 🔑 Ejecutar el callback (navigate(-1)) si existe
        if (fichaToClose && fichaToClose.onCloseCallback) {
            fichaToClose.onCloseCallback();
        }
        // 3. Remover la ficha del estado
        setFichas(prev => prev.filter(ficha => ficha.id !== id));
    }, [fichas]); // Dependencia necesaria para buscar la ficha
    // C. ACTUALIZAR FICHA (UPDATE)
    // Firma: (id, title, content) - Compatible con groupuserLayout.tsx
    const handleUpdateCard = useCallback((id, title, contentComponent) => {
        setFichas(prev => prev.map(ficha => ficha.id === id ? { ...ficha, title, contentComponent } : ficha));
    }, []);
    // D. VERIFICAR FICHA ABIERTA (IS OPEN)
    const isCardOpen = useCallback((id) => {
        return fichas.some(ficha => ficha.id === id);
    }, [fichas]);
    return (
    // 1. PROVEEMOS EL CONTEXTO: Pasamos las CUATRO funciones.
    _jsx(CardManagerProvider, { addCardFunction: handleAddCard, updateCardFunction: handleUpdateCard, isCardOpenFunction: isCardOpen, 
        // Incluimos la función de remoción.
        removeCardFunction: handleCloseCard, children: _jsxs("div", { className: "card-manager-container", children: [children, _jsx("div", { className: "card-grid", children: fichas.map(ficha => (_jsx(CardContainer, { id: ficha.id, title: ficha.title, 
                        // Pasamos la función de cierre a cada contenedor
                        onClose: handleCloseCard, children: ficha.contentComponent }, ficha.id))) })] }) }));
};
export default CardManager;
