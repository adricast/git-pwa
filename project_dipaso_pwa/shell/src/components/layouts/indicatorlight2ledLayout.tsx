import React, { useState } from "react";

interface IndicatorLightProps {
  status: boolean;   // true = verde, false = rojo
  label: string;     // tooltip
  size?: number;     // tamaño opcional del LED en rem
  onlineColor?: string;
  offlineColor?: string;
}

const IndicatorLightTailwind: React.FC<IndicatorLightProps> = ({
  status,
  label,
  size = 1, // 1rem por defecto
  onlineColor = "#3CB371",
  offlineColor = "#DC143C",
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative inline-block mx-2 cursor-default"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="rounded-full transition-shadow"
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          backgroundColor: status ? onlineColor : offlineColor,
          boxShadow: status
            ? `inset -2px -2px 4px rgba(255,255,255,0.6),
               inset 2px 2px 6px rgba(0,0,0,0.4),
               0 0 8px ${onlineColor}80,
               0 0 12px ${onlineColor}60`
            : `inset -2px -2px 4px rgba(255,255,255,0.6),
               inset 2px 2px 6px rgba(0,0,0,0.4),
               0 0 8px ${offlineColor}80,
               0 0 12px ${offlineColor}60`,
          animation: status ? "none" : "blink 1.2s infinite alternate ease-in-out",
        }}
      />
      {hover && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
          {label}
        </div>
      )}

      <style>
        {`
          @keyframes blink {
            0% { opacity: 1; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </div>
  );
};

export default IndicatorLightTailwind;
