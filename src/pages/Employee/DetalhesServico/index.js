import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HeaderEmployee from '../../../components/HeaderEmployee';
import Footer from '../../../components/Footer';
import ConfirmModal from '../../../components/ConfirmModal';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaInfoCircle, FaCalendarAlt, FaUser, FaPaw, FaClipboardList } from 'react-icons/fa';
import '../../Vet/DetalhesConsulta/css/style.css';
import profileIcon from '../../../assets/images/Header/perfilIcon.png';

const EmployeeDetalhesServico = () => {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const [servico, setServico] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmFinalize, setConfirmFinalize] = useState(false);

    useEffect(() => {
        const fetchServico = async () => {
            try {
                const response = await api.get(`/api/employee/schedules/${scheduleId}`);
                setServico(response.data);
            } catch (error) {
                console.error('Erro ao buscar serviço', error);
                toast.error('Erro ao carregar detalhes.');
            } finally {
                setLoading(false);
            }
        };
        fetchServico();
    }, [scheduleId]);

    const handleFinalize = async () => {
        try {
            await api.post(`/api/employee/schedules/${scheduleId}/finalize`);
            toast.success('Serviço finalizado com sucesso!');
            navigate('/employee/servicos?tab=historico');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao finalizar serviço.');
        } finally {
            setConfirmFinalize(false);
        }
    };

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (!servico) return <div className="error-message">Serviço não encontrado.</div>;

    return (
        <div className="pets-details-page">
            <HeaderEmployee />
            <div className="welcome-section">
                <h1 className="welcome-title">Detalhes do Serviço</h1>
            </div>
            <div className="pet-details-wrapper">
                <div className="pet-details-container">
                    
                    {/* CABEÇALHO */}
                    <div className="section-block info-header">
                        <div className="avatar-display-small">
                            {servico.petImageUrl ? (
                                <img src={servico.petImageUrl} alt={servico.petName} className="pet-avatar-medium" onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }} />
                            ) : (
                                <div className="card-avatar-placeholder" style={{width: '100px', height: '100px', fontSize: '2.5rem', backgroundColor: '#8D7EFB', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                                    {servico.petName?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label><FaPaw style={{marginRight: '5px'}} />Pet</label>
                                <span>{servico.petName}</span>
                            </div>
                            <div className="info-item">
                                <label><FaUser style={{marginRight: '5px'}} />Tutor</label>
                                <span>{servico.clientName}</span>
                            </div>
                            <div className="info-item">
                                <label><FaClipboardList style={{marginRight: '5px'}} />Serviço</label>
                                <span>{servico.serviceName}</span>
                            </div>
                            <div className="info-item">
                                <label><FaCalendarAlt style={{marginRight: '5px'}} />Data/Hora</label>
                                <span>{new Date(servico.scheduleDate + 'T00:00:00').toLocaleDateString('pt-BR')} às {servico.scheduleTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="section-block">
                        <div className="section-title">
                            <FaInfoCircle /> Status do Atendimento
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <span className={`status-badge ${servico.status?.toLowerCase()}`} style={{
                                padding: '10px 20px',
                                borderRadius: '25px',
                                fontWeight: '700',
                                fontSize: '1rem',
                                textTransform: 'uppercase',
                                backgroundColor: servico.status === 'AGENDADA' ? '#D4EDDA' : servico.status === 'FINALIZADA' ? '#E2E3E5' : '#FFF3CD',
                                color: servico.status === 'AGENDADA' ? '#155724' : servico.status === 'FINALIZADA' ? '#383D41' : '#856404',
                                border: `1px solid ${servico.status === 'AGENDADA' ? '#C3E6CB' : servico.status === 'FINALIZADA' ? '#D6D8DB' : '#FFEEBA'}`
                            }}>
                                {servico.status}
                            </span>
                        </div>
                    </div>

                    {/* OBSERVAÇÕES */}
                    {servico.observations && (
                        <div className="section-block">
                            <div className="section-title">
                                <FaInfoCircle /> Observações
                            </div>
                            <div className="detail-value long-text readonly" style={{
                                backgroundColor: '#f9f7ff',
                                padding: '15px',
                                borderRadius: '10px',
                                border: '1px solid #EBE4F4',
                                minHeight: '60px',
                                lineHeight: '1.6'
                            }}>
                                {servico.observations}
                            </div>
                        </div>
                    )}

                    {/* AÇÕES FINAIS */}
                    <div className="details-actions sticky-actions">
                        <Link to="/employee/servicos" className="back-button">Voltar</Link>
                        <Link to="/employee/chat" className="chat-button-link">Chat com Tutor</Link>
                        {servico.status === 'AGENDADA' && (
                            <button type="button" className="finalize-button" onClick={() => setConfirmFinalize(true)}>
                                Finalizar Serviço
                            </button>
                        )}
                    </div>

                </div>
            </div>

            <ConfirmModal
                isOpen={confirmFinalize}
                title="Finalizar Serviço"
                message="Tem certeza que deseja finalizar este serviço? Esta ação não pode ser desfeita."
                onConfirm={handleFinalize}
                onCancel={() => setConfirmFinalize(false)}
                confirmText="Sim, finalizar"
                cancelText="Cancelar"
                type="info"
            />

            <Footer />
        </div>
    );
};

export default EmployeeDetalhesServico;
