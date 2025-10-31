import React from "react";
import { AddEditUserContent } from "./addedituser";

interface UserFormData {
	code: string;
	name: string;
	password: string;
	web?: string;
	employee?: string;
	group?: string;
	estado: string;
	aplicaciones?: string[];
	codigoPV?: string;
	tarjetaMagnetica?: string;
	perfilAcceso?: string[];
}

export const UserFormWrapper: React.FC<{
	user: Partial<UserFormData> | null;
	onSave: (user: Partial<UserFormData>) => Promise<void>;
}> = ({ user, onSave }) => {
	const isLoading = false;
	const error = null;

	if (isLoading) {
		return <div>Cargando configuración...</div>;
	}
	if (error) {
		return <div>Error al cargar configuración: {String(error)}. No se puede mostrar el formulario.</div>;
	}

	return (
		<AddEditUserContent
			user={user}
			onSave={onSave}
			isSinglePageMode={true}
		/>
	);
};

export default UserFormWrapper;
