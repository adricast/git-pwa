// src/index.ts
// ===== COMPONENTS =====
export { default as CardContainer } from './components/cardcontainer/cardcontainer';
export { default as CardContainer2 } from './components/cardcontainer2/cardcontainer';
export { default as DynamicForm } from './components/dinamicform/dynamicfield';
export { default as MultiSectionDynamicForm } from './components/multisectiondinamicform/dynamicsection';
// ✅ EXPORTACIÓN CRÍTICA: Añadir DynamicTable (asumiendo su ruta)
export { default as DynamicTable } from './components/multisectiondinamicform/dynamictable';
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
export { default as DynamicSummaryDisplay } from './components/multisectiondinamicform/dynamicsumary';
// ===== HOOKS =====
export { useCardContext } from './components/cardcontainer/usecardcontext';
export { useCardManager } from './components/cardcontainer/usercardmanager';
export { useDynamicForm } from './components/dinamicform/usedynamicform';
export { useScreenContainer } from './components/screencontainer/usescreencontainer';
// ===== UTILITIES =====
export { default as ColumnFilter } from './components/reusabletablefilter/columfilter';
