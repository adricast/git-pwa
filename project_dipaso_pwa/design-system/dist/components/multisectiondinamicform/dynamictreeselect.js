import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// 📁 src/components/forms/DynamicTreeSelect.tsx (FINAL CON PROPAGACIÓN DE BÚSQUEDA)
import React, { useState, useCallback, useMemo } from 'react';
import { useDynamicFormContext } from './dynamicformContext';
/**
 * 💡 Construye un mapa plano para acceder rápidamente a los nodos y a sus padres.
 */
const buildHierarchyMaps = (nodes, parentId = null, maps = { nodeMap: new Map(), parentMap: new Map() }) => {
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
const getDescendantIds = (node) => {
    const ids = [node.id];
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
const filterTree = (nodes, term) => {
    const lowerCaseTerm = term.toLowerCase();
    if (!lowerCaseTerm.trim()) {
        return nodes;
    }
    return nodes.reduce((acc, node) => {
        const matchesSelf = node.label.toLowerCase().includes(lowerCaseTerm);
        let matchedChildren = [];
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
const DynamicTreeSelect = ({ fieldName, treeNodes, value }) => {
    const { handleChange } = useDynamicFormContext();
    const [searchTerm, setSearchTerm] = useState('');
    // 🛑 ESTADO DE EXPANSION (sin cambios)
    const [expandedNodes, setExpandedNodes] = useState(() => {
        const initialExpanded = new Set();
        const traverse = (nodes) => {
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
            const allIds = [];
            const collectIds = (nodes) => {
                nodes.forEach(node => {
                    allIds.push(node.id);
                    if (node.children)
                        collectIds(node.children);
                });
            };
            collectIds(treeNodes);
            setExpandedNodes(new Set(allIds));
        }
        else {
            const initialExpanded = new Set();
            treeNodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    initialExpanded.add(node.id);
                }
            });
            setExpandedNodes(initialExpanded);
        }
    }, [searchTerm, treeNodes]);
    // 🛑 LÓGICA DE COLAPSO (sin cambios)
    const toggleExpand = useCallback((nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            }
            else {
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
    const updateAncestors = useCallback((id, newSelectedIds) => {
        let currentId = id;
        while (parentMap.get(currentId)) {
            const parentId = parentMap.get(currentId);
            const parentNode = nodeMap.get(parentId);
            if (!parentNode.children || parentNode.children.length === 0) {
                currentId = parentId;
                continue;
            }
            const allDescendants = getDescendantIds(parentNode).slice(1);
            const selectedDescendantsCount = allDescendants.filter(childId => newSelectedIds.has(childId)).length;
            if (selectedDescendantsCount === allDescendants.length) {
                newSelectedIds.add(parentId);
            }
            else if (selectedDescendantsCount === 0) {
                newSelectedIds.delete(parentId);
            }
            currentId = parentId;
        }
    }, [parentMap, nodeMap]);
    // 3. Manejador de cambio de nodo (sin cambios)
    const handleNodeChange = useCallback((nodeId, isChecked, node) => {
        const descendantIds = getDescendantIds(node);
        const newSelectedIds = new Set(selectedIdsSet);
        if (isChecked) {
            descendantIds.forEach(id => newSelectedIds.add(id));
        }
        else {
            descendantIds.forEach(id => newSelectedIds.delete(id));
        }
        updateAncestors(nodeId, newSelectedIds);
        handleChange(fieldName, Array.from(newSelectedIds));
    }, [fieldName, selectedIdsSet, handleChange, updateAncestors]);
    // =========================================================
    // RENDERIZADO RECURSIVO DEL NODO
    // =========================================================
    const renderNode = useCallback((node, level) => {
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
                }
                else if (selectedDescendantsCount > 0) {
                    isChecked = false;
                    isIndeterminate = true;
                }
                else {
                    isChecked = false;
                    isIndeterminate = false;
                }
            }
        }
        else {
            isChecked = selectedIdsSet.has(node.id);
        }
        return (_jsxs("div", { className: `tree-node tree-level-${level} tree-type-${node.type} ${isExpanded ? 'is-expanded' : 'is-collapsed'}`, style: { marginLeft: `${level * 20}px` }, children: [_jsxs("div", { className: "node-content", children: [hasChildren && (_jsx("button", { type: "button", onClick: () => toggleExpand(node.id), className: "tree-toggle-button", title: isExpanded ? 'Colapsar' : 'Expandir', style: {
                                background: 'none',
                                border: 'none',
                                padding: '0 5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#666',
                                marginRight: '5px',
                            }, children: isExpanded ? 'v' : '>' })), !hasChildren && _jsx("span", { className: "tree-toggle-placeholder", style: { width: '25px' } }), _jsx("input", { type: "checkbox", id: node.id, checked: isChecked, ref: (input) => {
                                if (input) {
                                    input.indeterminate = isIndeterminate;
                                }
                            }, onChange: (e) => handleNodeChange(node.id, e.target.checked, node) }), _jsx("label", { htmlFor: node.id, children: node.label })] }), hasChildren && isExpanded && (_jsx("div", { className: "tree-children-container", children: node.children.map(child => renderNode(child, level + 1)) }))] }, node.id));
    }, [selectedIdsSet, handleNodeChange, expandedNodes, toggleExpand, nodeMap]);
    return (_jsxs("div", { className: "dynamic-tree-select-wrapper", children: [_jsx("input", { type: "text", placeholder: "Buscar m\u00F3dulo o pol\u00EDtica...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "tree-search-input", style: {
                    width: '100%',
                    padding: '8px 10px',
                    marginBottom: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                } }), filteredTree.length > 0 ? (filteredTree.map(node => renderNode(node, 0))) : (_jsxs("div", { style: { padding: '20px', textAlign: 'center', color: '#666' }, children: ["No se encontraron resultados para \"", searchTerm, "\"."] }))] }));
};
export default DynamicTreeSelect;
