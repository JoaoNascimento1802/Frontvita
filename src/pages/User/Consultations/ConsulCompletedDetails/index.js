import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro'; 
import Footer from '../../../../components/Footer';
import api from '../../../../services/api';
import { FaStar, FaRegStar, FaFileMedical, FaPrescriptionBottleAlt, FaPaperclip } from 'react-icons/fa';
import '../css/styles.css'; 
import { formatEnumLabel } from '../../../../utils/format';
import profileIcon from '../../../../assets/images/Header/perfilIcon.png';

const ConsulCompleteDetails = () => {
    const { consultaId } = useParams();
    const [consulta, setConsulta] = useState(null);
    const [record, setRecord] = useState(null); // Estado para o prontuário
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // 1. Busca dados da consulta
                const response = await api.get(`/consultas/${consultaId}`);
                setConsulta(response.data);

                // 2. Se houver ID de prontuário, busca os detalhes (anexos e prescrições)
                if (response.data.medicalRecordId) {
                    try {
                        const recordRes = await api.get(`/api/medical-records/${response.data.medicalRecordId}`);
                        setRecord(recordRes.data);
                    } catch (err) {
                        console.error("Erro ao buscar prontuário", err);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes", error);
                setError("Não foi possível carregar os detalhes.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [consultaId]);

    const handleSubmitRating = async () => {
        if (rating === 0) {
            alert('Por favor, selecione de 1 a 5 estrelas.');
            return;
        }
        try {
            const veterinaryId = consulta?.veterinaryId; 
            await api.post(`/veterinary/${veterinaryId}/rate`, { rating, comment });
            alert('Avaliação enviada com sucesso!');
        } catch (error) {
            alert('Falha ao enviar avaliação.');
        }
    };

    if (loading) return <div style={{paddingTop: '150px', textAlign: 'center'}}>Carregando...</div>;
    if (error) return <div className="error-message" style={{margin: '150px auto'}}>{error}</div>;
    if (!consulta) return null; 

    return (
        <div className="pets-details-page">
            <HeaderComCadastro />
            <div className="welcome-section">
                <h1 className="welcome-title">Detalhes da Consulta</h1>
            </div>
            <div className="pet-details-wrapper">
                <div className="pet-details-container">
                    
                    {/* Informações Básicas */}
                    <div className="form-row">
                        <div className="form-group"><label>Pet</label><div className="detail-value">{consulta.petName}</div></div>
                        <div className="form-group"><label>Veterinário</label><div className="detail-value">{consulta.veterinaryName}</div></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Data</label><div className="detail-value">{new Date(consulta.consultationdate + 'T00:00:00').toLocaleDateString('pt-BR')}</div></div>
                        <div className="form-group"><label>Hora</label><div className="detail-value">{consulta.consultationtime}</div></div>
                    </div>
                    
                    {/* Relatório Médico */}
                    {consulta.doctorReport && (
                        <div className="form-group full-width" style={{marginTop: '20px'}}>
                            <label><FaFileMedical /> Relatório do Veterinário</label>
                            <div className="detail-value long-text" style={{backgroundColor: '#fff', whiteSpace: 'pre-wrap'}}>
                                {consulta.doctorReport}
                            </div>
                        </div>
                    )}

                    {/* --- ANEXOS (Exames/Imagens) --- */}
                    {record?.attachments && record.attachments.length > 0 && (
                        <div className="attachments-section" style={{marginTop: '30px'}}>
                            <h4 style={{color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>
                                <FaPaperclip /> Exames e Anexos
                            </h4>
                            <div className="attachments-grid">
                                {record.attachments.map(att => (
                                    <a key={att.id || att.fileUrl} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-card-link">
                                        <FaFileMedical size={24}/>
                                        <span>{att.fileName || 'Arquivo'}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- PRESCRIÇÕES (Lista) --- */}
                    {record?.prescriptions && record.prescriptions.length > 0 && (
                        <div className="prescription-section" style={{marginTop: '30px'}}>
                            <h4 style={{color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>
                                <FaPrescriptionBottleAlt /> Receita Médica
                            </h4>
                            <div className="prescriptions-list-view">
                                {record.prescriptions.map((p, index) => (
                                    <div key={index} className="prescription-item-card">
                                        <div className="presc-header">
                                            <strong>{p.medicationName}</strong>
                                            <span className="presc-dose">{p.dosage}</span>
                                        </div>
                                        <div className="presc-body">
                                            <p><strong>Como usar:</strong> {p.frequency}</p>
                                            {p.duration && <p><strong>Duração:</strong> {p.duration}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Avaliação */}
                    <div className="doctor-section">
                        <h3 className="rating-title">Avalie o Atendimento</h3>
                        <div className="doctor-rating-container">
                             <div className="doctor-info">
                                 <img src={consulta?.doctorImageUrl || profileIcon} alt={consulta?.veterinaryName} className="doctor-avatar" onError={(e)=>{e.target.src=profileIcon}}/>
                                 <div className="doctor-details">
                                     <h4>{consulta?.veterinaryName}</h4>
                                     <p>{formatEnumLabel(consulta?.speciality)}</p>
                                 </div>
                            </div>
                            <div className="rating-controls">
                                 <div className="stars">
                                {[...Array(5)].map((star, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <button
                                             type="button" key={index} className="star-button"
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
                    </div>
                 </div>
            </div>
            <Footer />
        </div>
    );
};

export default ConsulCompleteDetails;