// 📁 src/components/forms/DynamicTreeSelect.tsx (FINAL CON LÓGICA DE COLAPSO)

import React, { useState, useCallback, useMemo } from 'react';
import type { TreeNode } from './interface'; 
import { useDynamicFormContext } from './dynamicformContext'; 

// Props que recibe el componente desde DynamicField
export interface DynamicTreeSelectProps {
          fieldName: string; 
          treeNodes: TreeNode[]; 
          value: string[]; 
}

// =========================================================
// FUNCIONES AUXILIARES DE JERARQUÍA (CRÍTICAS)
// =========================================================

interface HierarchyMap {
    nodeMap: Map<string, TreeNode>;
    parentMap: Map<string, string | null>;
}

/**
 * 💡 Construye un mapa plano para acceder rápidamente a los nodos y a sus padres.
 * Se ejecuta solo una vez.
 */
const buildHierarchyMaps = (nodes: TreeNode[], parentId: string | null = null, maps: HierarchyMap = { nodeMap: new Map(), parentMap: new Map() }): HierarchyMap => {
    nodes.forEach(node => {
        maps.nodeMap.set(node.id, node);
        maps.parentMap.set(node.id, parentId);
        if (node.children) {
            buildHierarchyMaps(node.children, node.id, maps);
        }
    });
    return maps;
};

/**
 * 💡 Obtiene todos los IDs de los hijos, incluyendo el nodo padre
 */
const getDescendantIds = (node: TreeNode): string[] => {
          const ids: string[] = [node.id];
          if (node.children) {
                    node.children.forEach(child => {
                              ids.push(...getDescendantIds(child));
                    });
          }
          return ids;
};

// =========================================================
// COMPONENTE DynamicTreeSelect
// =========================================================

const DynamicTreeSelect: React.FC<DynamicTreeSelectProps> = ({ 
          fieldName, 
          treeNodes, 
          value 
}) => {
          
    const { handleChange } = useDynamicFormContext();
    
    // 🛑 NUEVO ESTADO: Rastrea qué IDs de nodos están expandidos
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
        // Inicialmente, expandir todos los nodos que tienen hijos (comportamiento por defecto)
        const initialExpanded = new Set<string>();
        const traverse = (nodes: TreeNode[]) => {
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    initialExpanded.add(node.id);
                    traverse(node.children);
                }
            });
        };
        traverse(treeNodes);
        return initialExpanded;
    });

    // 🛑 NUEVA FUNCIÓN: Alternar el estado expandido de un nodo
    const toggleExpand = useCallback((nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);


    // 1. Mapeo de estado y jerarquía (sin cambios)
    const selectedIdsSet = useMemo(() => new Set(value), [value]);
    const { nodeMap, parentMap } = useMemo(() => buildHierarchyMaps(treeNodes), [treeNodes]);

    // 2. Lógica Ascendente (sin cambios en la lógica interna)
    const updateAncestors = useCallback((id: string, newSelectedIds: Set<string>) => {
        // ... (Lógica de updateAncestors sin cambios)
        let currentId = id;
        
        while (parentMap.get(currentId)) {
            const parentId = parentMap.get(currentId)!;
            const parentNode = nodeMap.get(parentId)!;
            
            if (!parentNode.children || parentNode.children.length === 0) {
                currentId = parentId; 
                continue;
            }

            const allDescendants = getDescendantIds(parentNode).slice(1);
            const selectedDescendantsCount = allDescendants.filter(childId => newSelectedIds.has(childId)).length;
            
            if (selectedDescendantsCount === allDescendants.length) {
                newSelectedIds.add(parentId);
            } else if (selectedDescendantsCount === 0) {
                newSelectedIds.delete(parentId);
            }

            currentId = parentId;
        }

    }, [parentMap, nodeMap]);


    // 3. Manejador de cambio de nodo (sin cambios en la lógica interna)
    const handleNodeChange = useCallback((nodeId: string, isChecked: boolean, node: TreeNode) => {
                    
        const descendantIds = getDescendantIds(node);
        const newSelectedIds = new Set(selectedIdsSet);

        if (isChecked) {
            descendantIds.forEach(id => newSelectedIds.add(id));
        } else {
            descendantIds.forEach(id => newSelectedIds.delete(id));
        }
        
        updateAncestors(nodeId, newSelectedIds);

        handleChange(fieldName, Array.from(newSelectedIds));
        
    }, [fieldName, selectedIdsSet, handleChange, updateAncestors]);

    // =========================================================
    // RENDERIZADO RECURSIVO DEL NODO
    // =========================================================
    
    const renderNode = useCallback((node: TreeNode, level: number) => {
        
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id); // 🛑 Usar el estado de expansión
        
        let isChecked = selectedIdsSet.has(node.id);
        let isIndeterminate = false;

        // --- LÓGICA DE ESTADO (CALCULADA) ---
        if (hasChildren) {
            const allDescendants = getDescendantIds(node).slice(1); 
            const selectedDescendantsCount = allDescendants.filter(id => selectedIdsSet.has(id)).length;
            
            if (selectedDescendantsCount === allDescendants.length) {
                isChecked = true; 
                isIndeterminate = false;
            } else if (selectedDescendantsCount > 0) {
                isChecked = false; 
                isIndeterminate = true;
            } else {
                isChecked = false;
                isIndeterminate = false;
            }
        } else {
            isChecked = selectedIdsSet.has(node.id);
        }
        
        return (
            // Añadimos clases para control de estilos
            <div 
                key={node.id} 
                className={`tree-node tree-level-${level} tree-type-${node.type} ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                style={{ marginLeft: `${level * 20}px` }}
            >
                <div className="node-content">
                    
                    {/* 🛑 BOTÓN DE EXPANDIR/COLAPSAR */}
                    {hasChildren && (
                        <button 
                            type="button" 
                            onClick={() => toggleExpand(node.id)}
                            className="tree-toggle-button"
                            title={isExpanded ? 'Colapsar' : 'Expandir'}
                            // Usamos el estado isExpanded para alternar el ícono
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: '0 5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#666',
                                marginRight: '5px',
                                // Rotación del ícono: v (expandido) o > (colapsado)
                            }}
                        >
                            {isExpanded ? 'v' : '>'} 
                        </button>
                    )}
                    
                    {/* Placeholder si no hay hijos para mantener la alineación horizontal */}
                    {!hasChildren && <span className="tree-toggle-placeholder" style={{ width: '25px' }} />}


                    <input
                        type="checkbox"
                        id={node.id}
                        checked={isChecked}
                        ref={(input: HTMLInputElement | null) => {
                            if (input) {
                                input.indeterminate = isIndeterminate; 
                            }
                        }}
                        onChange={(e) => handleNodeChange(node.id, e.target.checked, node)}
                    />
                    <label htmlFor={node.id}>{node.label}</label>
                </div>
                
                {/* 🛑 RENDERIZADO CONDICIONAL: Solo si tiene hijos Y está expandido */}
                {hasChildren && isExpanded && (
                    <div className="tree-children-container">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    }, [selectedIdsSet, handleNodeChange, expandedNodes, toggleExpand]);

    return (
        <div className="dynamic-tree-select-wrapper">
            {treeNodes.map(node => renderNode(node, 0))}
        </div>
    );
};

export default DynamicTreeSelect;