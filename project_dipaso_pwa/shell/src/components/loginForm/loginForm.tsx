// src/components/LoginForm.tsx (o donde lo tengas)
import React, { useState, useCallback } from "react";
import { FaFingerprint, FaKey, FaUserLock, FaArrowLeft, FaSpinner } from "react-icons/fa";
import "./../styles/loginForm.scss"; 

// --- Tipado ---
interface LoginResult {
  success: boolean;
  user?: any;
  message?: string;
}

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<LoginResult>;
  imageSrc?: string; 
  // Opcional: para decidir si mostramos la pantalla de selección de método.
  // Por defecto, asumimos que solo se usa el método de Contraseña.
  showMethodSelection?: boolean; 
}

type LoginMethod = "password" | "fingerprint" | "otp";
type MessageType = "success" | "error" | "info";

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  imageSrc, 
  showMethodSelection = false // Valor por defecto
}) => {
  const [selectedMethod, setSelectedMethod] = useState<LoginMethod>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("info");

  // Si no se muestran más métodos, el valor inicial es 'password'.
  const [isMethodSelectionVisible, setIsMethodSelectionVisible] = useState(showMethodSelection);

  // Usa useCallback para memoizar la función y evitar recreaciones innecesarias
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedMethod !== "password") return; // Solo permite login con contraseña por ahora

    setIsLoading(true);
    setMessage("");

    try {
      const result = await onLogin(username, password);
      if (result.success) {
        setMessage("✅ ¡Inicio de sesión exitoso!");
        setMessageType("success");
        // Opcional: limpiar campos tras éxito
        // setUsername('');
        // setPassword('');
      } else {
        setMessage(result.message || "❌ Usuario o contraseña incorrectos.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error de login:", error);
      setMessage("⚠️ Error inesperado al intentar iniciar sesión.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [onLogin, username, password, selectedMethod]);


  const handleMethodSelect = (method: LoginMethod) => {
    // Si la selección de método está activa, se navega a la contraseña
    if (isMethodSelectionVisible) {
      setSelectedMethod(method);
      setIsMethodSelectionVisible(false);
      setMessage(""); // Limpiar mensaje al cambiar de vista
    } else {
      // Caso en el que la selección está desactivada por defecto, pero se pulsa
      // un método si decides habilitar esto más adelante.
      setSelectedMethod(method);
    }
  }

  const handleGoBack = () => {
    setIsMethodSelectionVisible(true);
    setSelectedMethod("password");
    setMessage("");
  }


  return (
    <div className="login-container">
      {/* Imagen opcional - Contenedor a la izquierda */}
      {imageSrc && (
        <div className="login-image">
          <img src={imageSrc} alt="Decoración de inicio de sesión" />
        </div>
      )}

      {/* Caja principal del formulario */}
      <div className="login-box">
        <h2 className="login-title">Acceso al Sistema</h2>
        
        {isMethodSelectionVisible ? (
          <>
            <p className="login-subtitle">Selecciona tu método de autenticación</p>
            <div className="method-grid">
              {/* Método Huella - Deshabilitado */}
              <div className="method-card disabled" title="Próximamente">
                <FaFingerprint size={28} />
                <span>Huella Dactilar</span>
                <small>No disponible</small>
              </div>

              {/* Método Contraseña - Habilitado */}
              <div
                className={`method-card ${selectedMethod === "password" ? "active" : ""}`}
                onClick={() => handleMethodSelect("password")}
              >
                <FaKey size={28} />
                <span>Contraseña</span>
                <small>Habilitado</small>
              </div>

              {/* Método PIN / OTP - Deshabilitado */}
              <div className="method-card disabled" title="Próximamente">
                <FaUserLock size={28} />
                <span>PIN / OTP</span>
                <small>No disponible</small>
              </div>
            </div>
          </>
        ) : (
          <div className="form-section">
            {/* Botón de volver solo si se permite la selección de métodos */}
            {showMethodSelection && (
                <button
                type="button"
                className="back-btn"
                onClick={handleGoBack}
                >
                <FaArrowLeft /> Volver a métodos
                </button>
            )}

            <p className="login-subtitle">Introduce tus credenciales</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nombre de usuario o Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  aria-label="Nombre de usuario"
                />
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Contraseña"
                />
              </div>
              
              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <FaSpinner className="spinner" /> Cargando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Mensaje de estado (éxito/error) */}
        {message && <div className={`message ${messageType}`}>{message}</div>}
      </div>
    </div>
  );
};

export default LoginForm;