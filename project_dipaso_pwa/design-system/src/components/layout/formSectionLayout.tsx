// Componente de sección de formulario con borde y título opcional
import React from 'react';

export interface FormSectionLayoutProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSectionLayout: React.FC<FormSectionLayoutProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`form-section-container ${className}`}>
      {title && (
        <div className="form-section-header">
          <h3 className="form-section-title">{title}</h3>
        </div>
      )}
      <div className="form-section-content">
        {children}
      </div>
    </div>
  );
};

export default FormSectionLayout;
