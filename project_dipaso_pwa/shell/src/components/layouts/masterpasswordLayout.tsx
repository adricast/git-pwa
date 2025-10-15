// 📁 src/components/masterpassword/usemasterpasswordLayout.tsx

import React, { useState, useCallback } from "react";
import { MasterPasswordContext } from "../masterpassword/masterpasswordcontext";
import { FaLock } from "react-icons/fa";
// 🟢 Importar los estilos SCSS
import "../styles/maesterpasswordLayout.sass"; 

const MasterPasswordLayout: React.FC = () => {
 
// 1. Hooks y Contexto (Declarados incondicionalmente)
const context = React.useContext(MasterPasswordContext); 
const [inputKey, setInputKey] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

const processAuthorization = context?.processAuthorization; 
const closeTopAuthorization = context?.closeTopAuthorization;
const authStack = context?.authStack || [];
const topRequest = authStack[0];

const handleProcess = useCallback(async (e: React.FormEvent) => {
e.preventDefault();
setError('');

if (inputKey.trim() === '') {
 setError("Ingrese la clave maestra.");
 return;
}
 
if (!processAuthorization) return; 
 setIsLoading(true);

try {
 const success = await processAuthorization(inputKey); 
 if (!success) {
 setError("Clave maestra incorrecta.");
 setInputKey(''); 
 }
 } catch (err) {
 console.error("Error al procesar la autorización:", err);
 setError("Error interno. Intente de nuevo.");
 } finally {
 setIsLoading(false);
 }
 }, [inputKey, processAuthorization]);


 // 3. Renderizado condicional después de hooks
 if (!context || !topRequest) return null; 


 return (
 // 🟢 Usamos la clase para el fondo y posicionamiento
 <div className="master-key-modal"> 
 // 🟢 Usamos la clase para el diálogo central
 <form className="master-key-dialog" onSubmit={handleProcess}> 
 <FaLock size={30} color="#1d4781" style={{ marginBottom: '15px' }} />
 <h3>{topRequest.title}</h3>
 <p>Se requiere una clave maestra para continuar:</p>
 // 🟢 Usamos la clase para el label
 <label htmlFor="master-key-input">
 Clave de Autorización:
 </label>
 <input
 id="master-key-input"
 type="password"
 value={inputKey}
 onChange={(e) => {
 setInputKey(e.target.value);
 setError('');
}}
 disabled={isLoading}
 required
 // 🟢 Usamos la clase para el input
 className="master-key-input" 
/>

{error && <p className="master-key-error">{error}</p>}

// 🟢 Usamos la clase para el contenedor de acciones
 <div className="master-key-actions"> 
 <button 
 type="button"
 onClick={() => {
 setInputKey('');
 setError('');
 closeTopAuthorization!(); 
 }}
 disabled={isLoading}
 // 🟢 Usamos la clase para el botón de cancelar
 className="btn-cancel" 
 >
 Cancelar
 </button>
 <button 
 type="submit"
 disabled={isLoading || inputKey.trim().length === 0}
 // 🟢 Usamos la clase para el botón de autorizar
 className="btn-authorize" 
 >
 {isLoading ? 'Verificando...' : 'Autorizar'}
 </button>
 </div>
 </form>
 </div>
 );
};

export default MasterPasswordLayout;