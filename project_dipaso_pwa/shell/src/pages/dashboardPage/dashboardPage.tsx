import React, { useEffect, useState } from "react"; 
import { useOutletContext } from "react-router-dom";
import "./dashboardPage.sass";

interface DashboardContext {
  userName: string;
  selectedBranch: string;
  branches: { id: string; name: string }[];
}

const DashboardHome: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { userName, selectedBranch, branches } = useOutletContext<DashboardContext>();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="dashboard-grid">
      {/* Widget Usuario */}
      <div className="widget widget-user">
        <img
          src="https://www.dropbox.com/scl/fi/1sg0k9814ewulaq4xz97b/desarrollomovil2.png?rlkey=37j08p3etwo0ncgy2nt8jxv11&raw=1"
          alt="Usuario"
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/70")}
        />
        <div className="username">Usuario: {userName}</div>
        <div className="role">Rol: Supervisor</div>
      </div>

      {/* Widget Empresa */}
      <div className="widget widget-company">
        <h2>Empresa Seleccionada</h2>
        <img
          src="https://www.dropbox.com/scl/fi/1jdub47m018ltwb5bbwak/icon-512x512.png?rlkey=cqgrkq5a000yjn0d6rndcqw0y&raw=1"
          alt="Logo Empresa"
        />
        <div className="company-name">Dipaso</div>
        <div className="branch">
          Sucursal: {branches.find((b) => b.id === selectedBranch)?.name || "Desconocida"}
        </div>
      </div>

      {/* Widget Reloj */}
      <div className="widget widget-clock">
        <div className="clock">
          <div className="hand-hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
          <div className="hand-minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
          <div className="hand-second" style={{ transform: `rotate(${secondDeg}deg)` }} />
          <div className="center-dot" />
        </div>
        <div className="time">{time.toLocaleTimeString("es-EC", { hour12: false })}</div>
        <div className="date">{time.toLocaleDateString("es-EC")}</div>
      </div>

      {/* Widget Otro */}
      <div className="widget widget-other">
        <h2>Otro Widget</h2>
        <p>Contenido de ejemplo.</p>
      </div>
    </div>
  );
};

export default DashboardHome;
