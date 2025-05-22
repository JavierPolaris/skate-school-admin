import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API_URL from '../config';
import '../css/StudentsPage.css';


function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  // const [newStudent, setNewStudent] = useState({
  //   name: '',
  //  email: '',
  //   phone: '',
  //   groupId: '',
  //  paymentMethod: '',
  //   discount: 0,
  //  });
  const [editStudent, setEditStudent] = useState(null);
  const [error, setError] = useState('');
  const [highlightedStudentId, setHighlightedStudentId] = useState(null); // ID del usuario destacado
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10); // Número de alumnos por página
  const [expandedStudentId, setExpandedStudentId] = useState(null); // ID del alumno expandido

  // Obtener alumnos y grupos al cargar la página
  useEffect(() => {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId) {
      setHighlightedStudentId(userId);
    }

    fetch(`${API_URL}/users/students`) // Obtener alumnos
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));

    fetch(`${API_URL}/groups`) // Obtener grupos
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch((err) => console.error(err));
  }, [location]);

  // Crear un nuevo alumno
  //  const handleCreateStudent = () => {
  //    fetch(`${API_URL}/api/users/students`, {
  //      method: 'POST',
  //      headers: { 'Content-Type': 'application/json' },
  //      body: JSON.stringify(newStudent),
  //    })
  //      .then((res) => res.json())
  //      .then((data) => {
  //        if (data.error) {
  //          setError(data.error);
  //        } else {
  //          setStudents((prev) => [...prev, data]);
  //          setNewStudent({
  //            name: '',
  //            email: '',
  //            phone: '',
  //            groupId: '',
  //            paymentMethod: '',
  //            discount: 0,
  //          });
  //        }
  //      })
  //      .catch((err) => console.error(err));
  //  };

  const fetchStudentsAndGroups = () => {
    fetch(`${API_URL}/api/users/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));

    fetch(`${API_URL}/api/groups`)
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch((err) => console.error(err));
  };

  // Llamar a esta función después de cualquier acción
  const handleUpdateStudent = () => {
    console.log('Actualizando alumno con ID:', editStudent._id);  // Verifica el ID del alumno

    fetch(`${API_URL}/users/students/${editStudent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editStudent),  // Incluye el nuevo método de pago aquí
    })
      .then((res) => res.json())
      .then((updatedStudent) => {
        console.log('Alumno actualizado:', updatedStudent);  // Ver el alumno actualizado

        if (updatedStudent.error) {
          setError(updatedStudent.error);
        } else {
          fetchStudentsAndGroups(); // Refrescar datos
          setEditStudent(null); // Cierra el modal
        }
      })
      .catch((err) => console.error('Error al actualizar el alumno:', err));
  };




  const handleDeleteStudent = (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este alumno?');
    if (!confirmDelete) return;

    fetch(`${API_URL}/api/users/students/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then(() => {
        setStudents((prev) => prev.filter((student) => student._id !== id));
      })
      .catch((err) => console.error(err));
  };



  // Manejar el cambio de página
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  const totalPages = Math.ceil(students.length / studentsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="students-page">
      <h2>Gestión de Alumnos</h2>

      {/* Formulario para añadir alumno 
      <div>
        <h3>Añadir Nuevo Alumno</h3>
        <input
          type="text"
          placeholder="Nombre"
          value={newStudent.name}
          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newStudent.email}
          onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={newStudent.phone}
          onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
        />
        <select
          value={newStudent.groupId}
          onChange={(e) => setNewStudent({ ...newStudent, groupId: e.target.value })}
        >
          <option value="">Seleccionar Grupo</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
        <select
          value={newStudent.paymentMethod}
          onChange={(e) => setNewStudent({ ...newStudent, paymentMethod: e.target.value })}
        >
          <option value="">Forma de Pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="bizum">Bizum</option>
          <option value="transferencia">Transferencia</option>
        </select>
        <input
          type="number"
          placeholder="Descuento (%)"
          value={newStudent.discount}
          onChange={(e) => setNewStudent({ ...newStudent, discount: parseInt(e.target.value, 10) })}
        />
        <button onClick={handleCreateStudent}>Crear Alumno</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
*/}

      {/* Tabla de alumnos */}
      <h3>Lista de Alumnos</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Grupo</th>
            <th>Pago</th>
            <th>Descuento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  {currentStudents.map((student) => (
    <tr key={student._id} className={student._id === highlightedStudentId ? 'highlight' : ''}>
      <td data-label="Nombre" onClick={() => setExpandedStudentId(expandedStudentId === student._id ? null : student._id)}>
        {student.name} 
        <span className="toggle-arrow">{expandedStudentId === student._id ? '▲' : '▼'}</span>
      </td>
      {expandedStudentId === student._id || window.innerWidth > 768 ? (
        <>
          <td data-label="Email">{student.email}</td>
          <td data-label="Teléfono">{student.phone}</td>
          <td data-label="Grupo">{student.groupId?.name || 'Sin Grupo'}</td>
          <td data-label="Pago">{student.paymentMethod || 'No Asignado'}</td>
          <td data-label="Descuento">{student.discount}%</td>
          <td data-label="Acciones">
            <button onClick={() => setEditStudent(student)}>Editar</button>
            <button onClick={() => handleDeleteStudent(student._id)}>Eliminar</button>
          </td>
        </>
      ) : null}
    </tr>
  ))}
</tbody>

      </table>
      <div className="pagination">
  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
  <span>Página {currentPage} de {totalPages}</span>
  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
</div>

      {/* Modal para editar alumno */}
      {editStudent && (
        <div className="modal">
          <h3>Editar Alumno</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={editStudent.name}
            onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={editStudent.email}
            onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={editStudent.phone}
            onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value })}
          />
          <select
            value={editStudent.groupId || ''}
            onChange={(e) => setEditStudent({ ...editStudent, groupId: e.target.value })}
          >
            <option value="">Seleccionar Grupo</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <select
            value={editStudent.paymentMethod || ''}
            onChange={(e) =>
              setEditStudent({ ...editStudent, paymentMethod: e.target.value })
            }
          >
            <option value="">Forma de Pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="bizum">Bizum</option>
            <option value="transferencia">Transferencia</option>
          </select>
          <input
            type="number"
            placeholder="Descuento (%)"
            value={editStudent.discount || 0}
            onChange={(e) =>
              setEditStudent({ ...editStudent, discount: parseInt(e.target.value, 10) })
            }
          />
          <button onClick={handleUpdateStudent}>Guardar Cambios</button>
          <button onClick={() => setEditStudent(null)}>Cancelar</button>
        </div>
      )}

    </div>
  );
}

export default StudentsPage;
