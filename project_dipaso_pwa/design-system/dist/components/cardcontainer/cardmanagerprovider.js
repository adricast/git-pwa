import { jsx as _jsx } from "react/jsx-runtime";
import { CardManagerContext } from './cardmanagercontextdef'; // Importamos la constante
/**
 * Componente que provee el Contexto de Gestión (Add, Update, Check).
 */
export const CardManagerProvider = ({ children, addCardFunction, updateCardFunction, isCardOpenFunction, 
// 🔑 CORRECCIÓN: Destructuramos la nueva prop.
removeCardFunction }) => {
    return (_jsx(CardManagerContext.Provider, { value: {
            addCard: addCardFunction,
            updateCard: updateCardFunction,
            isCardOpen: isCardOpenFunction,
            // 🔑 CORRECCIÓN: Incluimos removeCard en el objeto 'value'
            removeCard: removeCardFunction,
        }, children: children }));
};
export default CardManagerProvider;
