// src/pages/User/Consultations/ConsulDetails.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import api from '../../../../services/api';
import './css/styles.css';

const ConsulDetails = () => {
    const { consultaId } = useParams();
    const navigate = useNavigate();
    
    const [consulta, setConsulta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConsulta = async () => {
            if (!consultaId) return;
             try {
                const response = await api.get(`/consultas/${consultaId}`);
                setConsulta(response.data);
            } catch (error) {
                 console.error("Erro ao buscar detalhes da consulta", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConsulta();
    }, [consultaId]);
    
    

    const handleCancelConsultation = async () => {
        if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
            try {
                await api.post(`/consultas/${consultaId}/cancel`);
                alert('Consulta cancelada com sucesso.');
                navigate('/consultas');
            } catch (error) {
                alert('Não foi possível cancelar a consulta.');
                console.error(error);
            }
        }
    };

    if (loading) return <div className="loading-container">Carregando detalhes...</div>;
    if (!consulta) return <div className="loading-container">Consulta não encontrada.</div>;

    return (
        <div className="pets-details-page">
            <HeaderComCadastro />
             <div className="welcome-section">
                <h1 className="welcome-title">Detalhes da Consulta</h1>
                {/* O status que ficava aqui foi removido */}
            </div>
            <div className="pet-details-wrapper">
                <div className="pet-details-container">
                    
                    {/* O status-badge-container foi REMOVIDO daqui */}

                     <form>
                        <div className="form-row">
                            <div className="form-group"><label>Pet</label><div className="detail-value">{consulta.petName}</div></div>
                             <div className="form-group"><label>Veterinário</label><div className="detail-value">{consulta.veterinaryName}</div></div>
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
                            <label>Motivo</label>
                            <div className="detail-value long-text">{consulta.reason}</div>
                         </div>
                         <div className="details-actions">
                            <Link to="/consultas" className="back-button">Voltar</Link>
                            <button type="button" className="decline-button" onClick={handleCancelConsultation}>Cancelar Consulta</button>
                         </div>
                    </form>
                </div>
            </div>
            <Footer />
         </div>
    );
};

export default ConsulDetails;