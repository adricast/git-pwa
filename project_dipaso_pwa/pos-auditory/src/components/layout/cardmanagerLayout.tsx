// src/components/CardManager/CardManager.tsx (FINAL CORREGIDO)

import React, { useState, useCallback, /*useMemo*/ } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CardManagerProvider } from '../cardcontainer/cardmanagerprovider'; 
import CardContainer from '../cardcontainer/cardcontainer'; 
import { 
    type FichaData, 
    type AddCardFunction, 
    // 💡 NOTA: Si quiere eliminar la advertencia de ESLint sobre 'UpdateCardFunction',
    // NO debe importarla aquí:
    // type UpdateCardFunction 
} from '../cardcontainer/interface'; // 🔑 Esta ruta DEBE contener las interfaces corregidas
import './../styles/cardmanagerLayout.scss';

// Componentes de ejemplo (Se definirían en archivos separados)

//const ComponenteA = () => <div>Contenido A (Formulario de Pedido)</div>;
//const ComponenteB = () => <div>Contenido B (Gráfico de Ventas)</div>;

// 🎯 CORRECCIÓN CLAVE: Definir el componente para que acepte la prop 'children'
const CardManager: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    
    // Estado principal: Un array de las fichas que están abiertas
    const [fichas, setFichas] = useState<FichaData[]>([]);
    //  Restauramos el useMemo comentado para que los botones de prueba funcionen si se descomentan
    //const nextId = useMemo(() => fichas.length + 1, [fichas]);


    // --------------------------------------------------------
    // 1. FUNCIONALIDADES DEL GESTOR (Implementación de CardManagerContextType)
    // --------------------------------------------------------

    // A. AGREGAR FICHA (ADD) - 🔑 CORREGIDA
    // Firma: (title, content, customId?, onCloseCallback?)
    const handleAddCard: AddCardFunction = useCallback((
        title: React.ReactNode, 
        contentComponent: React.ReactNode,
        customId?: string | number, 
        // 🔑 NUEVO ARGUMENTO: El callback de cierre
        onCloseCallback?: () => void 
    ) => {
        const newFicha: FichaData = {
            // USAR el ID personalizado (string|number) o generar uno aleatorio (string)
            id: customId || uuidv4(), 
            title: title, 
            contentComponent: contentComponent,
            onCloseCallback: onCloseCallback, // 🔑 Almacenamos el callback
        };
        // Simple append. La lógica de 'update si ya existe' debería estar en el componente que lo llama.
        setFichas(prev => [...prev, newFicha]);
    }, []); 


    // B. CERRAR FICHA (REMOVE/CLOSE) - 🔑 CORREGIDA
    // Implementación de la lógica de remoción. Se pasa a CardManagerProvider como removeCardFunction.
    const handleCloseCard = useCallback((id: string | number) => {

        // 1. Buscamos la ficha para obtener el callback
        const fichaToClose = fichas.find(ficha => ficha.id === id);

        // 2. 🔑 Ejecutar el callback (navigate(-1)) si existe
        if (fichaToClose && fichaToClose.onCloseCallback) {
            fichaToClose.onCloseCallback(); 
        }

        // 3. Remover la ficha del estado
        setFichas(prev => prev.filter(ficha => ficha.id !== id));
    }, [fichas]); // Dependencia necesaria para buscar la ficha

    // C. ACTUALIZAR FICHA (UPDATE)
    // Firma: (id, title, content) - Compatible con groupuserLayout.tsx
    const handleUpdateCard = useCallback((
        id: string | number, 
        title: React.ReactNode, 
        contentComponent: React.ReactNode
    ) => {
        setFichas(prev => prev.map(ficha => 
            ficha.id === id ? { ...ficha, title, contentComponent } : ficha
        ));
    }, []);

    // D. VERIFICAR FICHA ABIERTA (IS OPEN)
    const isCardOpen = useCallback((id: string | number): boolean => {
        return fichas.some(ficha => ficha.id === id);
    }, [fichas]);


    return (
        // 1. PROVEEMOS EL CONTEXTO: Pasamos las CUATRO funciones.
        <CardManagerProvider 
            addCardFunction={handleAddCard}
            updateCardFunction={handleUpdateCard} 
            isCardOpenFunction={isCardOpen} 
            // Incluimos la función de remoción.
            removeCardFunction={handleCloseCard} 
        >
            <div className="card-manager-container">
                
                {/* 🎯 PUNTO CLAVE: Aquí se renderiza el GroupInitializer que usa addCard */}
                {children} 
                
                {/* Los botones de prueba se mantienen si quieres abrirlas manualmente 
                
                <div className="card-actions">
                    <button 
                        className="add-ficha-primary"
                        onClick={() => handleAddCard(`Pedido Nuevo #${nextId}`, <ComponenteA />)}
                    >
                        + Abrir Formulario (Ficha A)
                    </button>
                    <button 
                        className="add-ficha-secondary"
                        onClick={() => handleAddCard(`Gráfico #${nextId}`, <ComponenteB />)}
                    >
                        + Abrir Reporte (Ficha B)
                    </button>
                </div>
                
                
                */}
                

                <div className="card-grid">
                    {fichas.map(ficha => (
                        <CardContainer 
                            key={ficha.id}
                            id={ficha.id}
                            title={ficha.title}
                            // Pasamos la función de cierre a cada contenedor
                            onClose={handleCloseCard} 
                        >
                            {ficha.contentComponent}
                        </CardContainer>
                    ))}
                </div>
            </div>
        </CardManagerProvider>
    );
};

export default CardManager;
