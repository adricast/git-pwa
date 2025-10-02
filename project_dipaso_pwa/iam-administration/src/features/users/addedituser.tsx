import React, { useState, useEffect } from "react";
// 🟢 Importamos el tipo User
import type { User } from "../../models/api/userModel"; 
import "./../styles/addeditgroup.scss"; 
// ⚠️ Nota: Si no tienes una interfaz 'Group' en el proyecto, esto puede ser un error de importación.
// Asumimos que la lógica solo debe usar 'User' en este archivo.

/**
 * Formulario de creación / edición de usuarios
 * NOTA: El componente ha sido renombrado internamente a AddEditUserContent.
 */
const AddEditUserContent: React.FC<{
  // ✅ FIX 1: Cambiamos 'group' a 'user'
  user: User | null; 
  // ✅ FIX 2: Nueva firma para onSave (4 argumentos)
  onSave: (user: User | null, username: string, identification: string, email: string) => Promise<void>; 
  onClose: () => void;
// ✅ FIX 3: Desestructuramos 'user' en lugar de 'group'
}> = ({ user, onSave, onClose }) => { 
  // ✅ FIX 4: Cambiamos estados a campos de usuario
  const [username, setUsername] = useState("");
  const [identification, setIdentification] = useState("");
  const [email, setEmail] = useState("");

  // ✅ FIX 5: La validación requiere que todos los campos de usuario estén llenos
  const isFormValid = username.trim().length > 0 && identification.trim().length > 0 && email.trim().length > 0;

  useEffect(() => {
    // ✅ FIX 6: Cargamos datos de 'user' si existe
    if (user) {
      setUsername(user.username);
      setIdentification(user.identification);
      setEmail(user.email);
    } else {
      setUsername("");
      setIdentification("");
      setEmail("");
    }
  }, [user]);

  const handleSave = () => {
    if (isFormValid) {
      // ✅ FIX 7: Pasamos los 4 argumentos del usuario
      onSave(user, username.trim(), identification.trim(), email.trim()); 
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
        {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
      </h3>
      
      {/* ------------------------------------------- */}
      {/* 🟢 Campo: Nombre de Usuario (username) */}
      {/* ------------------------------------------- */}
      <label className="group-form__label" htmlFor="username">
        Nombre de Usuario
      </label>
      <input
        id="username"
        className="group-form__input"
        placeholder="Nombre de usuario (Obligatorio)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* ------------------------------------------- */}
      {/* 🟢 Campo: Identificación (identification) */}
      {/* ------------------------------------------- */}
      <label className="group-form__label" htmlFor="identification">
        Identificación
      </label>
      <input
        id="identification"
        className="group-form__input"
        placeholder="Identificación (Obligatorio)"
        value={identification}
        onChange={(e) => setIdentification(e.target.value)}
      />

      {/* ------------------------------------------- */}
      {/* 🟢 Campo: Correo Electrónico (email) */}
      {/* ------------------------------------------- */}
      <label className="group-form__label" htmlFor="email">
        Correo Electrónico
      </label>
      <input
        id="email"
        type="email"
        className="group-form__input"
        placeholder="Correo electrónico (Obligatorio)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
          {user ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
};

// ⚠️ Nota: Renombra la exportación por defecto para reflejar el contenido.
export default AddEditUserContent;