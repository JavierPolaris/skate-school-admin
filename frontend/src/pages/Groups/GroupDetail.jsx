import { useState } from 'react';
import CalendarPlaceholder from './CalendarPlaceholder';
import NotificationsSection from './NotificationsSection';
import API_URL from '../../config';

function GroupDetail({ group, onAddMember, onRemoveMember, onUpdateGroupName, onUpdateGroupNotes, onUpdateGroupRanking, onNotificationAdded }) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [editingRanking, setEditingRanking] = useState(false);
  const [tempRanking, setTempRanking] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!group) {
    return <div style={{ padding: '1rem' }}>Selecciona un grupo...</div>;
  }

  const handleEditClick = () => {
    setEditingName(true);
    setTempName(group.name);
  };

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameSave = () => {
    onUpdateGroupName(tempName);
    setEditingName(false);
  };

  const handleNameCancel = () => {
    setEditingName(false);
  };

  const handleEditRanking = () => {
    setEditingRanking(true);
    setTempRanking(group.ranking);
  };

  const handleRankingChange = (e) => {
    setTempRanking(e.target.value);
  };

  const handleRankingSave = () => {
    onUpdateGroupRanking(group._id, Number(tempRanking));
    setEditingRanking(false);
  };

  const handleRankingCancel = () => {
    setEditingRanking(false);
  };

  const handleEditNotes = () => {
    setEditingNotes(true);
    setTempNotes(group.tricks || '');
  };

  const handleNotesChange = (e) => {
    setTempNotes(e.target.value);
  };

  const handleNotesSave = () => {
    onUpdateGroupNotes(group._id, tempNotes);
    setEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setEditingNotes(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);

    fetch(`${API_URL}/groups/${group._id}/avatar`, {
      method: 'PUT',
      body: formData,
    })
      .then((res) => res.json())
      .then((updatedGroup) => {
        setUploadingAvatar(false);
        if (typeof onGroupUpdated === 'function') {
          onGroupUpdated(updatedGroup); // 💥 forzamos la actualización del grupo desde el padre
        }
      })
      .catch((err) => {
        console.error(err);
        setUploadingAvatar(false);
      });
  };


  // ✅ AQUÍ la función que guarda las fechas y lugares en la BBDD
  const handleDatesChanged = (datesArray) => {
    const formattedDates = datesArray.map(d => ({
      date: d.date.toISOString(),
      startTime: d.startTime,
      endTime: d.endTime,
      place: d.place || 'Skate park Bola de Oro',
    }));

    fetch(`${API_URL}/groups/${group._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledDates: formattedDates }),
    })
      .then(res => res.json())
      .then(updatedGroup => {
        console.log('Fechas actualizadas en backend:', updatedGroup);
      })
      .catch(err => console.error('Error actualizando fechas:', err));
  };

  return (
    <div style={{ padding: '1rem', flex: 1 }}>
      <h2 className="group-header">
        <div className="group-info-line">
          <img
            src={group.avatar ? group.avatar : '/placeholder.png'}
            alt="avatar"
            className="group-avatar"
          />

          {editingName ? (
            <>
              <input type="text" value={tempName} onChange={handleNameChange} />
              <button style={{ marginLeft: '5px', fontSize: '0.9rem', padding: '5px 20px' }} onClick={handleNameSave}>Guardar</button>
              <button style={{ marginLeft: '5px', fontSize: '0.9rem', padding: '5px 20px' }} onClick={handleNameCancel}>Cancelar</button>
            </>
          ) : (
            <>
              {group.name}
              {editingRanking ? (
                <>
                  <input
                    type="number"
                    value={tempRanking}
                    onChange={handleRankingChange}
                    style={{ width: '50px', margin: '10px' }}
                  />
                  <button style={{ marginLeft: '5px', fontSize: '0.9rem', padding: '5px 20px' }} onClick={handleRankingSave}>Guardar</button>
                  <button style={{ marginLeft: '5px', fontSize: '0.9rem', padding: '5px 20px' }} onClick={handleRankingCancel}>Cancelar</button>
                </>
              ) : (
                <>
                  <span style={{ marginInline: '10px', fontSize: '16px', color: '#ff9b00' }}>
                    #{group.ranking}
                  </span>

                  <button onClick={handleEditRanking} style={{ marginLeft: '5px', fontSize: '0.9rem', padding: '5px 20px' }}>
                    Editar Ranking
                  </button>
                </>
              )}
              <button onClick={handleEditClick} style={{ marginLeft: '5px', fontSize: '0.9rem', padding: '5px 20px' }}>Editar Nombre</button>
              <label htmlFor="avatar-upload" style={{
                background: 'linear-gradient(to right, #FF4081, #007997)',
                border: 'none',
                color: '#fff',
                padding: '5px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 600,
                margin: '8px 5px 20px 0',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                marginLeft: '5px',
                fontSize: '0.9rem'
              }}>
                {uploadingAvatar ? 'Subiendo...' : 'Cambiar Avatar'}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
      </h2>

      <div className="class-notes">
        <h3>Notas de clase</h3>
        {editingNotes ? (
          <>
            <textarea
              value={tempNotes}
              onChange={handleNotesChange}
              style={{ width: '100%', height: '100px' }}
            />
            <div>
              <button onClick={handleNotesSave}>Guardar notas</button>
              <button onClick={handleNotesCancel}>Cancelar</button>
            </div>
          </>
        ) : (
          <>
            <p>{group.tricks || 'No hay notas'}</p>
            <button onClick={handleEditNotes}>Editar notas</button>
          </>
        )}
      </div>

      <div className="integrant-calendar">
        <div className="group-integrant">
          <h4>Integrantes:</h4>
          <ul>
            {group.members && group.members.length > 0 ? (
              group.members.map((member) => (
                <li key={member._id}>
                  {member.name} - {member.email}
                  <button
                    className="remove-member-button"
                    onClick={() => onRemoveMember(member._id)}
                  >
                    <span className="text">Eliminar</span>
                    <span className="icon">✖</span>
                  </button>
                </li>
              ))
            ) : (
              <p>No hay integrantes</p>
            )}
          </ul>
          <button onClick={onAddMember}>Agregar integrante</button>
        </div>

        {/* 📅 Calendario con la función correcta */}
        <CalendarPlaceholder
          group={group}
          onDatesChanged={handleDatesChanged}
        />
      </div>

      <NotificationsSection
        groupId={group._id}
        notifications={group.notifications || []}
        onNotificationAdded={onNotificationAdded}
      />
    </div>
  );
}

export default GroupDetail;
