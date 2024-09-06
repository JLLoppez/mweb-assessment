import React from 'react';

const Popup = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <button style={styles.closeButton} onClick={onClose}>X</button>
        <p>{message}</p>
      </div>
    </div>
  );
};

// Popup styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#fff',
    padding: '60px',
    border: '1px solid #e11414',
    borderRadius: '8px',
    boxShadow: '#e11414 3px 2px 8px 0px;',
    textAlign: 'center',
    position: 'relative',
    maxWidth: '400px',
    width: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    border: 'none',
    background: 'none',
    fontSize: '15px',
    cursor: 'pointer',
  },
};

export default Popup;
