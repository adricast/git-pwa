// src/index.ts

// ===== COMPONENTS =====
export { default as CardContainer } from './components/cardcontainer/cardcontainer';
export { default as CardContainer2 } from './components/cardcontainer2/cardcontainer';
export { default as DynamicForm } from './components/dinamicform/dynamicfield';
export { default as MultiSectionDynamicForm } from './components/multisectiondinamicform/dynamicsection';
// export { default as ReusableTable } from './components/reusabletable/interface';
//export { default as ReusableTableFilter } from './components/reusabletablefilter/columfilter';
// export { default as ScreenContainer } from './components/screencontainer/usescreencontainer';

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
export { default as ScreenContainerProvider } from './components/screencontainer/screencontainerprovider';

// ===== HOOKS =====
export { useCardContext } from './components/cardcontainer/usecardcontext';
export { useCardManager } from './components/cardcontainer/usercardmanager';
export { useDynamicForm } from './components/dinamicform/usedynamicform';
export { useScreenContainer } from './components/screencontainer/usescreencontainer';

// ===== TYPES =====
export type { CardContainerProps } from './components/cardcontainer/interface';
export type { DynamicFormProviderProps,DynamicButtonProps, FormField, FormSection,  CustomComponentProps, CustomReactComponent} from './components/dinamicform/interface';
export type { ReusableTableProps } from './components/reusabletable/interface';
export type { ReusableTableFilterProps } from './components/reusabletablefilter/interface'
export type { ScreenContainerContextProps } from './components/screencontainer/interface'

// ===== UTILITIES =====
// export { default as TableLogic } from './components/reusabletable/tablelogic'
// export { default as TableFilterLogic } from './components/reusabletablefilter/tablelogic'
export { default as ColumnFilter } from './components/reusabletablefilter/columfilter'