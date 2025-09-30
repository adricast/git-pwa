import React, { useState, useEffect } from "react";
import type { Group } from "../../models/api/groupModel";
import "./../styles/addeditgroup.scss"; // 👈 Importamos el SCSS

/**
 * Formulario de creación / edición de grupos
 */
const AddEditGroupContent: React.FC<{
  group: Group | null;
  // 🔑 CORRECCIÓN: La prop onSave ahora acepta 3 argumentos, incluyendo el grupo actual.
  onSave: (group: Group | null, groupName: string, description: string) => void; 
  onClose: () => void;
}> = ({ group, onSave, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  const isFormValid = groupName.trim().length > 0;

  useEffect(() => {
    if (group) {
      setGroupName(group.groupName);
      setDescription(group.description || "");
    } else {
      setGroupName("");
      setDescription("");
    }
  }, [group]);

  const handleSave = () => {
    if (isFormValid) {
      // 🔑 CORRECCIÓN: Pasamos el objeto 'group' (que es null si es creación)
      onSave(group, groupName.trim(), description.trim()); 
    }
  };

  return (
    <form
      className="group-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <h3 className="group-form__title">
        {group ? "Editar Grupo" : "Crear Nuevo Grupo"}
      </h3>

      <label className="group-form__label" htmlFor="groupName">
        Nombre del Grupo
      </label>
      <input
        id="groupName"
        className="group-form__input"
        placeholder="Nombre del grupo (Obligatorio)"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <label className="group-form__label" htmlFor="description">
        Descripción
      </label>
      <textarea
        id="description"
        className="group-form__textarea"
        placeholder="Descripción (Opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="group-form__actions">
        <button
          type="button"
          className="group-form__button group-form__button--secondary"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`group-form__button group-form__button--primary ${
            !isFormValid ? "group-form__button--disabled" : ""
          }`}
          disabled={!isFormValid}
        >
          {group ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
};

export default AddEditGroupContent;