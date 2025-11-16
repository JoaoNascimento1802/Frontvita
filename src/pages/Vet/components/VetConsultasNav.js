import React from 'react';
import { Link } from 'react-router-dom';

const VetConsultasNav = ({ activeTab }) => {
  return (
    <div className="status-section">
      <div className="status-buttons">
        <Link 
          to="/vet/consultas?tab=pedidos" 
          className={`status-button ${activeTab === 'pedidos' ? 'active' : ''}`}
        >
          Novos Pedidos
        </Link>
        <Link 
          to="/vet/consultas?tab=agendadas" 
          className={`status-button ${activeTab === 'agendadas' ? 'active' : ''}`}
        >
          Agendadas
        </Link>
        <Link 
          to="/vet/consultas?tab=historico" 
          className={`status-button ${activeTab === 'historico' ? 'active' : ''}`}
        >
          Histórico
        </Link>
        {/* O Calendário agora é apenas mais uma aba */}
        <Link 
          to="/vet/consultas?tab=calendario" 
          className={`status-button ${activeTab === 'calendario' ? 'active' : ''}`}
        >
          Calendário
        </Link>
      </div>
    </div>
  );
};

export default VetConsultasNav;