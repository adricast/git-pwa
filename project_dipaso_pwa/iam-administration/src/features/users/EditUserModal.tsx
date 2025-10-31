// ============================================================================
// Modal de edición de usuario (4 PASOS EN UN SOLO FORMULARIO)
// ============================================================================

import React, { useState, useEffect } from "react";
import { userServiceConfig } from "./userserviceconfig";
import { personServiceConfig } from "../employ/employserviceconfig";
import type { UserModel } from "../../models/api/userModel";
import type { PersonModel } from "../../models/api/personModel";
import { Button } from 'primereact/button';
import { Fieldset } from 'primereact/fieldset';
import { ProgressSpinner } from 'primereact/progressspinner';

import { AddressTable } from "./content/AddressTable";
import { UserConfiguration } from "./content/UserConfiguration";
import {
  ADDRESS_TABLE_COLUMNS,
  ADDRESS_TABLE_CONFIG,
  MOCK_DIRECCIONES,
  MOCK_USER_GROUPS,
  MOCK_POLICIES_TREE,
  type Direccion,
  type UserGroup
} from "./data/userConfig";

import 'primereact/resources/themes/lara-light-purple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import "./styles/AddUserModal.sass";

interface EditUserModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSaved: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ userId, userName, onClose, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserModel | null>(null);

  // Estados para los 4 pasos
  const [selectedPerson, setSelectedPerson] = useState<PersonModel | null>(null);
  const [personLoadError, setPersonLoadError] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<UserGroup[] | null>(null);
  const [selectedPolicies, setSelectedPolicies] = useState<Record<string, boolean>>({});
  const [direcciones, setDirecciones] = useState<Direccion[]>(MOCK_DIRECCIONES);
  const [selectedDirecciones, setSelectedDirecciones] = useState<Direccion[]>([]);

  // Función pública para intentar cargar persona por id (se puede reutilizar / llamar desde UI)
  const fetchPersonById = async (personId: string | undefined | null) => {
    if (!personId) return null;
    try {
      setPersonLoadError(null);
      const person = await personServiceConfig.getPersonByUuid(personId);
      setSelectedPerson(person);
      setPersonLoadError(null);
      return person;
    } catch (err) {
      console.error('Error al cargar persona con id (fetchPersonById):', personId, err);
      const message = err instanceof Error ? err.message : String(err);
      setPersonLoadError(message || 'Error desconocido al cargar persona');
      setSelectedPerson(null);
      return null;
    }
  };

  // Resolver employee/person id desde el objeto UserModel de forma robusta
  const resolveEmployeeIdFromUser = (u?: UserModel | null): string | null => {
    if (!u) return null;
    const fu = u as unknown as Record<string, unknown>;
    const emp = (fu.employee as Record<string, unknown> | undefined) || undefined;
    const ppl = (fu.people as Record<string, unknown> | undefined) || undefined;
    return (fu.employeeId as string | undefined)
      || (fu.employee_id as string | undefined)
      || (emp && ((emp.employeeId as string | undefined) || (emp.personId as string | undefined)))
      || (ppl && (ppl.personId as string | undefined))
      || null;
  };

  // Cargar datos del usuario
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar datos del usuario
        const fullUser = await userServiceConfig.getUserByUuid(userId);
  // Debug: mostrar respuesta completa del backend para este usuario
  // Útil para depurar qué ID trae employeeId / people
  // Puedes copiar este objeto desde la consola si lo necesitas para que lo revise.
  console.debug('Debug fullUser (GET /api/user/{id}):', fullUser);
        setUserData(fullUser);
        // IMPORTANTE: La relación User -> Person se hace mediante employeeId
        // User.employeeId apunta a Person.personId

        // (Se usará la función fetchPersonById definida en el scope del componente)

        // Intentar primero con el objeto people incluido en la respuesta
        let personAssigned = false;
        if (fullUser.people) {
          const nested = fullUser.people;
          // Si viene completo, lo usamos; si viene incompleto, intentamos fetch por personId
          if (nested.employee) {
            setSelectedPerson(nested);
            setPersonLoadError(null);
            personAssigned = true;
          } else if (nested.personId) {
            const got = await fetchPersonById(nested.personId);
            if (got) personAssigned = true;
          }
        }

        // Obtener employeeId de forma robusta desde el payload del usuario (sin usar 'any')
  const fu = fullUser as unknown as Record<string, unknown>;
        const emp = (fu.employee as Record<string, unknown> | undefined) || undefined;
        const ppl = (fu.people as Record<string, unknown> | undefined) || undefined;
        const employeeId = (fu.employeeId as string | undefined)
          || (fu.employee_id as string | undefined)
          || (emp && ((emp.employeeId as string | undefined) || (emp.personId as string | undefined)))
          || (ppl && (ppl.personId as string | undefined))
          || null;

        // Si aún no asignamos la persona y existe employeeId, lo intentamos
        if (!personAssigned && employeeId) {
          await fetchPersonById(String(employeeId));
        }

        // Pre-cargar grupos (múltiples)
        if (fullUser.groups && fullUser.groups.length > 0) {
          const groups = fullUser.groups.map(group => ({
            id: group.userGroupId || '',
            name: group.groupName || ''
          }));
          setSelectedGroups(groups);
        }

        // TODO: Cargar políticas y direcciones reales del usuario
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implementar la llamada real al servicio de actualización
      await new Promise(resolve => setTimeout(resolve, 1000));

      const payload = {
        employee: selectedPerson,
        configuration: {
          userGroups: (selectedGroups || []).map(group => ({
            id: group.id,
            name: group.name
          })),
          policies: Object.keys(selectedPolicies).filter(k => selectedPolicies[k])
        },
        addresses: direcciones
      };

      console.log('Guardando usuario:', payload);
      onSaved();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDireccion = () => {
    console.log('Agregar nueva dirección');
  };

  const handleDeleteDirecciones = () => {
    if (selectedDirecciones.length > 0) {
      const newDirecciones = direcciones.filter(
        dir => !selectedDirecciones.includes(dir)
      );
      setDirecciones(newDirecciones);
      setSelectedDirecciones([]);
    }
  };

  if (loading) {
    return (
      <div className="user-modal-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <ProgressSpinner />
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando datos del usuario...</p>
      </div>
    );
  }

  return (
    <div className="user-modal-container">
      <div className="modal-header">
        <h2>Editando: {userName}</h2>
        {userData && (
          <p style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
            Email: {userData.email} | Código: {userData.integrationCode || 'N/A'}
          </p>
        )}
      </div>

      <div className="edit-content-all-steps" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
        {/* PASO 1: Información del Empleado (Solo lectura - viene del backend) */}
        <Fieldset legend="1. Información del Empleado" className="user-fieldset mb-4">
          {selectedPerson ? (
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Nombre:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                    {selectedPerson.givenName} {selectedPerson.surName}
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Teléfono:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                    {selectedPerson.phoneNumber || 'N/A'}
                  </p>
                </div>
                {selectedPerson.employee && (
                  <>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Código de Empleado:</strong>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                        {selectedPerson.employee.employeeCode}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Estado:</strong>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
                        {selectedPerson.employee.isActive ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
              <>
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Este usuario no tiene un empleado asociado.
                </p>
                {personLoadError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.875rem' }}>
                      Error al cargar datos de la persona: {personLoadError}
                    </p>
                    <Button
                      label="Reintentar"
                      icon="pi pi-refresh"
                      className="p-button-text p-button-sm"
                      onClick={async () => {
                        const id = resolveEmployeeIdFromUser(userData) || null;
                        if (id) await fetchPersonById(id);
                      }}
                    />
                  </div>
                )}
              </>
          )}
        </Fieldset>

        {/* PASO 2: Configuración */}
        <Fieldset legend="2. Configuración" className="user-fieldset mb-4">
          <UserConfiguration
            userGroups={MOCK_USER_GROUPS}
            selectedGroup={selectedGroups}
            onGroupChange={setSelectedGroups}
            policiesTree={MOCK_POLICIES_TREE}
            selectedPolicies={selectedPolicies}
            onPoliciesChange={setSelectedPolicies}
          />
        </Fieldset>

        {/* PASO 3: Sucursales */}
        <Fieldset legend="3. Sucursales" className="user-fieldset mb-4">
          <AddressTable
            data={direcciones}
            columns={ADDRESS_TABLE_COLUMNS}
            {...ADDRESS_TABLE_CONFIG}
            selectedItems={selectedDirecciones}
            onSelectionChange={setSelectedDirecciones}
            onDelete={handleDeleteDirecciones}
            onAdd={handleAddDireccion}
          />
        </Fieldset>

        {/* PASO 4: Autenticación */}
        <Fieldset legend="4. Autenticación" className="user-fieldset mb-4">
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            Configuración de autenticación (próximamente)
          </p>
        </Fieldset>
      </div>

      {/* Botones de acción */}
      <div className="stepper-actions" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
        <Button
          label="Cancelar"
          className="p-button-secondary p-button-outlined"
          onClick={onClose}
          disabled={saving}
        />
        <Button
          label={saving ? 'Guardando...' : 'Guardar'}
          className="p-button-success"
          onClick={handleSave}
          disabled={saving}
          icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        />
      </div>
    </div>
  );
};

export default EditUserModal;
