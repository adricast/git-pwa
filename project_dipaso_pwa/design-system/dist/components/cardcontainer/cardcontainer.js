import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaTimes } from 'react-icons/fa';
import { CardProvider } from './cardprovider';
//import './../../styles/components/cardcontainerLayout.sass';
const CardContainer = ({ id, children, title, className = '', onClose, }) => {
    // Función de cierre para el botón de la cabecera
    const handleClose = (e) => {
        e.stopPropagation();
        onClose(id);
    };
    return (_jsx(CardProvider, { id: id, onClose: onClose, children: _jsxs("div", { className: `card-container ${className}`, children: [_jsxs("div", { className: "card-header", children: [title && _jsx("h3", { className: "card-title", children: title }), _jsx("button", { className: "card-close-btn", onClick: handleClose, "aria-label": `Close card ${title || id}`, children: _jsx(FaTimes, {}) })] }), _jsx("div", { className: "card-content", children: children })] }) }));
};
export default CardContainer;
