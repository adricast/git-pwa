// 📁 src/components/forms/DynamicTreeSelect.tsx (FINAL CON PROPAGACIÓN DE BÚSQUEDA)

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
// FUNCIONES AUXILIARES DE JERARQUÍA Y FILTRADO (CRÍTICAS)
// =========================================================

interface HierarchyMap {
    nodeMap: Map<string, TreeNode>;
    parentMap: Map<string, string | null>;
}

/**
 * 💡 Construye un mapa plano para acceder rápidamente a los nodos y a sus padres.
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

/**
 * 💡 Función que filtra el árbol, manteniendo nodos si:
 * 1. Coinciden con el término (y se propaga toda la rama descendiente).
 * 2. O si alguno de sus descendientes coincide (para mantener la ruta visible).
 */
const filterTree = (nodes: TreeNode[], term: string): TreeNode[] => {
    const lowerCaseTerm = term.toLowerCase();

    if (!lowerCaseTerm.trim()) {
        return nodes;
    }

    return nodes.reduce((acc: TreeNode[], node) => {
        const matchesSelf = node.label.toLowerCase().includes(lowerCaseTerm);
        let matchedChildren: TreeNode[] = [];
        
        // 🛑 LÓGICA DE PROPAGACIÓN DE RAMA COMPLETA
        if (matchesSelf) {
            // Si el nodo actual (cabecera) coincide, lo incluimos con todos sus hijos
            // sin filtrar más. Esto asegura que la rama 'Módulos Ventas' aparezca completa.
            acc.push({
                ...node,
                // Clonamos los hijos para evitar mutación
                children: node.children ? node.children.map(child => ({ ...child })) : undefined, 
            });
            return acc; 
        }

        // Si NO coincide directamente, filtramos a los hijos para ver si alguno coincide
        if (node.children) {
            matchedChildren = filterTree(node.children, term);
        }
        
        // Si el nodo es un ANCESTRO (no coincide, pero sus hijos sí), lo incluimos
        // para mantener la jerarquía visible.
        if (matchedChildren.length > 0) {
            acc.push({
                ...node,
                // Mantenemos solo los hijos que coinciden (matchedChildren) para mostrar la ruta.
                children: matchedChildren, 
            });
        }
        
        return acc;
    }, []);
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
    
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🛑 ESTADO DE EXPANSION (sin cambios)
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
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

    // 🛑 LÓGICA DE EXPANSION FORZADA EN BÚSQUEDA (sin cambios)
    React.useEffect(() => {
        if (searchTerm.trim()) {
            const allIds: string[] = [];
            const collectIds = (nodes: TreeNode[]) => {
                nodes.forEach(node => {
                    allIds.push(node.id);
                    if (node.children) collectIds(node.children);
                });
            };
            collectIds(treeNodes);
            setExpandedNodes(new Set(allIds)); 
        } else {
            const initialExpanded = new Set<string>();
            treeNodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    initialExpanded.add(node.id);
                }
            });
            setExpandedNodes(initialExpanded);
        }
    }, [searchTerm, treeNodes]);
    
    
    // 🛑 LÓGICA DE COLAPSO (sin cambios)
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

    // 🛑 APLICAR FILTRADO AL ÁRBOL PRINCIPAL
    const filteredTree = useMemo(() => {
        return filterTree(treeNodes, searchTerm);
    }, [treeNodes, searchTerm]);
    
    const selectedIdsSet = useMemo(() => new Set(value), [value]);
    const { nodeMap, parentMap } = useMemo(() => buildHierarchyMaps(treeNodes), [treeNodes]);

    // 2. Lógica Ascendente (Actualizar padres)
    const updateAncestors = useCallback((id: string, newSelectedIds: Set<string>) => {
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


    // 3. Manejador de cambio de nodo (sin cambios)
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
        // La expansión/colapso se ignora si hay un término de búsqueda (expandido por useEffect)
        const isExpanded = expandedNodes.has(node.id);
        
        let isChecked = selectedIdsSet.has(node.id);
        let isIndeterminate = false;

        // --- LÓGICA DE ESTADO (CALCULADA) ---
        if (hasChildren) {
            const nodeInOriginalTree = nodeMap.get(node.id);
            if (nodeInOriginalTree) {
                const allDescendants = getDescendantIds(nodeInOriginalTree).slice(1); 
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
            }
        } else {
            isChecked = selectedIdsSet.has(node.id);
        }
        
        return (
            <div 
                key={node.id} 
                className={`tree-node tree-level-${level} tree-type-${node.type} ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                style={{ marginLeft: `${level * 20}px` }}
            >
                <div className="node-content">
                    
                    {/* BOTÓN DE EXPANDIR/COLAPSAR */}
                    {hasChildren && (
                        <button 
                            type="button" 
                            onClick={() => toggleExpand(node.id)}
                            className="tree-toggle-button"
                            title={isExpanded ? 'Colapsar' : 'Expandir'}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: '0 5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#666',
                                marginRight: '5px',
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
                
                {/* RENDERIZADO CONDICIONAL: Solo si tiene hijos Y está expandido */}
                {hasChildren && isExpanded && (
                    <div className="tree-children-container">
                        {/* Usa los hijos filtrados (node.children ya son los hijos filtrados por filterTree) */}
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    }, [selectedIdsSet, handleNodeChange, expandedNodes, toggleExpand, nodeMap]);

    return (
        <div className="dynamic-tree-select-wrapper">
            {/* INPUT DE BÚSQUEDA */}
            <input
                type="text"
                placeholder="Buscar módulo o política..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tree-search-input"
                style={{
                    width: '100%',
                    padding: '8px 10px',
                    marginBottom: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                }}
            />
            
            {/* RENDERIZAR EL ÁRBOL FILTRADO */}
            {filteredTree.length > 0 ? (
                filteredTree.map(node => renderNode(node, 0))
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No se encontraron resultados para "{searchTerm}".
                </div>
            )}
        </div>
    );
};

export default DynamicTreeSelect;