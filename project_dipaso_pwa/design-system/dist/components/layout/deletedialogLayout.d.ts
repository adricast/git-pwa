import React from "react";
interface ReusableDeleteConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    item: any | null;
    itemsCount: number;
    entityName: string;
    itemNameKey: string;
    actionType?: string;
}
declare const DeleteConfirmationDialog: React.FC<ReusableDeleteConfirmationDialogProps>;
export default DeleteConfirmationDialog;
