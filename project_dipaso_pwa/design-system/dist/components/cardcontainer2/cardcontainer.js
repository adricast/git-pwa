import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaTimes } from 'react-icons/fa';
import { CardProvider } from './cardprovider';
//import './../../styles/cardcontainer2Layout.sass';
const CardContainer = ({ id, children, title, className = '', onClose, 
// 🔑 AÑADIDO: Destructurar la nueva prop con valor por defecto
hideHeader = false, }) => {
    // Función de cierre para el botón de la cabecera
    const handleClose = (e) => {
        e.stopPropagation();
        onClose(id);
    };
    return (
    // 🎯 Envuelve el contenido con el Provider para dar acceso a closeCard()
    _jsx(CardProvider, { id: id, onClose: onClose, children: _jsxs("div", { className: `card-container ${className} ${hideHeader ? 'content-only' : ''}`, children: [!hideHeader && (_jsxs("div", { className: "card-header", children: [title && _jsx("h3", { className: "card-title", children: title }), _jsx("button", { className: "card-close-btn", onClick: handleClose, "aria-label": `Close card ${title || id}`, children: _jsx(FaTimes, {}) })] })), _jsx("div", { className: "card-content", children: children })] }) }));
};
export default CardContainer;
