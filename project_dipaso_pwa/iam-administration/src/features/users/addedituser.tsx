import React, { useCallback, useMemo } from "react";
import { DynamicFormProviderSections } from '@dipaso/design-system';
import type { FormSection } from '@dipaso/design-system/dist/components/multisectiondinamicform/interface';
import { userFormSections } from "./userformconfig";

interface UserFormData {
	code: string;
	name: string;
	password: string;
	web?: string;
	employee?: string;
	group?: string;
	estado: string;
	isActive: boolean;
	aplicaciones?: string[];
	codigoPV?: string;
	tarjetaMagnetica?: string;
	perfilAcceso?: string[];
}

export const AddEditUserContent: React.FC<{
	user: Partial<UserFormData> | null;
	onSave: (user: Partial<UserFormData>) => Promise<void>;
	isSinglePageMode?: boolean;
}> = ({ user, onSave, isSinglePageMode = false }) => {
	const initialData: Partial<UserFormData> = useMemo(() => ({
		code: user?.code || "",
		name: user?.name || "",
		password: user?.password || "",
		web: user?.web || "",
		employee: user?.employee || "",
		group: user?.group || "",
		estado: user?.estado || "active",
		isActive: user?.isActive ?? true,
		aplicaciones: user?.aplicaciones || [],
		codigoPV: user?.codigoPV || "",
		tarjetaMagnetica: user?.tarjetaMagnetica || "",
		perfilAcceso: user?.perfilAcceso || [],
	}), [user]);

	const handleDynamicSubmit = useCallback(async (data: Partial<UserFormData>) => {
	    await onSave(data);
	}, [onSave]);

	return (
		<DynamicFormProviderSections
			sections={userFormSections as FormSection[]}
			initialData={initialData}
			onSubmit={handleDynamicSubmit}
			singlePage={isSinglePageMode}
		/>
	);
};
