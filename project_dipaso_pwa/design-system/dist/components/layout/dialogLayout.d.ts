import React from 'react';
interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    titulo: string;
    children: React.ReactNode;
}
/**
 * Componente de Diálogo (Modal) Reutilizable y Movible.
 */
declare const DialogoReutilizable: React.FC<DialogProps>;
export default DialogoReutilizable;
