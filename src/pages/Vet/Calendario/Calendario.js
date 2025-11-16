import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeaderVet from '../../../components/HeaderVet/HeaderVet';
import Footer from '../../../components/Footer';
import VetConsultasNav from '../components/VetConsultasNav';
import '../css/styles.css';

const mockConsultasDoMes = [
  { dia: 1, pet: 'Rex', doutor: 'Dr. Carlos Silva' },
  { dia: 8, pet: 'Luna', doutor: 'Dra. Ana Paula' },
];
const mockPacientes = [ 'Rex', 'Luna', 'Thor', 'Bolinha', 'Miau' ];
const mockDoutores = [ 'Dr. Carlos Silva', 'Dra. Ana Paula', 'Dra. Juliana Costa' ];

const VetCalendario = () => {
  const [dataAtual] = useState(new Date());
  const [pacienteFiltro, setPacienteFiltro] = useState('');
  const [doutorFiltro, setDoutorFiltro] = useState('');

  const renderizarDias = () => {
    const dias = [];
    // ... (lógica para renderizar os dias do calendário)
    return dias;
  };

  return (
    <div className="pet-profile-page">
      <HeaderVet />
      <main className="vet-content-full">
        <div className="pet-profile-container">
          <VetConsultasNav activeTab="calendario" />
          <div className="calendario-container">
            <div className="vet-page-header" style={{border: 'none', marginBottom: '20px', textAlign: 'center'}}>
                <h1>Calendário de Agendamentos</h1>
            </div>
            <div className="filtros-container" style={{justifyContent: 'center'}}>
              <div className="filtro-item">
                <select value={pacienteFiltro} onChange={(e) => setPacienteFiltro(e.target.value)}>
                  <option value="">* Todos os Pacientes</option>
                  {mockPacientes.map(pet => <option key={pet} value={pet}>{pet}</option>)}
                </select>
              </div>
              <div className="filtro-item">
                <select value={doutorFiltro} onChange={(e) => setDoutorFiltro(e.target.value)}>
                  <option value="">* Todos os Doutores</option>
                  {mockDoutores.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                </select>
              </div>
            </div>
            <div className="calendario-grid">
                <div className="dia-semana">Seg</div>
                <div className="dia-semana">Ter</div>
                <div className="dia-semana">Qua</div>
                <div className="dia-semana">Qui</div>
                <div className="dia-semana">Sex</div>
                <div className="dia-semana">Sáb</div>
                <div className="dia-semana">Dom</div>
                {renderizarDias()}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VetCalendario;