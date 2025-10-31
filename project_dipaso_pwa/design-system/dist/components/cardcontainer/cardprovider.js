import { jsx as _jsx } from "react/jsx-runtime";
import { CardContext } from './cardcontextdef'; // 💡 Importamos la constante
/**
 * Componente que provee el contexto de cierre de la ficha.
 * Es un componente de React válido para Fast Refresh.
 */
export const CardProvider = ({ children, id, onClose }) => {
    const closeCard = () => {
        onClose(id);
    };
    return (_jsx(CardContext.Provider, { value: { closeCard, cardId: id }, children: children }));
};
export default CardProvider;
