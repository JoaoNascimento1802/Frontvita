import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HeaderEmployee from '../../../components/HeaderEmployee';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import '../css/styles.css';
import '../../Vet/css/styles.css';
import profileIcon from '../../../assets/images/Header/perfilIcon.png';

const EmployeeDetalhesServico = () => {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const [servico, setServico] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, [scheduleId, navigate]);

    const handleFinalize = async () => {
        if (window.confirm('Tem certeza que deseja finalizar este serviço?')) {
            try {
                await api.post(`/api/employee/schedules/${scheduleId}/finalize`);
                toast.success('Serviço finalizado com sucesso!');
                navigate('/employee/servicos?tab=historico');
            } catch (error) {
                console.error(error);
                toast.error('Erro ao finalizar serviço.');
            }
        }
    };

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (!servico) return <div className="error-message">Serviço não encontrado.</div>;

    return (
        <div className="employee-page">
            <HeaderEmployee />
            <div className="vet-content-full">
                <div className="details-container">
                    <div className="details-header">
                        <h2>Detalhes do Serviço #{servico.id}</h2>
                        <span className={`status-badge ${servico.status.toLowerCase()}`}>{servico.status}</span>
                    </div>

                    <div className="patient-info-card">
                        <div className="card-avatar-placeholder" style={{width:'80px', height:'80px', fontSize:'2rem'}}>
                            {servico.petName.charAt(0)}
                        </div>
                        <div className="patient-text">
                            <h3>Pet: {servico.petName}</h3>
                            <p><strong>Tutor:</strong> {servico.clientName}</p>
                            <p><strong>Serviço:</strong> {servico.serviceName}</p>
                            <p><strong>Data:</strong> {new Date(servico.scheduleDate).toLocaleDateString('pt-BR')} às {servico.scheduleTime}</p>
                            {servico.observations && <p><strong>Obs:</strong> {servico.observations}</p>}
                        </div>
                    </div>

                    <div className="action-buttons-container" style={{marginTop: '40px'}}>
                        <Link to="/employee/servicos" className="back-button">Voltar</Link>
                        <Link to={`/employee/chat`} className="chat-button-link">Abrir Chat</Link>
                        {servico.status === 'AGENDADA' && (
                            <button className="finalize-button" onClick={handleFinalize}>Finalizar Serviço</button>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default EmployeeDetalhesServico;