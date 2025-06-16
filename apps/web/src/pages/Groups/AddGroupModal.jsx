import { useState, useEffect } from 'react';


function AddGroupModal({ isOpen, onClose, onSave }) {
  const [groupName, setGroupName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(groupName);
    setGroupName('');
  };

  return (
    <div className='modal' >
     
        <h3>Agregar Grupo</h3>
        <input 
          type="text" 
          value={groupName} 
          onChange={e => setGroupName(e.target.value)} 
          placeholder="Nombre del grupo" 
          style={{ width:'-webkit-fill-available' }}
        />
        <div style={{ marginTop:'1rem' }}>
          <button onClick={handleSave}>Guardar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      
    </div>
  );
}

export default AddGroupModal;
