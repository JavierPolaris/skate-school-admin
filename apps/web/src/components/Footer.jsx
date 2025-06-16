function Footer() {
  return (
    <footer style={{
      width: '100%',
      textAlign: 'center',
      padding: '1rem 0',
      fontSize: '0.8rem',
      color: '#b5b5b5',
      backgroundColor: 'transparent',
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 1
    }}>
      Desarrollado por <a href="https://aboutjavi.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF4081' }}>Javier García-Rojo</a> · Kedekids © {new Date().getFullYear()}
    </footer>
  );
}

export default Footer;
