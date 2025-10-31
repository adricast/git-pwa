import React from 'react';
import type { TreeNode } from './interface';
export interface DynamicTreeSelectProps {
    fieldName: string;
    treeNodes: TreeNode[];
    value: string[];
}
declare const DynamicTreeSelect: React.FC<DynamicTreeSelectProps>;
export default DynamicTreeSelect;
