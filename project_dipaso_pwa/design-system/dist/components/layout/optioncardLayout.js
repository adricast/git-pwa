import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const OptionCard = ({ label, icon, color = "#E5E7EB", hoverColor, textColor = "#000000", iconColor = "#000000", size = 150, onClick, disabled = false, }) => {
    // si no se pasa hoverColor, hacemos uno más oscuro automáticamente
    const computedHoverColor = hoverColor || color + "CC"; // simple overlay
    return (_jsxs("button", { className: `option-card ${disabled ? "disabled" : ""}`, style: {
            width: size,
            height: size,
            "--card-bg": color,
            "--card-bg-hover": computedHoverColor,
            "--card-text": textColor,
            "--icon-color": iconColor,
        }, onClick: disabled ? undefined : onClick, disabled: disabled, children: [_jsx("div", { className: "icon", children: icon }), size >= 40 && _jsx("div", { className: "label", children: label })] }));
};
export default OptionCard;
