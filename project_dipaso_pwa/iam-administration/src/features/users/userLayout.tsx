// ============================================================================
// CAPA: Layout/Orquestación - USA @dipaso para la tabla
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useScreenContainer, ReusableTableFilterLayout } from '@dipaso/design-system';
import { FaSyncAlt } from 'react-icons/fa';
import DeleteConfirmationDialog from '@dipaso/design-system/dist/components/layout/deletedialogLayout';

import AddUserModal from "./AddUserModal";

// Mock data
const mockUsers = [
  { id: 'u1', code: 'AAFANADOR', name: 'Ashley Afanador', employee: '3192', group: 'General', isActive: true },
  { id: 'u2', code: 'ACASTILLO', name: 'Amy Castillo Bowen', employee: '1001', group: 'Ventas', isActive: true }
];

interface User {
  id: string;
  code: string;
  name: string;
  employee?: string;
  group?: string;
  isActive: boolean;
}

const UserManagement = () => {
  const { openScreen, closeTopScreen } = useScreenContainer();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsers(mockUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenUserScreen = useCallback((user: User | null = null) => {
    const title = user ? `Editar Usuario: ${user.name}` : 'Crear Usuario';

    const content = (
      <AddUserModal
        onClose={() => {
          closeTopScreen();
          loadUsers();
        }}
      />
    );

    openScreen(title, content);
  }, [openScreen, closeTopScreen, loadUsers]);

  const handleSoftDelete = useCallback(async () => {
    if (!selectedRows || selectedRows.length === 0) return;
    try {
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsers(users.filter(u => !selectedRows.includes(u)));
      setIsDeleteDialogOpen(false);
      setSelectedRows([]);
    } catch (err) {
      console.error('Error deleting users:', err);
    }
  }, [selectedRows, users]);

  const columns = [
    { field: 'code', header: 'Código' },
    { field: 'name', header: 'Nombre' },
    { field: 'employee', header: 'Empleado' },
    { field: 'group', header: 'Grupo' },
    {
      field: 'isActive',
      header: 'Activo',
      bodyTemplate: (u: User) => (
        <span className={`px-3 py-1 rounded text-sm font-medium ${
          u.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {u.isActive ? 'Sí' : 'No'}
        </span>
      )
    }
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
      },
      disabled: selectedRows.length === 0
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