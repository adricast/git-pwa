// src/features/usersgroup/GroupCardManagerWrapper.tsx
import React, { useEffect } from 'react';
import CardManager from '../../components/layout/cardmanager2Layout';
import { useCardManager } from './../../components/cardcontainer2/usercardmanager';
import GroupManagement from './groupuserLayout';
import { FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
// Componente que sirve solo como título de la tarjeta
const GroupCardTitle: React.FC = () => (
  <>
    <FaUsers style={{ marginRight: '8px' }} />
    Gestión Principal de Grupos
  </>
);

// Componente que inicializa CardManager con la primera ficha.
const GroupInitializer: React.FC = () => {
  const { addCard, isCardOpen } = useCardManager();
  const navigate = useNavigate(); 
  useEffect(() => {
    const initialCardId = 'initial-groups-table';

    if (!isCardOpen(initialCardId)) {
      addCard(
        <GroupCardTitle />,  // ✅ usamos el componente aquí
        <GroupManagement />,  // contenido de la ficha
        initialCardId ,
        () => navigate(-1) 
      );
    }
  }, [addCard, isCardOpen]);

  return null;
};

const GroupCardManagerWrapper: React.FC = () => {
  return (
    <CardManager>
      <GroupInitializer />
    </CardManager>
  );
};

export default GroupCardManagerWrapper;
