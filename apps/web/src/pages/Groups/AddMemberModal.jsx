import { useState, useEffect } from 'react';
import API_URL from '../../config';

function AddMemberModal({ isOpen, onClose, groupId, onMemberAdded }) {
  const [search, setSearch] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/users?role=student`)
        .then(res => res.json())
        .then(data => {
          setAllStudents(data);
          setFilteredStudents(data);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = allStudents.filter(student =>
      student.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [search, allStudents]);

  const handleSelectStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/addMember`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId }),
      });

      const updatedGroup = await response.json();
      if (response.ok) {
        onMemberAdded(updatedGroup); // Actualiza el estado del grupo
        onClose();

        // Refrescar la lista de alumnos para reflejar los cambios
        const updatedStudentsResponse = await fetch(`${API_URL}/users?role=student`);
        const updatedStudents = await updatedStudentsResponse.json();
        setAllStudents(updatedStudents); // Actualizar la lista de estudiantes
      } else {
        console.error('Error al agregar miembro:', updatedGroup.error);
      }
    } catch (err) {
      console.error('Error al agregar miembro:', err);
    }
  };


  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
        <h3 style={{ color: 'var(--kk-color-primary)' }}>Agregar Integrante</h3>
        <input
          type="text"
          placeholder="Buscar alumno"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '-webkit-fill-available' }}
        />
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            {filteredStudents.map(student => (
              <li key={student._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '0.5rem 0',
                color: '#000'
              }}>
                <span>{student.name} - {student.email}</span>
                <button onClick={() => handleSelectStudent(student._id)}>
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={onClose} style={{ marginTop: '1rem' }}>Cerrar</button>
      </div>
    </div>
  );
}

export default AddMemberModal;
