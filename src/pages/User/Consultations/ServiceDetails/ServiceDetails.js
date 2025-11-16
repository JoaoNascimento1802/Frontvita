// src/pages/User/Consultations/ServiceDetails.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import api from '../../../../services/api';
import '../css/styles.css'; 

const ServiceDetails = () => {
    const { scheduleId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [consulta, setConsulta] = useState(location.state?.appointment || null);
    const [loading, setLoading] = useState(!location.state?.appointment);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!consulta) {
            const fetchServiceDetails = async () => {
                try {
                    setError("Não foi possível carregar os detalhes. Por favor, volte para a lista de consultas.");
                } catch (error) {
                    console.error("Erro ao buscar detalhes do serviço:", error);
                    setError("Erro ao buscar detalhes do serviço."); 
                } finally {
                    setLoading(false);
                }
            };
            fetchServiceDetails();
        }
    }, [scheduleId, consulta]);

    const handleCancelService = async () => {
        if (window.confirm('Tem certeza que deseja cancelar este agendamento de serviço?')) {
            try {
                // (Esta rota de API /api/service-schedules/{id}/cancel não existe para USER)
                alert('Função de cancelamento de serviço ainda não implementada.');
            } catch (error) {
                alert('Não foi possível cancelar o serviço.');
            }
        }
    };

    if (loading) return <div className="loading-container">Carregando detalhes...</div>;
    if (error) return <p className="error-message" style={{margin: '150px auto'}}>{error}</p>;
    if (!consulta) return <div className="loading-container">Agendamento não encontrado.</div>;

    return (
        <div className="pets-details-page">
            <HeaderComCadastro />
             <div className="welcome-section">
                <h1 className="welcome-title">Detalhes do Serviço</h1>
                {/* Status removido daqui */}
            </div>
            <div className="pet-details-wrapper">
                <div className="pet-details-container">

                    {/* O status-badge-container foi REMOVIDO daqui */}
                    
                    <form>
                        <div className="form-row">
                            <div className="form-group"><label>Pet</label><div className="detail-value">{consulta.petName}</div></div>
                             <div className="form-group"><label>Profissional</label><div className="detail-value">{consulta.veterinaryName}</div></div>
                        </div>
                        <div className="form-row">
                               <div className="form-group">
                                <label>Data</label>
                                <div className="detail-value">{new Date(consulta.consultationdate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                            </div>
                             <div className="form-group">
                                <label>Hora</label>
                                <div className="detail-value">{consulta.consultationtime}</div>
                            </div>
                        </div>
                         <div className="form-group full-width">
                            <label>Serviço</label>
                             <div className="detail-value long-text">{consulta.speciality}</div>
                        </div>
                         <div className="details-actions">
                            <Link to="/consultas" className="back-button">Voltar</Link>
                            
                            <button type="button" className="decline-button" onClick={handleCancelService} disabled={true} title="Função ainda não disponível">
                                Cancelar Serviço
                            </button>
                         </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ServiceDetails;