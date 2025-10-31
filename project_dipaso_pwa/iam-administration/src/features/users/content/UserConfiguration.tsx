// ============================================================================
// CAPA: Content/Vista - Componente de configuración de usuario
// ============================================================================

import React, { useState } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { Tree } from 'primereact/tree';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import type { TreeNode } from 'primereact/treenode';
import '../styles/UserConfiguration.sass';

/**
 * Props del componente UserConfiguration
 */
export interface UserConfigurationProps {
  userGroups: Array<{ id: string; name: string }>;
  selectedGroup: Array<{ id: string; name: string }> | null;
  onGroupChange: (groups: Array<{ id: string; name: string }> | null) => void;
  policiesTree: TreeNode[];
  selectedPolicies: Record<string, boolean>;
  onPoliciesChange: (policies: Record<string, boolean>) => void;
}

/**
 * Componente de configuración de usuario con grupo y políticas
 */
export const UserConfiguration: React.FC<UserConfigurationProps> = ({
  userGroups,
  selectedGroup,
  onGroupChange,
  policiesTree,
  selectedPolicies,
  onPoliciesChange
}) => {
  const [policySearch, setPolicySearch] = useState('');

  // Filtrar políticas basado en búsqueda
  const filteredPolicies = React.useMemo(() => {
    if (!policySearch.trim()) return policiesTree;

    const query = policySearch.toLowerCase();
    return policiesTree.filter(node =>
      node.label?.toLowerCase().includes(query)
    );
  }, [policiesTree, policySearch]);

  return (
    <div className="user-configuration-container">
      {/* Selector de Grupos de Usuario (Múltiple) */}
      <div className="config-section">
        <label htmlFor="user-groups" className="config-label">
          Grupos de usuario:
        </label>
        <div className="config-dropdown-wrapper">
          <MultiSelect
            id="user-groups"
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.value)}
            options={userGroups}
            optionLabel="name"
            placeholder="Seleccione uno o más grupos"
            className="w-full config-dropdown"
            display="chip"
            maxSelectedLabels={3}
          />
        </div>
      </div>

      {/* Selector de Políticas con Tree */}
      <div className="config-section mt-4">
        <label className="config-label">Políticas:</label>

        {/* Buscador de políticas */}
        <div className="mb-3 policy-search-wrapper">
          <IconField iconPosition="left" className="w-full">
            <InputIcon className="pi pi-search" />
            <InputText
              placeholder="Buscar por nombre..."
              value={policySearch}
              onChange={(e) => setPolicySearch(e.target.value)}
              className="w-full policy-search"
            />
          </IconField>
        </div>

        {/* Árbol de políticas con checkboxes */}
        <div className="policies-tree-container">
          <Tree
            value={filteredPolicies}
            selectionMode="checkbox"
            selectionKeys={selectedPolicies}
            onSelectionChange={(e) => onPoliciesChange(e.value as Record<string, boolean>)}
            className="policies-tree"
          />
        </div>
      </div>
    </div>
  );
};

export default UserConfiguration;
