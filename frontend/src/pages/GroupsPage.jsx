import { useEffect, useState } from 'react';
import GroupList from './Groups/GroupList';
import GroupDetail from './Groups/GroupDetail';
import AddGroupModal from './Groups/AddGroupModal';
import AddMemberModal from './Groups/AddMemberModal';
import { useLocation } from 'react-router-dom';
import API_URL from '../config';

import '../css/GroupsPage.css';



function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAddGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [selectedGroupId1, setSelectedGroupId1] = useState(null);
  const location = useLocation();

  useEffect(() => {

    // Manejar parámetros de la URL (para la lógica de búsqueda)
    const params = new URLSearchParams(location.search);
    const groupIdFromUrl = params.get('groupId');
    if (groupIdFromUrl) {
      setSelectedGroupId1(groupIdFromUrl);
    }

    fetch(`${API_URL}/groups`)
      .then(res => res.json())
      .then(data => {
        setGroups(data);
      })
      .catch(err => console.error(err));
  }, [location]);

  useEffect(() => {
    if (selectedGroupId) {
      fetch(`${API_URL}/api/groups/${selectedGroupId}`)
        .then(res => res.json())
        .then(data => {
          setSelectedGroup(data);
        })
        .catch(err => console.error(err));
    } else {
      setSelectedGroup(null);
    }
  }, [selectedGroupId]);

  // Obtener detalles del grupo seleccionado desde la URL
  useEffect(() => {
    if (selectedGroupId1) {
      fetch(`${API_URL}/api/groups/${selectedGroupId1}`)
        .then((res) => res.json())
        .then((data) => setSelectedGroup(data))
        .catch((err) => console.error(err));
    }
  }, [selectedGroupId1]);

  const handleSelectGroup = (id) => {
    setSelectedGroupId(id);
  };

  const handleAddGroup = () => {
    setAddGroupModalOpen(true);
  };

  const handleSaveGroup = (name) => {
    fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
      .then(res => res.json())
      .then(newGroup => {
        setGroups(prev => [...prev, newGroup]);
        setAddGroupModalOpen(false);
      })
      .catch(err => console.error(err));
  };

  const handleCloseAddGroup = () => {
    setAddGroupModalOpen(false);
  };

  const handleAddMember = () => {
    setAddMemberModalOpen(true);
  };

  const handleCloseAddMemberModal = () => {
    setAddMemberModalOpen(false);
  };


  const fetchGroupsAndStudents = () => {
    // Refrescar grupos
    fetch(`${API_URL}/api/groups`)
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error(err));

    // Refrescar alumnos
    fetch(`${API_URL}/api/users?role=student`)
      .then(res => res.json())
      .then(data => setStudents(data)) // Asegúrate de definir `setStudents` en el estado
      .catch(err => console.error(err));
  };

  // Llamar a fetchGroupsAndStudents después de añadir o eliminar un miembro
  const handleMemberAdded = (updatedGroup) => {
    setSelectedGroup(updatedGroup);
    fetchGroupsAndStudents(); // Refrescar datos después de añadir
  };

  const handleRemoveMember = (memberId) => {
    fetch(`${API_URL}/api/groups/${selectedGroupId}/removeMember`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: memberId }),
    })
      .then(res => res.json())
      .then(updatedGroup => {
        setSelectedGroup(updatedGroup);
        fetchGroupsAndStudents(); // Refrescar datos después de eliminar
      })
      .catch(err => console.error(err));
  };


  const handleUpdateGroupName = (newName) => {
    fetch(`${API_URL}/api/groups/${selectedGroupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
      .then(res => res.json())
      .then(updatedGroup => {
        console.log(updatedGroup);
        setSelectedGroup(updatedGroup);
        // Actualizar también la lista principal de grupos para reflejar el cambio en el sidebar
        setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
      })
      .catch(err => console.error(err));
  };

  const handleDatesChanged = (datesArray) => {
    if (!selectedGroupId) return;
    const formattedDates = datesArray.map(d => ({
      date: d.date.toISOString(),
      startTime: d.startTime,
      endTime: d.endTime
    }));


    fetch(`${API_URL}/api/groups/${selectedGroupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledDates: formattedDates })
    })
      .then(res => res.json())
      .then(updatedGroup => {
        setSelectedGroup(updatedGroup);
      })
      .catch(err => console.error(err));
  };

  const handleNotificationAdded = (newNotifications) => {
    if (!selectedGroup) return;
    // Actualizar el grupo en el estado con las notificaciones actualizadas
    setSelectedGroup(prev => ({ ...prev, notifications: newNotifications }));
  };
  const handleUpdateGroupRanking = (groupId, newRanking) => {
    fetch(`${API_URL}/api/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ranking: newRanking }),
    })
      .then((res) => res.json())
      .then((updatedGroup) => {
        setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
        if (selectedGroup && selectedGroup._id === updatedGroup._id) {
          setSelectedGroup(updatedGroup);
        }
      })
      .catch(err => console.error(err));
  };

  const handleUpdateGroupNotes = (groupId, newNotes) => {
    fetch(`${API_URL}/api/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tricks: newNotes })
    })
      .then((res) => res.json())
      .then((updatedGroup) => {
        setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
        if (selectedGroup && selectedGroup._id === updatedGroup._id) {
          setSelectedGroup(updatedGroup);
        }
      })
      .catch(err => console.error(err));
  };
const isMobile = window.innerWidth <= 768;

  return (
    <div>
{isMobile ? (
      <>
        <div className="mobile-group-selector">
          <select
            onChange={(e) => handleSelectGroup(e.target.value)}
            value={selectedGroupId || ''}
          >
            <option value="">Selecciona un grupo...</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddGroup}>+ Crear Grupo</button>
        </div>
        {selectedGroup && (
          <GroupDetail
            group={selectedGroup}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onUpdateGroupName={handleUpdateGroupName}
            onUpdateGroupRanking={handleUpdateGroupRanking}
            onUpdateGroupNotes={handleUpdateGroupNotes}
            onDatesChanged={handleDatesChanged}
            onNotificationAdded={handleNotificationAdded}
          />
        )}
      </>
    ) : (
      // Modo Desktop Normal
      <div style={{ display: 'flex' }}>
        <GroupList
          groups={groups}
          onSelectGroup={handleSelectGroup}
          selectedGroupId={selectedGroupId}
          onAddGroup={handleAddGroup}
        />
        <div style={{ display: 'flex', marginLeft: '257px', width: '100%' }}>
          <GroupDetail
            group={selectedGroup}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onUpdateGroupName={handleUpdateGroupName}
            onUpdateGroupRanking={handleUpdateGroupRanking}
            onUpdateGroupNotes={handleUpdateGroupNotes}
            onDatesChanged={handleDatesChanged}
            onNotificationAdded={handleNotificationAdded}
          />
        </div>

 </div>
    )}

        <AddGroupModal
          isOpen={isAddGroupModalOpen}
          onClose={handleCloseAddGroup}
          onSave={handleSaveGroup}
        />
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={handleCloseAddMemberModal}
          groupId={selectedGroupId}
          onMemberAdded={handleMemberAdded}
        />

      </div>
    
  );
}

export default GroupsPage;
