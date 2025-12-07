import React, { useState, useEffect } from 'react';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaCalendarCheck, FaTasks, FaStar } from 'react-icons/fa';
import '../css/styles.css';
import './css/styles.css';

const EmployeeDashboard = () => {
    const [summary, setSummary] = useState({ servicesToday: 0, servicesFinalizedThisMonth: 0 });
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/employee/dashboard-summary');
                setSummary(response.data);
            } catch (error) {
                toast.error("Não foi possível carregar o resumo do painel.");
                console.error("Erro ao buscar resumo:", error);
            } finally {
                setLoading(false);
            }
        };
        
        const fetchRating = async () => {
            try {
                const res = await api.get('/api/employee/me/rating-summary');
                setRating(res.data);
            } catch(e) {
                console.error("Erro ao buscar avaliação:", e);
            }
        };
        
        fetchSummary();
        fetchRating();
    }, []);

    return (
        <div className="employee-page">
            <main className="employee-content">
                <div className="employee-header">
                    <h1>Painel de Atendimento</h1>
                    <p>Seu resumo de atividades e agendamentos.</p>
                </div>
                <div className="employee-container">
                    {loading ? (
                        <p className="loading-message">Carregando...</p>
                    ) : (
                        <div className="stats-cards-grid">
                            <div className="stat-card">
                                <div className="stat-icon consultations"><FaCalendarCheck /></div>
                                <div className="stat-info">
                                    <span className="stat-number">{summary.servicesToday}</span>
                                    <span className="stat-label">Serviços Agendados Hoje</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon performance"><FaTasks /></div>
                                <div className="stat-info">
                                    <span className="stat-number">{summary.servicesFinalizedThisMonth}</span>
                                    <span className="stat-label">Serviços Finalizados no Mês</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- EXIBIÇÃO DA NOTA --- */}
                <section className="rating-section">
                    <div className="rating-card-dashboard">
                        <div className="rating-icon-wrapper">
                            <FaStar className="rating-star-icon" />
                        </div>
                        <div className="rating-info">
                            <div className="rating-score">
                                {rating > 0 ? rating.toFixed(1) : 'N/A'}
                            </div>
                            <div className="rating-label">
                                Sua avaliação
                            </div>
                        </div>
                    </div>
                </section>
                {/* ------------------------ */}
            </main>
            <Footer />
        </div>
    );
};

export default EmployeeDashboard;