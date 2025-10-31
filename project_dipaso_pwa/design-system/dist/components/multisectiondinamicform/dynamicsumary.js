import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// 📁 src/components/multisectiondinamicform/DynamicSummaryDisplay.tsx (Librería - VERSIÓN ACORDEÓN)
import { useState, useCallback } from 'react';
const DynamicSummaryDisplay = ({ sections, confirmationMessage }) => {
    // 🛑 1. ESTADO: Rastrea la sección actualmente abierta (por su índice)
    const [openIndex, setOpenIndex] = useState(0); // Abrir la primera sección por defecto
    // 🛑 2. HANDLER: Alterna el estado de una sección
    const toggleSection = useCallback((index) => {
        setOpenIndex(prevIndex => (prevIndex === index ? null : index));
    }, []);
    return (_jsxs("div", { className: "dynamic-summary-wrapper accordion-mode", children: [_jsx("h3", { className: "summary-main-title", children: "Revisi\u00F3n y Confirmaci\u00F3n Final" }), sections.map((section, index) => {
                const isOpen = openIndex === index;
                return (_jsxs("div", { className: `summary-accordion-item ${isOpen ? 'is-open' : ''}`, children: [_jsxs("div", { className: "summary-accordion-header", onClick: () => toggleSection(index), children: [_jsx("span", { className: "accordion-toggle-icon", style: { transform: isOpen ? 'rotate(90deg)' : 'none' }, children: '>' }), _jsx("h4", { className: "summary-section-title", children: section.title })] }), isOpen && (_jsx("div", { className: "summary-accordion-content", children: _jsx("div", { className: "summary-detail-grid", children: section.items.map((item, itemIndex) => (_jsxs("p", { className: "summary-item", style: item.style, children: [_jsxs("strong", { children: [item.label, ":"] }), " ", item.value] }, itemIndex))) }) }))] }, index));
            }), _jsx("p", { className: "summary-confirmation-text", children: confirmationMessage })] }));
};
export default DynamicSummaryDisplay;
