import { useEffect, useState } from 'react';
import API_URL from '../config';
import '../css/StudentTricks.css';
import ReactPlayer from 'react-player';

function StudentTricks() {
    const [tricks, setTricks] = useState([]);
    const [user, setUser] = useState({});
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        fetch(`${API_URL}/tricks`)
            .then(res => res.json())
            .then(data => {
                // Aseguramos que cada truco tenga un campo "highlighted" y "doneBy" array para evitar errores
                const updatedData = data.map(trick => ({
                    ...trick,
                    highlighted: trick.highlighted || false,
                    doneBy: trick.doneBy || [],
                }));
                setTricks(updatedData);
            })
            .catch(err => console.error('Error cargando trucos:', err));
    }, []);

    const handleMarkAsDone = (trickId) => {
        fetch(`${API_URL}/api/tricks/mark-done`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, trickId }),
        })
            .then(res => res.json())
            .then(() => {
                setTricks(tricks.map(trick =>
                    trick._id === trickId && !trick.doneBy.includes(user.id)
                        ? { ...trick, doneBy: [...trick.doneBy, user.id] }
                        : trick
                ));
            })
            .catch(err => console.error('Error al marcar como realizado:', err));
    };

    const handleLike = (trickId) => {
        fetch(`${API_URL}/api/tricks/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id, trickId }),
        })
            .then(res => res.json())
            .then(({ trick: updatedTrick }) => {
                setTricks(tricks.map(trick =>
                    trick._id === updatedTrick._id ? updatedTrick : trick
                ));
            })
            .catch(err => console.error('Error al registrar like:', err));
    };

    const handleView = (trickId) => {
        fetch(`${API_URL}/api/tricks/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trickId }),
        })
            .then(res => res.json())
            .then(({ trick: updatedTrick }) => {
                setTricks(tricks.map(trick =>
                    trick._id === updatedTrick._id ? updatedTrick : trick
                ));
            })
            .catch(err => console.error('Error al registrar vista:', err));
    };


    const getFilteredTricks = () => {
        let filtered = [...tricks];
        if (filter === 'highlighted') {
            filtered = filtered.filter(trick => trick.highlighted);
        }
        return filtered;
    };

   
    return (
        <div className="student-dashboard">
            <h2 className="section-title">Trucos de Skate</h2>

            <div className="tricks-filter">
                <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>Todos</button>
                <button onClick={() => setFilter('highlighted')} className={filter === 'highlighted' ? 'active' : ''}>Destacados</button>
            </div>

            <div className="tricks-grid">
                {getFilteredTricks().length ? getFilteredTricks().map(trick => (
                    <div className={`trick-card ${trick.highlighted ? 'highlighted' : ''}`} key={trick._id}>
                        <h3>{trick.name}</h3>
                        <ReactPlayer
                            url={trick.video} // Directamente la URL que guardas en la BD
                            controls
                            light
                            onPlay={() => handleView(trick._id)}
                            width="100%"
                            height="200px"
                        />



                        <p>👁️ {trick.views || 0} | 👍 {trick.likes || 0} | ✅ {trick.doneBy.length}</p>

                        {!trick.doneBy.includes(user.id) && (
                            <button
                                className="mark-done-button"
                                onClick={() => handleMarkAsDone(trick._id)}
                            >
                                Marcar como Realizado
                            </button>
                        )}

                        {!trick.likedBy?.includes(user._id) && (
                            <button
                                className="like-button"
                                onClick={() => handleLike(trick._id)}
                            >
                                👍 Like
                            </button>
                        )}
                    </div>
                )) : <p>No hay trucos disponibles todavía.</p>}
            </div>
        </div>
    );
}

export default StudentTricks;
