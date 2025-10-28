// src/index.ts

// ===== COMPONENTS =====

export { default as CardContainer } from './components/cardcontainer/cardcontainer';
export { default as CardContainer2 } from './components/cardcontainer2/cardcontainer';
export { default as DynamicForm } from './components/dinamicform/dynamicfield';
export { default as MultiSectionDynamicForm } from './components/multisectiondinamicform/dynamicsection';

// ✅ EXPORTACIÓN CRÍTICA: Añadir DynamicTable (asumiendo su ruta)
export { default as DynamicTable } from './components/multisectiondinamicform/dynamictable'; 

// Exporta los tipos de formularios desde el archivo centralizado
export type {
    DynamicFormProviderProps,
    DynamicButtonProps,
    FormField,
    FormSection,
    TreeNode
} from './types/form';

// ===== LAYOUTS =====
export { default as CardManagerLayout } from './components/layout/cardmanagerLayout';
export { default as CardManager2Layout } from './components/layout/cardmanager2Layout';
export { default as DialogLayout } from './components/layout/dialogLayout';
export { default as DeleteDialogLayout } from './components/layout/deletedialogLayout';
export { default as OptionCardLayout } from './components/layout/optioncardLayout';
export { default as ReusableTableLayout } from './components/layout/reusabletableLayout';
export { default as ReusableTableFilterLayout } from './components/layout/reusabletablefilterLayout';
export { default as ScreenContainerLayout } from './components/layout/screencontainerLayout';
export { default as ScreenUsableLayout } from './components/layout/screenusableLayout';

// ===== PROVIDERS =====
export { default as CardProvider } from './components/cardcontainer/cardprovider';
export { default as CardManagerProvider } from './components/cardcontainer/cardmanagerprovider';
export { default as DynamicFormProvider } from './components/dinamicform/dynamicformProvider';
export { default as DynamicFormProviderSections } from './components/multisectiondinamicform/dynamicformProvider';
// export { default as DynamicForm } from './components/multisectiondinamicform/dynamicformProvider';
export { default as ScreenContainerProvider } from './components/screencontainer/screencontainerprovider';

export { default as DynamicSectionComponent } from './components/multisectiondinamicform/dynamicsection';

// ===== HOOKS =====
export { useCardContext } from './components/cardcontainer/usecardcontext';
export { useCardManager } from './components/cardcontainer/usercardmanager';
export { useDynamicForm } from './components/dinamicform/usedynamicform';
export { useScreenContainer } from './components/screencontainer/usescreencontainer';

// ===== TYPES =====
export type { CardContainerProps } from './components/cardcontainer/interface';
// (ya se exportan arriba desde './types/form')
export type { ReusableTableProps } from './components/reusabletable/interface';
export type { ReusableTableFilterProps } from './components/reusabletablefilter/interface'
export type { ScreenContainerContextProps } from './components/screencontainer/interface'
export  { type DynamicTableProps } from './components/multisectiondinamicform/dynamictable'
export { type DynamicTreeSelectProps } from './components/multisectiondinamicform/dynamictreeselect'
// ===== UTILITIES =====
export { default as ColumnFilter } from './components/reusabletablefilter/columfilter';