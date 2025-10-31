import { useState, useEffect, useCallback } from 'react';
import { useScreenContainer, ReusableTableFilterLayout } from '@dipaso/design-system';
import { FaSyncAlt } from 'react-icons/fa';
import DeleteConfirmationDialog from '@dipaso/design-system/dist/components/layout/deletedialogLayout';
import UserFormWrapper from "./userformwrapper";
import { userServiceLocal, type UserModel } from "./userserviceLocal";

const { getAllUsers, softDeleteUsersMassive, createUser, updateUser } = userServiceLocal;

const UserManagement = () => {
		const { openScreen, closeTopScreen } = useScreenContainer();

			// Debug: cuenta de renders para detectar bucles de re-render
			if (typeof console !== 'undefined' && typeof console.count === 'function') {
				console.count('UserManagement render');
			}

			// Debug: comprobar si la hoja de estilos del design-system está cargada en runtime
			useEffect(() => {
				try {
					const sheets = Array.from(document.styleSheets).map(s => ({ href: (s as CSSStyleSheet).href, sheet: s }));
					const hrefs = sheets.map(s => s.href).filter(Boolean) as string[];
					const hasDesign = hrefs.some(h => h.includes('design-system'));
					console.info('DEBUG: design-system CSS loaded by href?', hasDesign, hrefs);

					// Más robusto: inspeccionar cssRules buscando patrones comunes del design-system
					const patterns = ['btn-primary', 'btn-delete', 'reusable', 'screen-container', 'reusable-table', 'optioncard', 'table-wrapper'];
					for (const s of sheets) {
						if (!s.href) continue;
						try {
							const cssRules = (s.sheet as CSSStyleSheet).cssRules;
							for (let i = 0; i < cssRules.length; i++) {
								const txt = (cssRules[i] as CSSStyleRule).cssText || '';
								if (patterns.some(p => txt.includes(p))) {
									console.info('DEBUG: design-system-like rule found in', s.href, 'snippet:', txt.slice(0, 200));
									// stop after first match for this sheet
									break;
								}
							}
						} catch {
							// probable cross-origin stylesheet, ignore
							console.debug('DEBUG: no access to cssRules for', s.href);
						}
					}
				} catch (err) {
					console.warn('DEBUG: no se pudo inspeccionar document.styleSheets', err);
				}
			}, []);

		const [users, setUsers] = useState<UserModel[]>([]);
		const [selectedRows, setSelectedRows] = useState<UserModel[]>([]);
		const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
		const [itemToDelete, setItemToDelete] = useState<UserModel | null>(null);
		const [loading, setLoading] = useState(true);

		const loadUsers = useCallback(async () => {
				console.log('DEBUG: loadUsers called');
			setLoading(true);
			try {
				const data = await getAllUsers();
				setUsers(data || []);
			} catch (err) {
				console.error('Error loading users', err);
				setUsers([]);
			} finally {
				setLoading(false);
			}
		}, []);

		useEffect(() => { loadUsers(); }, [loadUsers]);

	// Tipo mínimo para aceptar los datos que devuelve el formulario
	type UserFormDataPayload = Partial<{
		code: string;
		name: string;
		password: string;
		isActive: boolean;
		employee: string;
		group: string;
		estado: string;
		web: string;
		aplicaciones: string[];
		codigoPV: string;
		tarjetaMagnetica: string;
		perfilAcceso: string[];
	}>;

	const handleOpenUserScreen = (user: UserModel | null = null) => {
		const title = user ? `Editar Usuario: ${user.name || user.code}` : 'Crear Usuario';
			const content = (
			<UserFormWrapper
				user={user}
						onSave={async (data: UserFormDataPayload) => {
					const payload = {
						code: data.code ?? '',
						name: data.name ?? '',
						password: data.password ?? '',
								isActive: ('isActive' in data) ? Boolean(data.isActive) : true,
						employee: data.employee ?? '',
						group: data.group ?? '',
						estado: data.estado ?? '',
						web: data.web ?? '',
						aplicaciones: data.aplicaciones ?? [],
						codigoPV: data.codigoPV ?? '',
						tarjetaMagnetica: data.tarjetaMagnetica ?? '',
						perfilAcceso: data.perfilAcceso ?? [],
					};

					try {
						if (user && user.id) {
										await updateUser(user.id, payload);
						} else {
							await createUser(payload);
						}
						closeTopScreen();
						loadUsers();
					} catch (error) {
						console.error('Error saving user', error);
					}
				}}
			/>
		);
		openScreen(title, content);
	};

		// const handleEditFromShortcut = async (u: any) => {
		// 	if (!u) return;
		// 	setLoading(true);
		// 	try {
		// 		const full = getUserById ? await getUserById(u.id) : u;
		// 		handleOpenUserScreen(full || u);
		// 	} catch (err) { console.error(err); }
		// 	setLoading(false);
		// };

	const handleSoftDelete = async () => {
		if (!selectedRows || selectedRows.length === 0) return;
		try {
			const ids = selectedRows.map(r => r.id || r.code);
			await softDeleteUsersMassive(ids);
			setIsDeleteDialogOpen(false);
			setSelectedRows([]);
			loadUsers();
		} catch (err) { console.error(err); }
	};

	const columns = [
		{ field: 'code', header: 'Código' },
		{ field: 'name', header: 'Nombre' },
		{ field: 'employee', header: 'Empleado' },
		{ field: 'group', header: 'Grupo' },
		{ field: 'isActive', header: 'Activo', bodyTemplate: (u: UserModel) => (u.isActive ? 'Sí' : 'No') }
	];

	const buttons = [
		{
			label: '',
			color: 'btn-primary',
			textColor: 'text-light',
			icon: <FaSyncAlt className={loading ? 'spin-icon' : ''} />,
			onClick: () => loadUsers(),
			disabled: loading
		},
		{
			label: 'Agregar Usuario',
			color: 'btn-primary',
			textColor: 'text-light',
			onClick: () => handleOpenUserScreen(null)
		},
			{
				label: 'Eliminar',
				color: 'btn-delete',
				textColor: 'text-light',
				onClick: () => {
					if (selectedRows && selectedRows.length > 0) {
						setItemToDelete(selectedRows[0]);
						setIsDeleteDialogOpen(true);
					}
				}
			}
	];

	return (
		<div className="layout-container">
			<div className="table-wrapper-container">
				<ReusableTableFilterLayout
					moduleName="Gestión de Usuarios"
					data={users}
					rowKey="id"
					columns={columns}
					buttons={buttons}
					selectableField="id"
					selectedRows={selectedRows}
					setSelectedRows={setSelectedRows}
					loading={loading}
					emptyMessage={loading ? 'Cargando usuarios...' : 'No hay usuarios.'}
				/>
			</div>

			<DeleteConfirmationDialog
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleSoftDelete}
				item={itemToDelete}
				itemsCount={selectedRows.length}
				entityName="usuario"
				itemNameKey="name"
			/>
		</div>
	);
};

export default UserManagement;
