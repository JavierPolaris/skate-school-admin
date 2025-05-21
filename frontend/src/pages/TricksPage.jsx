import { useState, useEffect } from "react";
import Header from "../components/Header";
import "../css/TricksPage.css";
import { ImArrowDown, ImArrowUp } from "react-icons/im";
import more from "../assets/more.png";
import API_URL from '../config';

function TricksPage() {
  const [tricks, setTricks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrick, setEditingTrick] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' o 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [tricksPerPage] = useState(10);
  const [expandedTrickId, setExpandedTrickId] = useState(null);

  // Calculamos paginación
  const indexOfLastTrick = currentPage * tricksPerPage;
  const indexOfFirstTrick = indexOfLastTrick - tricksPerPage;
  const getSortedTricks = () => {
    let sorted = [...tricks];
    if (activeFilter === "like") {
      sorted.sort((a, b) => sortOrder === "asc" ? a.likes - b.likes : b.likes - a.likes);
    } else if (activeFilter === "view") {
      sorted.sort((a, b) => sortOrder === "asc" ? a.views - b.views : b.views - a.views);
    } else if (activeFilter === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
    return sorted.sort((a, b) => b.highlighted - a.highlighted);
  };

  const currentTricks = getSortedTricks().slice(indexOfFirstTrick, indexOfLastTrick);

  const totalPages = Math.ceil(tricks.length / tricksPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };
  const [formData, setFormData] = useState({
    name: "",
    author: "",
    url: "",
  });

  useEffect(() => {
    fetchTricks();
  }, []);

  const fetchTricks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tricks`);
      const data = await response.json();
      const sorted = data.sort((a, b) => b.highlighted - a.highlighted);
      setTricks(sorted);
    } catch (error) { console.error("Error al obtener trucos:", error); }
  };

  const handleFilterClick = (filter) => {
    if (activeFilter === filter) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setActiveFilter(filter);
      setSortOrder('asc');
    }
  };



  const handleOpenModal = (trick = null) => {
    setEditingTrick(trick);
    setFormData(trick || { name: "", author: "", url: "" });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ name: "", author: "", url: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const newTrick = {
        ...formData,
        video: formData.url,
        views: editingTrick ? editingTrick.views : 0,
        likes: editingTrick ? editingTrick.likes : 0,
        completed: editingTrick ? editingTrick.completed : 0,
        dateAdded: editingTrick
          ? editingTrick.dateAdded
          : new Date().toISOString(),
      };

      if (editingTrick) {
        // Editar truco existente
        const response = await fetch(`${API_URL}/api/tricks/${editingTrick._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTrick),
          }
        );
        const updatedTrick = await response.json();
        setTricks((prev) =>
          prev.map((trick) =>
            trick._id === updatedTrick._id ? updatedTrick : trick
          )
        );
      } else {
        // Crear nuevo truco
        const response = await fetch(`${API_URL}/api/tricks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTrick),
        });
        const savedTrick = await response.json();
        setTricks((prev) => [...prev, savedTrick]);
      }
    } catch (error) {
      console.error("Error al guardar el truco:", error);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/tricks/${id}`, {
        method: "DELETE",
      });
      setTricks((prev) => prev.filter((trick) => trick._id !== id));
    } catch (error) {
      console.error("Error al eliminar truco:", error);
    }
  };

  const getYouTubeThumbnail = (url) => {
    if (!url) return 'https://via.placeholder.com/100'; // Miniatura predeterminada

    try {

      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]; // Extrae ID del formato estándar
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]; // Extrae ID de URLs cortas
      }

      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : 'https://via.placeholder.com/100'; // Si no se puede extraer, usa una miniatura predeterminada
    } catch (error) {
      console.error('Error al extraer la miniatura:', error);
      return 'https://via.placeholder.com/100'; // Miniatura predeterminada en caso de error
    }
  };

  const toggleHighlight = async (id, highlighted) => {
    try {
      await fetch(`${API_URL}/api/tricks/highlight/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlighted }),
      });
      fetchTricks(); // Recarga los trucos
    } catch (error) {
      console.error('Error al actualizar destacado:', error);
    }
  };




  return (
    <div className="tricks-page">

      <div className="tricks-header">
        <div className="tricks-title">
          <h1>Trucos</h1>
          <button className="new-trick-button" onClick={() => handleOpenModal()}>
            <img src={more} alt="more" /> Nuevo Truco
          </button>
        </div>

        <div className="tricks-filters fltrick">
          <span>Filter:</span>
          <button className={activeFilter === "like" ? "active-filtro" : ""} onClick={() => handleFilterClick("like")}>Like</button>
          <button className={activeFilter === "view" ? "active-filtro" : ""} onClick={() => handleFilterClick("view")}>View</button>
          <button className={activeFilter === "date" ? "active-filtro" : ""} onClick={() => handleFilterClick("date")}>Date</button>
          <button className="tricks-order" onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}>
            <ImArrowUp
              size={25}
              style={{
                opacity: sortOrder === "asc" ? 1 : 0.3,
                width: window.innerWidth <= 768 ? '50%' : 'auto'
              }}
            />
            <ImArrowDown
              size={25}
              style={{
                opacity: sortOrder === "desc" ? 1 : 0.3,
                width: window.innerWidth <= 768 ? '50%' : 'auto'
              }}
            />

          </button>
        </div>
      </div>

      <table className="tricks-table">
        <thead className="tricks-table-header">
          <tr>
            <th>Destacar Truco</th>
            <th>Nombre Del Truco</th>
            <th>Video</th>
            <th>View</th>
            <th>Like</th>
            <th>Realizado</th>
            <th>Date Added</th>
            <th>Acciones</th>
          </tr>
        </thead>
      <tbody>
  {currentTricks.map((trick, index) => (
    <tr key={`${trick.id}-${index}`} className="trick-row">
      <td onClick={() => setExpandedTrickId(expandedTrickId === trick._id ? null : trick._id)}>
        {trick.name}
        <span className="toggle-arrow">{expandedTrickId === trick._id ? '▲' : '▼'}</span>
      </td>
      {(expandedTrickId === trick._id || window.innerWidth > 768) && (
        <>
          {window.innerWidth <= 768 ? (
            <td colSpan="7" className="mobile-expanded">
              <div><strong>Autor:</strong> {trick.author}</div>
              <div className="video-thumbnail-wrapper">
                <img src={getYouTubeThumbnail(trick.video)} alt={trick.name} className="video-thumbnail" />
              </div>
              <div><strong>Vistas:</strong> {trick.views}</div>
              <div><strong>Likes:</strong> {trick.likes}</div>
              <div><strong>Realizados:</strong> {trick.completed}</div>
              <div><strong>Fecha:</strong> {new Date(trick.dateAdded).toLocaleDateString("es-ES")}</div>
              <div className="mobile-buttons">
                <button onClick={() => handleOpenModal(trick)}>Editar</button>
                <button onClick={() => handleDelete(trick._id)}>Eliminar</button>
              </div>
            </td>
          ) : (
            <>
              <td>{trick.author}</td>
              <td><img src={getYouTubeThumbnail(trick.video)} alt={trick.name} className="video-thumbnail" /></td>
              <td>{trick.views}</td>
              <td>{trick.likes}</td>
              <td>{trick.completed}</td>
              <td>{new Date(trick.dateAdded).toLocaleDateString("es-ES")}</td>
              <td className="actions">
                <button onClick={() => handleOpenModal(trick)}>Editar</button>
                <button onClick={() => handleDelete(trick._id)}>Eliminar</button>
              </td>
            </>
          )}
        </>
      )}
    </tr>
  ))}
</tbody>

      </table>

      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
      </div>
      {/* Modal permanece sin cambios */}
      {modalOpen && (
        <div className="modal">
          <div className="">
            <h2>{editingTrick ? "Editar Truco" : "Añade Nuevo Truco"}</h2>
            <input type="text" name="name" placeholder="Nombre Del Truco" value={formData.name} onChange={handleInputChange} />
            <input type="text" name="author" placeholder="Author" value={formData.author} onChange={handleInputChange} />
            <input type="text" name="url" placeholder="URL" value={formData.url} onChange={handleInputChange} />
            <div className="modal-buttons">
              <button className="publish-button" onClick={handleSubmit}>{editingTrick ? "Guardar Cambios" : "Publicar"}</button>
              <button className="reset-button" onClick={handleCloseModal}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TricksPage;
