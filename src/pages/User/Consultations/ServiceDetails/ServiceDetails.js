import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import api from '../../../../services/api';
import { toast } from 'react-toastify';
import { FaStar, FaRegStar } from 'react-icons/fa';
import '../css/styles.css';
import { formatEnumLabel } from '../../../../utils/format';
import profileIcon from '../../../../assets/images/Header/perfilIcon.png';

const ServiceDetails = () => {
    const { scheduleId } = useParams();
    const location = useLocation();

    // Tenta pegar do estado, mas se não tiver employeeId, considera incompleto
    const initialData = location.state?.appointment;
    const isDataIncomplete = initialData && !initialData.employeeId;
    const [consulta, setConsulta] = useState(isDataIncomplete ? null : initialData);
    const [loading, setLoading] = useState(!consulta);
    const [error, setError] = useState('');

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');

    // 1. Busca Detalhes Completos (se necessário)
    useEffect(() => {
        const fetchServiceDetails = async () => {
            // Se não temos consulta OU se os dados estão incompletos (sem ID do funcionário)
            // O objeto da lista tem 'veterinaryName' mas não tem o ID do funcionário.
            if (!consulta || (!consulta.employeeId && !consulta.professionalId)) {
                try {
                    setLoading(true);
                    // Remove prefixo "s-" se existir (usado na lista mista de Admin)
                    let realId = scheduleId;
                    if (scheduleId && scheduleId.startsWith('s-')) {
                        realId = scheduleId.replace('s-', '');
                    }
                    // Busca o objeto completo da API (que tem todos os IDs)
                    const res = await api.get(`/api/service-schedules/${realId}`);
                    setConsulta(res.data);
                } catch (error) {
                    console.error("Erro ao buscar detalhes:", error);
                    setError("Não foi possível carregar os detalhes completos.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchServiceDetails();
    }, [scheduleId, consulta]);

    // 2. Busca Avaliação Existente
    useEffect(() => {
        const fetchRating = async () => {
            if (consulta && consulta.employeeId) {
                try {
                    // Rota unificada: /api/ratings/employee/{id}
                    const rateRes = await api.get(`/api/ratings/employee/${consulta.employeeId}`);

                    if (rateRes.data) {
                        setRating(rateRes.data.rating);
                        setComment(rateRes.data.comment || '');
                    }
                } catch (e) {
                    // Ignora se não tiver avaliação
                }
            }
        };

        // Só executa se tivermos o employeeId carregado
        if (consulta?.employeeId) {
            fetchRating();
        }
    }, [consulta]);

    const handleSubmitRating = async () => {
        if (rating === 0) {
            toast.warn('Por favor, selecione de 1 a 5 estrelas.');
            return;
        }

        // Tenta pegar o ID de várias formas possíveis
        // O DTO do backend manda 'employeeId'
        // A lista do Admin manda 'professionalId' ou as vezes nada (só o nome)
        const empId = consulta?.employeeId || consulta?.professionalId;

        if (!empId) {
            console.error("Dados da consulta para debug:", consulta);
            toast.error('Erro: ID do profissional não encontrado. Tente recarregar a página.');
            // Força um reload para garantir dados frescos
            window.location.reload();
            return;
        }

        try {
            await api.post(`/api/ratings/employee/${empId}`, { rating, comment });
            toast.success('Avaliação enviada com sucesso!');
        } catch (error) {
            toast.error('Falha ao enviar avaliação.');
        }
    };

    if (loading) return <div className="loading-container">Carregando detalhes...</div>;
    if (error) return <p className="error-message" style={{ margin: '150px auto' }}>{error}</p>;
    if (!consulta) return <div className="loading-container">Agendamento não encontrado.</div>;

    // Garante compatibilidade de campos entre DTO e Objeto de Lista
    const petName = consulta.petName;
    const professionalName = consulta.employeeName || consulta.veterinaryName;
    const dateStr = consulta.scheduleDate || consulta.consultationdate;
    const timeStr = consulta.scheduleTime || consulta.consultationtime;
    const serviceName = consulta.serviceName || consulta.speciality;
    const profImg = consulta.employeeImageUrl || profileIcon;

    return (
        <div className="pets-details-page">
            <HeaderComCadastro />
            <div className="welcome-section">
                <h1 className="welcome-title">Detalhes do Serviço</h1>
            </div>
            <div className="pet-details-wrapper">
                <div className="pet-details-container">
                    
                    {/* Informações Básicas */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Pet</label>
                            <div className="detail-value">{petName}</div>
                        </div>
                        <div className="form-group">
                            <label>Profissional</label>
                            <div className="detail-value">{professionalName}</div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Data</label>
                            <div className="detail-value">
                                {dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Hora</label>
                            <div className="detail-value">{timeStr}</div>
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>Serviço</label>
                        <div className="detail-value long-text">{formatEnumLabel(serviceName)}</div>
                    </div>

                    {/* Avaliação do Funcionário */}
                    <div className="doctor-section">
                        <h3 className="rating-title">Avalie o Atendimento</h3>
                        <div className="doctor-rating-container">
                            <div className="doctor-info">
                                <img 
                                    src={profImg} 
                                    alt={professionalName} 
                                    className="doctor-avatar" 
                                    onError={(e) => { e.target.src = profileIcon }} 
                                />
                                <div className="doctor-details">
                                    <h4>{professionalName}</h4>
                                    <p>{formatEnumLabel(serviceName)}</p>
                                </div>
                            </div>
                            <div className="rating-controls">
                                <div className="stars">
                                    {[...Array(5)].map((_, index) => {
                                        const ratingValue = index + 1;
                                        return (
                                            <button
                                                type="button"
                                                key={index}
                                                className="star-button"
                                                onClick={() => setRating(ratingValue)}
                                                onMouseEnter={() => setHover(ratingValue)}
                                                onMouseLeave={() => setHover(0)}
                                            >
                                                {ratingValue <= (hover || rating) ? <FaStar className="star filled" /> : <FaRegStar className="star" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button className="submit-rating" onClick={handleSubmitRating}>Enviar Avaliação</button>
                            </div>
                        </div>
                    </div>

                    <div className="details-actions">
                        <Link to="/consultas" className="back-button">Voltar</Link>
                        {/* Botão de cancelar pode ser reativado aqui quando a lógica estiver pronta */}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ServiceDetails;
