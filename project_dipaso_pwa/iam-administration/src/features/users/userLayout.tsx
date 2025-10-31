// ============================================================================
// CAPA: Layout/Orquestación - Tabla nativa de PrimeReact
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useScreenContainer } from '@dipaso/design-system';
import DeleteConfirmationDialog from '@dipaso/design-system/dist/components/layout/deletedialogLayout';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { ProgressSpinner } from 'primereact/progressspinner';

import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
// Importamos la configuración de servicios siguiendo el patrón de employees
import { userServiceConfig } from "./userserviceconfig";
import type { UserModel } from '../../models/api/userModel';

import 'primereact/resources/themes/lara-light-purple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './styles/UserLayout.css';

// Desestructuramos las funciones del servicio
const {
  getAllUsers,
  softDeleteUserMassive
} = userServiceConfig;

interface User {
  userId: string;
  userName: string;
  email: string;
  integrationCode?: string;
  isActive: boolean;
}

const UserManagement = () => {
  const { openScreen, closeTopScreen } = useScreenContainer();
  const toast = useRef<Toast>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [openFullScreen] = useState<boolean>(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // 🟢 USANDO API REAL CON CIFRADO (siguiendo patrón de usergroup)
      const usersData = await getAllUsers(false);
      const mappedUsers: User[] = usersData.map((u: UserModel) => ({
        userId: u.userId,
        userName: u.userName,
        email: u.email,
        integrationCode: u.integrationCode,
        isActive: u.isActive
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenUserScreen = useCallback((user: User | null = null) => {
    const title = user ? `Editar Usuario: ${user.userName}` : 'Crear Usuario';

    const content = user ? (
      <EditUserModal
        userId={user.userId}
        userName={user.userName}
        onClose={() => {
          closeTopScreen();
        }}
        onSaved={() => {
          closeTopScreen();
          loadUsers();
          toast.current?.show({
            severity: 'success',
            summary: 'Usuario Actualizado',
            detail: `El usuario ${user.userName} se ha actualizado correctamente.`,
            life: 3000
          });
        }}
      />
    ) : (
      <AddUserModal
        userData={null}
        onClose={() => {
          closeTopScreen();
        }}
        onSaved={() => {
          closeTopScreen();
          loadUsers();
          toast.current?.show({
            severity: 'success',
            summary: 'Usuario Creado',
            detail: 'El usuario se ha creado correctamente.',
            life: 3000
          });
        }}
      />
    );

    (openScreen as any)(title, content, { maximized: openFullScreen });
  }, [openScreen, closeTopScreen, loadUsers, openFullScreen]);

  const handleRowClick = useCallback((user: User) => {
    handleOpenUserScreen(user);
  }, [handleOpenUserScreen]);

  const onRowDoubleClick = useCallback((e: any) => {
    // Abrir modal de edición al hacer doble click en la fila
    handleOpenUserScreen(e.data as User);
  }, [handleOpenUserScreen]);

  const handleSoftDelete = useCallback(async () => {
    if (!selectedRows || selectedRows.length === 0) return;
    try {
      const userIds = selectedRows.map(u => u.userId);
      const userNames = selectedRows.map(u => u.userName).join(', ');
      // TODO: Obtener el ID del usuario actual del contexto de autenticación
      const updatedByUserId = 'current-user-id';
      await softDeleteUserMassive(userIds, updatedByUserId);
      setIsDeleteDialogOpen(false);
      setSelectedRows([]);
      await loadUsers(); // Recargar la lista después de eliminar

      toast.current?.show({
        severity: 'success',
        summary: 'Usuarios Eliminados',
        detail: `Se eliminaron ${selectedRows.length} usuario(s): ${userNames}`,
        life: 3000
      });
    } catch (err) {
      console.error('Error deleting users:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron eliminar los usuarios.',
        life: 3000
      });
    }
  }, [selectedRows, loadUsers]);

  // Templates para las columnas
  const userNameBodyTemplate = (u: User) => (
    <span
      onClick={() => handleRowClick(u)}
      style={{ cursor: 'pointer', textAlign: 'left', display: 'block' }}
    >
      {u.userName}
    </span>
  );

  const emailBodyTemplate = (u: User) => (
    <span
      onClick={() => handleRowClick(u)}
      style={{ cursor: 'pointer', textAlign: 'left', display: 'block' }}
    >
      {u.email}
    </span>
  );

  const integrationCodeBodyTemplate = (u: User) => (
    <span
      onClick={() => handleRowClick(u)}
      style={{ cursor: 'pointer', textAlign: 'center', display: 'block' }}
    >
      {u.integrationCode || '-'}
    </span>
  );

  const isActiveBodyTemplate = (u: User) => (
    <div
      onClick={() => handleRowClick(u)}
      style={{ cursor: 'pointer', textAlign: 'left' }}
    >
      <span
        className={`px-3 py-1 rounded text-sm font-medium ${
          u.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {u.isActive ? 'Sí' : 'No'}
      </span>
    </div>
  );

  return (
    <div className="user-management-container">
      <Toast ref={toast} />

      {/* Header con título y botones */}
      <div className="user-management-header">
        <h1 className="user-management-title">Gestión de Usuarios</h1>
        <div className="user-management-actions">
          <Button
            icon="pi pi-refresh"
            className="p-button-outlined"
            onClick={() => loadUsers()}
            disabled={loading}
            tooltip="Recargar"
          />
          <Button
            label="Agregar Usuario"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => handleOpenUserScreen(null)}
          />
          <Button
            label="Eliminar"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={() => {
              if (selectedRows && selectedRows.length > 0) {
                setItemToDelete(selectedRows[0]);
                setIsDeleteDialogOpen(true);
              }
            }}
            disabled={selectedRows.length === 0}
          />
        </div>
      </div>

      {/* Tabla con wrapper para scroll horizontal */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <ProgressSpinner />
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="user-table-wrapper">
            <DataTable
              value={users}
              header={
                <div className="table-header-custom">
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      placeholder="Buscar por usuario"
                    />
                  </span>
                  <span className="table-record-count">{users.length} usuarios</span>
                </div>
              }
              globalFilter={globalFilter}
              selection={selectedRows}
              onSelectionChange={(e) => setSelectedRows(e.value)}
              selectionMode="multiple"
              dataKey="userId"
              stripedRows
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Registros por página: {first} - {last} de {totalRecords}"
              emptyMessage="No hay usuarios disponibles"
              onRowDoubleClick={onRowDoubleClick}
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column
                field="userName"
                header="Nombre de Usuario"
                body={userNameBodyTemplate}
                style={{ minWidth: '200px' }}
              />
              <Column
                field="email"
                header="Email"
                body={emailBodyTemplate}
                style={{ minWidth: '250px' }}
              />
              <Column
                field="integrationCode"
                header="Código de Integración"
                body={integrationCodeBodyTemplate}
                style={{ minWidth: '150px', textAlign: 'center' }}
              />
              <Column
                field="isActive"
                header="Activo"
                body={isActiveBodyTemplate}
                style={{ minWidth: '100px', textAlign: 'left' }}
              />
            </DataTable>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleSoftDelete}
        item={itemToDelete}
        itemsCount={selectedRows.length}
        entityName="usuario"
        itemNameKey="userName"
      />
    </div>
  );
};

export default UserManagement;