import { useRef, useState, useEffect } from 'react';

function TruncatedText({ text, maxLines = 2 }) {
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      // Compara la altura "scrollHeight" con la altura visible "clientHeight"
      setIsOverflowing(
        textRef.current.scrollHeight > textRef.current.clientHeight
      );
    }
  }, [text]);

  const handleSeeMore = (e) => {
    e.preventDefault(); // Evita que recargue la página si es un enlace
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {/* Contenedor que muestra el texto truncado */}
      <div className='truncated-text'>
        <div
          ref={textRef}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {text}
        </div>
        {/* Solo mostramos "See More" si detectamos overflow */}
        {isOverflowing && (
          <a href="#" className="see-more" style={{ marginLeft: '5px' }} onClick={handleSeeMore}>
            See More &gt;
          </a>
        )}
      </div>

      {/* Modal para mostrar el texto completo */}
      {modalOpen && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="" onClick={(e) => e.stopPropagation()}>
            <h3>Texto completo</h3>
            <p>{text}</p>
            <button onClick={handleCloseModal}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default TruncatedText;
