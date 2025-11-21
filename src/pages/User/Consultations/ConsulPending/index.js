// src/pages/User/Consultations/ConsulPending.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import '../css/styles.css'; 
import { formatEnumLabel } from '../../../../utils/format';

const ConsulPending = () => {
    const [allAppointments, setAllAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'pendentes';
    const [activeTab, setActiveTab] = useState(initialTab);
    
    const [dataAtual] = useState(new Date());

    useEffect(() => {
        const currentTab = searchParams.get('tab') || 'pendentes';
        setActiveTab(currentTab);
    }, [searchParams]);

    useEffect(() => {
        if (!user) { setLoading(false); return; };
        
        const fetchConsultas = async () => {
            setLoading(true);
            setError('');
            try {
                const [consultasResponse, servicosResponse] = await Promise.all([
                    api.get('/consultas/my-consultations'),
                    api.get('/api/service-schedules/my-schedules') 
                ]);

                // Mapeia Consultas (Vets)
                const consultas = (consultasResponse.data || []).map(c => ({
                    ...c, 
                    isService: false 
                }));
                
                // Mapeia Serviços (Funcionários)
                const servicos = (servicosResponse.data || []).map(s => ({
                    id: `s-${s.id}`, // Prefixo 's-' para ID único
                    isService: true, 
                    consultationdate: s.scheduleDate,
                    consultationtime: s.scheduleTime,
                    status: s.status,
                    reason: s.observations,
                    petName: s.petName,
                    userName: s.clientName,
                    veterinaryName: s.employeeName, // Nome do funcionário
                    speciality: s.serviceName, // Nome do serviço
                }));

                const allData = [...consultas, ...servicos].sort((a, b) => {
                    const dateA = new Date(`${a.consultationdate}T${a.consultationtime}`);
                    const dateB = new Date(`${b.consultationdate}T${b.consultationtime}`);
                    return dateB - dateA; 
                });

                setAllAppointments(allData);
                
            } catch (err) {
                setError('Falha ao buscar suas consultas e serviços.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchConsultas();
    }, [user]);

    const renderContent = () => {
        if (loading) return <p style={{textAlign: 'center', padding: '20px'}}>Carregando...</p>;
        if (error) return <p className="error-message">{error}</p>;

        if (activeTab === 'calendario') {
            const renderizarDias = () => {
                const dias = [];
                const ano = dataAtual.getFullYear();
                const mes = dataAtual.getMonth();
                const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
                const diasNoMes = new Date(ano, mes + 1, 0).getDate();
                const offsetPrimeiroDia = (primeiroDiaDoMes === 0) ? 6 : primeiroDiaDoMes - 1;

                for (let i = 0; i < offsetPrimeiroDia; i++) { dias.push(<div key={`vazio-${i}`} className="dia-celula vazio"></div>); }

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const consultasDoDia = allAppointments.filter(c => new Date(c.consultationdate).getUTCDate() === dia && new Date(c.consultationdate).getUTCMonth() === mes);
                    dias.push(
                        <div key={dia} className="dia-celula">
                            <span className="numero-dia">{dia}</span>
                            {consultasDoDia.length > 0 && (
                                <div className="marcadores-container">
                                {consultasDoDia.map((consulta) => {
                                    const s = (consulta.status || '').toLowerCase();
                                    const statusClass = s === 'finalizada' ? 'finalizada' : s === 'agendada' ? 'agendada' : s === 'pendente' ? 'pendente' : (s === 'cancelada' || s === 'recusada') ? 'cancelada' : '';
                                    return (
                                        <div key={consulta.id} className={`marcador-consulta ${statusClass}`} title={`${consulta.petName} às ${consulta.consultationtime}`}></div>
                                    );
                                })}
                                </div>
                            )}
                        </div>
                    );
                }
                return dias;
            };
            return (
                 <div className="calendario-container">
                    <div className="calendario-grid">{renderizarDias()}</div>
                </div>
            );
        }

        const pendentes = allAppointments.filter(c => c.status === 'PENDENTE');
        const agendadas = allAppointments.filter(c => c.status === 'AGENDADA');
        const historico = allAppointments.filter(c => ['FINALIZADA', 'CANCELADA', 'RECUSADA'].includes(c.status));

        let dataToRender = [];
        if (activeTab === 'pendentes') dataToRender = pendentes;
        if (activeTab === 'agendadas') dataToRender = agendadas;
        if (activeTab === 'historico') dataToRender = historico;

        if (dataToRender.length === 0) return <p style={{textAlign: 'center', padding: '20px'}}>Nenhum item encontrado nesta aba.</p>;
        
        return dataToRender.map(c => {
            
            // --- CORREÇÃO DE ROTEAMENTO PARA TODOS OS TIPOS ---
            let detailsPath = '';
            const realId = String(c.id).replace('s-', ''); // Remove o prefixo 's-'

            if (c.isService) {
                // É um serviço. Aponta para a nova rota de detalhes de serviço.
                detailsPath = `/detalhes-servico/${realId}`;
            } else {
                // É uma consulta de veterinário
                detailsPath = c.status === 'FINALIZADA' 
                    ? `/detalhes-consulta-concluida/${realId}` 
                    : `/detalhes-consulta/${realId}`;
            }
            
            // Todos os cards agora são Links clicáveis
            return (
                <Link 
                    to={detailsPath}
                    // Passa os dados do card para a próxima página via 'state'
                    // Isso evita uma nova chamada de API na tela de detalhes
                    state={{ appointment: c }} 
                    key={c.id} 
                    className="pet-card-link"
                >
                    <div className="pet-card">
                        <div className="pet-info">
                            <h3 className="pet-name">{c.petName}</h3>
                            <span className="card-subtitle">{formatEnumLabel(c.speciality)} com {c.veterinaryName}</span>
                            <span className="card-subtitle">{new Date(c.consultationdate + 'T00:00:00').toLocaleDateString('pt-BR')} às {c.consultationtime}</span>
                        </div>
                        <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
                    </div>
                </Link>
            );
        });
    };

    return (
        <div className="pet-profile-page">
            <HeaderComCadastro />
             <main className="main-content-consultation">
                <h1>Meus Agendamentos</h1>
                <div className="pet-profile-container">
                    <div className="status-section">
                         <div className="status-buttons">
                            <button className={`status-button ${activeTab === 'pendentes' ? 'active' : ''}`} onClick={() => setSearchParams({tab: 'pendentes'})}>Pendentes</button>
                             <button className={`status-button ${activeTab === 'agendadas' ? 'active' : ''}`} onClick={() => setSearchParams({tab: 'agendadas'})}>Agendados</button>
                            <button className={`status-button ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setSearchParams({tab: 'historico'})}>Histórico</button>
                             <button className={`status-button ${activeTab === 'calendario' ? 'active' : ''}`} onClick={() => setSearchParams({tab: 'calendario'})}>Calendário</button>
                        </div>
                    </div>
                     <div className="consultas-list-container">{renderContent()}</div>
                    <div className="add-consulta-container">
                        <Link to="/agendar-escolha" className="action-button-primary">Novo Agendamento</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ConsulPending;