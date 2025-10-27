import React from 'react';
import './Dialog.css';

const Dialog = ({ message, isOpen, onClose, onConfirm, isConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        {isConfirm ? (
          <div className="dialog-buttons">
            <button onClick={onConfirm} className="confirm">Yes</button>
            <button onClick={onClose} className="cancel">No</button>
          </div>
        ) : (
          <button onClick={onClose}>OK</button>
        )}
      </div>
    </div>
  );
};

export default Dialog;