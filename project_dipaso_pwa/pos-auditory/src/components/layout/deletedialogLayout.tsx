import React from "react";

// Definición de la interfaz de props reusable
interface ReusableDeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  // Permitimos que onConfirm sea asíncrono o síncrono
  onConfirm: () => Promise<void> | void; 
  // El ítem es genérico, solo necesitamos saber cómo obtener su nombre
  item: any | null; 
  itemsCount: number;

  // Propiedades para reusabilidad
  entityName: string; // Ej: "grupo", "usuario"
  itemNameKey: string; // Ej: "groupName", "userName"
  actionType?: string; // Ej: "eliminar lógicamente", "eliminar permanentemente"
}

const DeleteConfirmationDialog: React.FC<ReusableDeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  item,
  itemsCount,
  entityName,
  itemNameKey,
  // Establecemos un valor por defecto para el tipo de acción
  actionType = "eliminar lógicamente", 
}) => {
  if (!open) return null;

  let message = "";
  let itemTitle = "";
  
  // 1. Obtenemos el título del ítem, usando la llave dinámica
  if (item && item[itemNameKey]) {
    itemTitle = item[itemNameKey];
  }
  
  // 2. Definimos el título y mensaje dinámicamente

  if (itemsCount > 1) {
    // Manejo simple de plural (funciona para "grupo" -> "grupos")
    const entityPlural = entityName.endsWith('o') ? `${entityName}s` : `${entityName}es`; 
    
    // Caso de eliminación masiva
    message = `¿Está seguro de que desea ${actionType} ${itemsCount} ${entityPlural} seleccionados?`;
  } else if (itemTitle) {
    // Caso de eliminación individual
    message = `¿Está seguro de que desea ${actionType} el ${entityName} "${itemTitle}"?`;
  } else {
    // Fallback
    message = `¿Está seguro de que desea ${actionType} este ${entityName}?`;
  }
  
  // Capitalizamos la primera letra del actionType para el título
  const titleAction = actionType.charAt(0).toUpperCase() + actionType.slice(1);
  const title = itemsCount > 1 ? "Confirmar Acción Masiva" : `Confirmar ${titleAction}`;


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            // El texto del botón cambia dependiendo de la acción
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;