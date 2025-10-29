// ============================================================================
// CAPA: Layout/Orquestación - Modal principal para crear/editar usuarios
// ============================================================================

import React, { useState, useEffect, useRef } from "react";
import { personServiceConfig } from "../employ/employserviceconfig";
import type { PersonModel } from "../../models/api/personModel";
import { EmployeeSelector } from "./content/EmployeeSelector";
import { AddressTable } from "./content/AddressTable";
import { UserConfiguration } from "./content/UserConfiguration";
import {
  EMPLOYEE_SELECTOR_COLUMNS,
  EMPLOYEE_SELECTOR_CONFIG,
  ADDRESS_TABLE_COLUMNS,
  ADDRESS_TABLE_CONFIG,
  MOCK_DIRECCIONES,
  MOCK_USER_GROUPS,
  MOCK_POLICIES_TREE,
  type Direccion,
  type UserGroup
} from "./data/userConfig";

// PrimeReact imports
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from 'primereact/button';
import { Fieldset } from 'primereact/fieldset';

// PrimeReact styles
import 'primereact/resources/themes/lara-light-purple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Local styles
import "./styles/AddUserModal.sass";

interface AddUserModalProps {
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose }) => {
  const stepperRef = useRef<any>(null);
  const [people, setPeople] = useState<PersonModel[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonModel | null>(null);

  // Estado para configuración (grupos y políticas)
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [selectedPolicies, setSelectedPolicies] = useState<Record<string, boolean>>({});

  // Estado para direcciones
  const [direcciones, setDirecciones] = useState<Direccion[]>(MOCK_DIRECCIONES);
  const [selectedDirecciones, setSelectedDirecciones] = useState<Direccion[]>([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const data = await personServiceConfig.getActivePeople();
        setPeople(data);
      } catch {
        setPeople([]);
      }
    };
    fetchPeople();
  }, []);

  const handleNext = () => {
    if (stepperRef.current) {
      stepperRef.current.nextCallback();
    }
  };

  const handleAddDireccion = () => {
    console.log('Agregar nueva dirección');
    // Aquí puedes abrir un diálogo o formulario para agregar una dirección
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

  /**
   * Construye el payload con toda la información del usuario para enviar al backend
   */
  const buildUserPayload = () => {
    // Extraer solo las claves de políticas seleccionadas (el valor es true directamente)
    const selectedPolicyKeys = Object.keys(selectedPolicies).filter(
      key => selectedPolicies[key] === true
    );

    const payload = {
      // Paso 1: Información del empleado seleccionado
      employee: selectedPerson ? {
        personId: selectedPerson.personId,
        givenName: selectedPerson.givenName,
        surName: selectedPerson.surName,
        documentNumber: selectedPerson.documents?.[0]?.docNumber || '',
        documentType: selectedPerson.documents?.[0]?.docTypeId || ''
      } : null,

      // Paso 2: Configuración (grupo y políticas)
      configuration: {
        userGroup: selectedGroup ? {
          id: selectedGroup.id,
          name: selectedGroup.name
        } : null,
        policies: selectedPolicyKeys
      },

      // Paso 3: Direcciones asignadas
      addresses: direcciones.map(dir => ({
        id: dir.id,
        type: dir.tipo,
        country: dir.pais,
        province: dir.provincia,
        city: dir.ciudad,
        address: dir.direccion,
        postalCode: dir.codigoPostal
      })),

      // Metadata
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    return payload;
  };

  /**
   * Maneja el guardado final del usuario
   */
  const handleSaveUser = () => {
    const payload = buildUserPayload();
    console.log('=== PAYLOAD DE USUARIO ===');
    console.log(JSON.stringify(payload, null, 2));

    // Aquí puedes hacer la llamada al API
    // await userService.createUser(payload);

    alert('Usuario creado exitosamente!\nRevisa la consola para ver el payload.');
    onClose();
  };

  return (
    <div className="user-modal-container">
      <div className="modal-header">
        <h2>Nuevo Usuario</h2>
      </div>

      <Stepper ref={stepperRef} linear className="user-stepper">
        {/* Paso 1: Selección de Empleado */}
        <StepperPanel header="Selección Empleado">
          <div className="stepper-content">
            <Fieldset legend="Empleado" className="user-fieldset">
              <EmployeeSelector
                data={people}
                columns={EMPLOYEE_SELECTOR_COLUMNS}
                {...EMPLOYEE_SELECTOR_CONFIG}
                onSelect={setSelectedPerson}
                selectedItem={selectedPerson}
              />
            </Fieldset>

            <div className="stepper-actions">
              <Button
                label="Cancelar"
                className="p-button-secondary p-button-outlined"
                onClick={onClose}
              />
              <Button
                label="Siguiente"
                className="p-button-primary"
                onClick={handleNext}
                disabled={!selectedPerson}
              />
            </div>
          </div>
        </StepperPanel>

        {/* Paso 2: Configuración */}
        <StepperPanel header="Configuración">
          <div className="stepper-content">
            <Fieldset legend="Grupo de usuarios" className="user-fieldset">
              <UserConfiguration
                userGroups={MOCK_USER_GROUPS}
                selectedGroup={selectedGroup}
                onGroupChange={setSelectedGroup}
                policiesTree={MOCK_POLICIES_TREE}
                selectedPolicies={selectedPolicies}
                onPoliciesChange={setSelectedPolicies}
              />
            </Fieldset>

            <div className="stepper-actions">
              <Button
                label="Cancelar"
                className="p-button-secondary p-button-outlined"
                onClick={onClose}
              />
              <Button
                label="Siguiente"
                className="p-button-primary"
                onClick={handleNext}
              />
            </div>
          </div>
        </StepperPanel>

        {/* Paso 3: Sucursales */}
        <StepperPanel header="Sucursales">
          <div className="stepper-content">
            <Fieldset legend="Listado de Direcciones" className="user-fieldset">
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

            <div className="stepper-actions">
              <Button
                label="Cancelar"
                className="p-button-secondary p-button-outlined"
                onClick={onClose}
              />
              <Button
                label="Siguiente"
                className="p-button-primary"
                onClick={handleNext}
              />
            </div>
          </div>
        </StepperPanel>

        {/* Paso 4: Autenticación */}
        <StepperPanel header="Autenticación">
          <div className="stepper-content">
            <Fieldset legend="Configuración de Autenticación" className="user-fieldset">
              <p>Contenido de autenticación aquí...</p>
            </Fieldset>

            <div className="stepper-actions">
              <Button
                label="Cancelar"
                className="p-button-secondary p-button-outlined"
                onClick={onClose}
              />
              <Button
                label="Guardar"
                className="p-button-success"
                onClick={handleSaveUser}
              />
            </div>
          </div>
        </StepperPanel>
      </Stepper>
    </div>
  );
};

export default AddUserModal;
