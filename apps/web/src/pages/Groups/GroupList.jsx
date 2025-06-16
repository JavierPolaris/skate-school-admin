function GroupList({ groups, onSelectGroup, selectedGroupId, onAddGroup }) {
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: '60px', // Ajusta según la altura del header
        left: '289px', // Ancho del sidebar
        width: '200px',
        height: 'calc(100vh - 60px)',
        backgroundColor: 'rgb(38 42 49)',
        padding: '1rem',
        borderRight: '1px solid #3A3A50',
        overflowY: 'auto',
        zIndex: 9997 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#ff9b00' }}>Grupos</h3>
        <button className="boton-more" onClick={onAddGroup}>+</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {groups.map(group => (
          <li 
            key={group._id} 
            onClick={() => onSelectGroup(group._id)}
            style={{
              margin: '0.5rem 0', 
              cursor: 'pointer', 
              color: '#fff',
              fontWeight: group._id === selectedGroupId ? 'bold' : 'normal'
            }}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default GroupList;
