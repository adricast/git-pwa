import React from "react";
import "./../styles/optioncardLayout.sass";

interface OptionCardProps {
  label: string;
  icon: React.ReactNode;
  color?: string;       // fondo
  hoverColor?: string;  // fondo al hover
  textColor?: string;   // color del label
  iconColor?: string;   // color del icono
  size?: number;        // tamaño del card
  onClick?: () => void;
  disabled?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  label,
  icon,
  color = "#E5E7EB",
  hoverColor,
  textColor = "#000000",
  iconColor = "#000000",
  size = 150,
  onClick,
  disabled = false,
}) => {
  // si no se pasa hoverColor, hacemos uno más oscuro automáticamente
  const computedHoverColor = hoverColor || color + "CC"; // simple overlay

  return (
    <button
      className={`option-card ${disabled ? "disabled" : ""}`}
      style={{
        width: size,
        height: size,
        "--card-bg": color,
        "--card-bg-hover": computedHoverColor,
        "--card-text": textColor,
        "--icon-color": iconColor,
      } as React.CSSProperties}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="icon">{icon}</div>
      {size >= 40 && <div className="label">{label}</div>}
    </button>
  );
};

export default OptionCard;
