// 📁 src/components/multisectiondinamicform/DynamicSummaryDisplay.tsx (Librería - VERSIÓN ACORDEÓN)

import React, { useState, useCallback } from 'react';
import type { DynamicSummaryDisplayProps } from './interface'; 
import type { SummarySectionData } from './interface'; 

const DynamicSummaryDisplay: React.FC<DynamicSummaryDisplayProps> = ({ sections, confirmationMessage }) => {

    // 🛑 1. ESTADO: Rastrea la sección actualmente abierta (por su índice)
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Abrir la primera sección por defecto

    // 🛑 2. HANDLER: Alterna el estado de una sección
    const toggleSection = useCallback((index: number) => {
        setOpenIndex(prevIndex => (prevIndex === index ? null : index));
    }, []);

    return (
        <div className="dynamic-summary-wrapper accordion-mode">
            <h3 className="summary-main-title">Revisión y Confirmación Final</h3>
            
            {sections.map((section, index) => {
                const isOpen = openIndex === index;

                return (
                    <div key={index} className={`summary-accordion-item ${isOpen ? 'is-open' : ''}`}>
                        
                        {/* 🛑 CABECERA/BOTÓN DEL ACORDEÓN */}
                        <div 
                            className="summary-accordion-header" 
                            onClick={() => toggleSection(index)}
                        >
                            {/* Ícono Toggle (usa un carácter o un ícono importado) */}
                            <span 
                                className="accordion-toggle-icon" 
                                style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                            >
                                {'>'}
                            </span>
                            <h4 className="summary-section-title">
                                {section.title}
                            </h4>
                        </div>
                        
                        {/* 🛑 CONTENIDO DEL ACORDEÓN (RENDERIZADO CONDICIONAL) */}
                        {isOpen && (
                            <div className="summary-accordion-content">
                                {/* El grid de detalle para presentar Label: Value */}
                                <div className="summary-detail-grid">
                                    {section.items.map((item, itemIndex) => (
                                        <p key={itemIndex} className="summary-item" style={item.style}>
                                            <strong>{item.label}:</strong> {item.value}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            <p className="summary-confirmation-text">
                {confirmationMessage}
            </p>
        </div>
    );
};

export default DynamicSummaryDisplay;