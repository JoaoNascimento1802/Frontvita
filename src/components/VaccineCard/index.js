import React from 'react';
import { FaSyringe, FaCalendarCheck, FaUserMd, FaTrash, FaPencilAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import './styles.css';

const VaccineCard = ({ vaccine, onDelete, onEdit, isVet }) => {
    const today = new Date();
    const nextDose = vaccine.nextDoseDate ? new Date(vaccine.nextDoseDate) : null;
    
    let statusClass = 'dose-unique';
    let statusLabel = 'Dose Única';
    let StatusIcon = FaCheckCircle;

    if (nextDose) {
        today.setHours(0,0,0,0);
        // Ajuste simples de fuso
        const nextDoseAdjusted = new Date(nextDose.valueOf() + nextDose.getTimezoneOffset() * 60000);

        if (nextDoseAdjusted < today) {
            statusClass = 'dose-late';
            statusLabel = 'Atrasada';
            StatusIcon = FaExclamationTriangle;
        } else {
            statusClass = 'dose-ok';
            statusLabel = 'Em dia';
            StatusIcon = FaCalendarCheck;
        }
    }

    return (
        <div className={`vaccine-card ${statusClass}-border`}>
            <div className="vaccine-content-wrapper">
                <div className="vaccine-icon-area">
                    <div className={`vaccine-icon-circle ${statusClass}-bg`}>
                        <FaSyringe />
                    </div>
                </div>
                
                <div className="vaccine-info">
                    <div className="vaccine-header">
                        <h4>{vaccine.name}</h4>
                        <span className={`status-pill ${statusClass}`}>
                            <StatusIcon size={12} style={{marginRight: '4px'}}/> {statusLabel}
                        </span>
                    </div>
                    
                    <div className="vaccine-details-grid">
                        <div className="detail-item">
                            <small>Aplicada em:</small>
                            <span>{new Date(vaccine.applicationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        {vaccine.nextDoseDate && (
                            <div className="detail-item">
                                <small>Próxima dose:</small>
                                <span className={statusClass === 'dose-late' ? 'text-danger' : ''}>
                                    {new Date(vaccine.nextDoseDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="detail-item full-width" style={{marginTop: '8px'}}>
                         <small>Aplicado por: <span className="vet-name-inline">{vaccine.veterinaryName || 'Não informado'}</span></small>
                    </div>
                </div>
            </div>

            {isVet && (
                <div className="vaccine-actions-column">
                    <button 
                        className="action-vaccine-btn edit" 
                        onClick={() => onEdit(vaccine)}
                        title="Editar vacina"
                    >
                        <FaPencilAlt />
                    </button>
                    <button 
                        className="action-vaccine-btn delete" 
                        onClick={() => onDelete(vaccine.id)}
                        title="Remover vacina"
                    >
                        <FaTrash />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VaccineCard;