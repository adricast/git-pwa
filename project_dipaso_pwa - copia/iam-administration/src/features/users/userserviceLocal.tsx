// Fachada de servicios CRUD para usuarios

export interface UserCreatePayload {
	code: string;
	name: string;
	password: string;
	employee: string;
	group: string;
	isActive: boolean;
	// ...otros campos
}

export interface UserUpdatePayload {
	code?: string;
	name?: string;
	password?: string;
	employee?: string;
	group?: string;
	isActive?: boolean;
	// ...otros campos
}
export interface UserModel {
	id: string;
	code: string;
	name: string;
	password?: string;
	employee?: string;
	group?: string;
	isActive: boolean;
	aplicaciones?: string[];
	codigoPV?: string;
	tarjetaMagnetica?: string;
	perfilAcceso?: string[];
}

export const userServiceLocal = {
	// Dev: mock storage in memory
	_store: [] as UserModel[],

	getAllUsers: async (): Promise<UserModel[]> => {
		// return from in-memory store or default mock
		if (userServiceLocal._store.length === 0) {
			userServiceLocal._store = [
				{ id: 'u1', code: 'AAFANADOR', name: 'Ashley Afanador', employee: '3192', group: 'General', isActive: true },
				{ id: 'u2', code: 'ACASTILLO', name: 'Amy Castillo Bowen', employee: '1001', group: 'Ventas', isActive: true }
			];
		}
		return userServiceLocal._store;
	},
	getUserById: async (userId: string): Promise<UserModel | null> => {
		const found = userServiceLocal._store.find((u) => u.id === userId || u.code === userId);
		return found || null;
	},
	createUser: async (userData: UserCreatePayload): Promise<UserModel> => {
		const newUser: UserModel = { id: `u${Date.now()}`, ...userData } as UserModel;
		userServiceLocal._store.push(newUser);
		return newUser;
	},
	updateUser: async (userId: string, userPatch: UserUpdatePayload): Promise<UserModel | null> => {
		const idx = userServiceLocal._store.findIndex((u) => u.id === userId || u.code === userId);
		if (idx >= 0) {
			userServiceLocal._store[idx] = { ...userServiceLocal._store[idx], ...userPatch } as UserModel;
			return userServiceLocal._store[idx];
		}
		return null;
	},
	softDeleteUsersMassive: async (userIds: string[]): Promise<{ message: string; success: boolean }> => {
		// emulate soft delete by setting isActive false
		userServiceLocal._store = userServiceLocal._store.map((u) => userIds.includes(u.id) || userIds.includes(u.code) ? { ...u, isActive: false } : u);
		return { message: 'Eliminados', success: true };
	},
	changeUserStatus: async (userId: string, isActive: boolean): Promise<UserModel | null> => {
		const u = userServiceLocal._store.find((x) => x.id === userId || x.code === userId);
		if (u) { u.isActive = isActive; return u; }
		return null;
	},
};
