import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HeaderVet from '../../../components/HeaderVet/HeaderVet';
import Footer from '../../../components/Footer';
import VetConsultasNav from '../components/VetConsultasNav';
import ConfirmModal from '../../../components/ConfirmModal';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import '../css/styles.css';
import { formatEnumLabel } from '../../../utils/format';

const Consultas = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'pedidos';
    const [activeTab, setActiveTab] = useState(initialTab);
    
    const [allConsultas, setAllConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dataAtual] = useState(new Date());
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: null, id: null });
    
    const navigate = useNavigate();

    const fetchConsultas = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/consultas/vet/my-consultations');
            setAllConsultas(response.data);
        } catch (err) {
            setError('Falha ao buscar consultas. Tente novamente mais tarde.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConsultas();
    }, [fetchConsultas]);

    useEffect(() => {
        setActiveTab(searchParams.get('tab') || 'pedidos');
    }, [searchParams]);

    const handleAction = async (actionFn, successMsg, errorMsg) => {
        try {
            await actionFn();
            toast.success(successMsg);
            fetchConsultas();
        } catch (err) {
            toast.error(errorMsg);
            console.error(err);
        }
    };

    const handleAccept = (e, id) => {
        e.stopPropagation();
        handleAction(() => api.post(`/consultas/${id}/accept`), 'Consulta aceita com sucesso!', 'Erro ao aceitar consulta.');
    };

    const handleDecline = (e, id) => {
        e.stopPropagation();
        setConfirmAction({ isOpen: true, type: 'decline', id });
    };

    const handleCancel = (e, id) => {
        e.stopPropagation();
        setConfirmAction({ isOpen: true, type: 'cancel', id });
    };

    const confirmActionHandler = async () => {
        const { type, id } = confirmAction;
        if (type === 'decline') {
            await handleAction(() => api.post(`/consultas/${id}/reject`), 'Consulta recusada com sucesso!', 'Erro ao recusar consulta.');
        } else if (type === 'cancel') {
            await handleAction(() => api.post(`/consultas/${id}/cancel`), 'Consulta cancelada com sucesso!', 'Erro ao cancelar consulta.');
        }
        setConfirmAction({ isOpen: false, type: null, id: null });
    };
    
    const handleCardClick = (consulta) => {
        navigate(`/vet/consultas/${consulta.id}`);
    };

    const renderCalendarView = () => {
        const dias = [];
        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();
        const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        const offsetPrimeiroDia = (primeiroDiaDoMes === 0) ? 6 : primeiroDiaDoMes - 1;

        for (let i = 0; i < offsetPrimeiroDia; i++) {
            dias.push(<div key={`vazio-${i}`} className="dia-celula vazio"></div>);
        }

        for (let dia = 1; dia <= diasNoMes; dia++) {
            const consultasDoDia = allConsultas.filter(c => 
                new Date(c.consultationdate).getUTCDate() === dia && 
                new Date(c.consultationdate).getUTCMonth() === mes &&
                new Date(c.consultationdate).getUTCFullYear() === ano
            );
            dias.push(
                <div key={dia} className="dia-celula">
                    <span className="numero-dia">{dia}</span>
                    {consultasDoDia.length > 0 && (
                        <div className="marcadores-container">
                            {consultasDoDia.map((consulta) => (
                                <div key={consulta.id} className="marcador-consulta" title={`${consulta.petName} às ${consulta.consultationtime}`}></div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className="calendario-container">
                <div className="vet-page-header" style={{border: 'none', textAlign: 'center'}}>
                    <h1>Calendário de {dataAtual.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h1>
                </div>
                <div className="calendario-grid">
                    <div className="dia-semana">Seg</div>
                    <div className="dia-semana">Ter</div>
                    <div className="dia-semana">Qua</div>
                    <div className="dia-semana">Qui</div>
                    <div className="dia-semana">Sex</div>
                    <div className="dia-semana">Sáb</div>
                    <div className="dia-semana">Dom</div>
                    {dias}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) return <p className="loading-message">Carregando consultas...</p>;
        if (error) return <p className="error-message">{error}</p>;

        if (activeTab === 'calendario') {
            return renderCalendarView();
        }

        const dataMap = {
            pedidos: allConsultas.filter(c => c.status === 'PENDENTE'),
            agendadas: allConsultas.filter(c => c.status === 'AGENDADA'),
            historico: allConsultas.filter(c => ['FINALIZADA', 'CANCELADA', 'RECUSADA'].includes(c.status)),
        };
        
        const dataToRender = dataMap[activeTab] || [];

        if (dataToRender.length === 0) {
            return <div className="no-consultas-info">Nenhuma consulta encontrada nesta aba.</div>;
        }

        return (
            <div className="consultas-grid">
                {dataToRender.map(item => (
                    <div key={item.id} className="request-card" >
                        <div className="request-card-header clickable" onClick={() => handleCardClick(item)}>
                            <div className="card-avatar-placeholder">{item.petName?.charAt(0) || '?'}</div>
                            <div>
                                <strong className="pet-name">{item.petName}</strong>
                                <span className="owner-name">Tutor(a): {item.userName}</span> 
                            </div>
                        </div>
                        <div
                            className="request-card-body clickable"
                            onClick={() => handleCardClick(item)}
                            role="button"
                            tabIndex="0"
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(item); } }}
                        >
                            <p><strong>Serviço:</strong> {formatEnumLabel(item.speciality)}</p>
                            <p><strong>Data:</strong> {new Date(item.consultationdate + 'T' + item.consultationtime).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'})}</p>
                        </div>
                        <div className="request-card-actions">
                            {activeTab === 'pedidos' && (
                                <>
                                    <button className="decline-button" onClick={(e) => handleDecline(e, item.id)}>Recusar</button>
                                    <button className="details-button-vet" onClick={() => handleCardClick(item)}>Detalhes</button>
                                    <button className="accept-button" onClick={(e) => handleAccept(e, item.id)}>Aceitar</button>
                                </>
                            )}
                            {activeTab === 'agendadas' && (
                                <>
                                    <button className="decline-button" onClick={(e) => handleCancel(e, item.id)}>Cancelar</button>
                                    <button className="details-button-vet" onClick={() => handleCardClick(item)}>Ver Detalhes</button>
                                </>
                            )}
                            {activeTab === 'historico' && (
                                <div className="request-card-actions single clickable" onClick={() => handleCardClick(item)}>
                                    <span className={`details-button-vet report status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <div className="pet-profile-page">
            <HeaderVet />
            <main className="vet-content-full">
                <div className="pet-profile-container">
                    <VetConsultasNav activeTab={activeTab} />
                    {renderContent()}
                </div>
            </main>

            <ConfirmModal
                isOpen={confirmAction.isOpen}
                title={confirmAction.type === 'decline' ? 'Recusar Consulta' : 'Cancelar Consulta'}
                message={confirmAction.type === 'decline' 
                    ? 'Tem certeza que deseja recusar esta consulta?' 
                    : 'Tem certeza que deseja cancelar esta consulta agendada?'}
                onConfirm={confirmActionHandler}
                onCancel={() => setConfirmAction({ isOpen: false, type: null, id: null })}
                confirmText={confirmAction.type === 'decline' ? 'Recusar' : 'Cancelar'}
                cancelText="Voltar"
                type="warning"
            />

            <Footer />
        </div>
    );
};

export default Consultas;