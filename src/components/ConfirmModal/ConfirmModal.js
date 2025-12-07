import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-modal-header ${type}`}>
                    <h3>{title}</h3>
                </div>
                <div className="confirm-modal-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-modal-actions">
                    <button className="confirm-modal-btn cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`confirm-modal-btn confirm ${type}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
