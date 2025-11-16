// src/pages/User/Chat/ConversationList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeaderComCadastro from '../../../components/HeaderComCadastro';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import './css/ConversationList.css'; 

const ConversationList = () => {
    const { user, loading: authLoading } = useAuth(); 
    const [consultas, setConsultas] = useState([]);
    const [servicos, setServicos] = useState([]); // --- ADICIONADO ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading || !user) return; 

        const fetchConversations = async () => {
            setLoading(true);
            setError('');
            try {
                // --- CORREÇÃO: BUSCA AMBOS OS ENDPOINTS ---
                const [consultasRes, servicosRes] = await Promise.all([
                    api.get('/consultas/my-consultations'),
                    api.get('/api/service-schedules/my-schedules')
                ]);

                // Filtra apenas as consultas que permitem chat
                const activeConsultas = (consultasRes.data || []).filter(c => 
                   ['PENDENTE', 'AGENDADA', 'FINALIZADA'].includes(c.status)
                );
                setConsultas(activeConsultas);

                // Filtra apenas os serviços que permitem chat
                const activeServicos = (servicosRes.data || []).filter(s => 
                   ['PENDENTE', 'AGENDADA', 'FINALIZADA'].includes(s.status)
                );
                setServicos(activeServicos);
                
            } catch (err) {
                setError('Não foi possível carregar suas conversas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user, authLoading]);

    const formatDate = (date, time) => {
        if (!date || !time) return '';
        const dateTime = new Date(`${date}T${time}`);
        return dateTime.toLocaleString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="conversation-page">
            <HeaderComCadastro />
             <main className="list-container">
                <div className="list-header">
                    <h1>Minhas Conversas</h1>
                </div>
                <div className="conversation-list">
                    {loading || authLoading ? <p style={{textAlign: 'center', padding: '20px'}}>Carregando...</p> : 
                     error ? <p className="error-message" style={{margin: '20px'}}>{error}</p> :
                    
                     (consultas.length === 0 && servicos.length === 0) ? (
                        <p style={{textAlign: 'center', padding: '20px'}}>Nenhuma conversa encontrada.</p>
                     ) : (
                        <>
                            {/* Lista de Consultas (Vets) */}
                            {consultas.map(conv => (
                                <Link to={`/chat/consultation/${conv.id}`} key={`c-${conv.id}`} className="conversation-item-link">
                                    <div className="conversation-item">
                                         <div className="avatar-placeholder">{conv.veterinaryName?.charAt(0)}</div>
                                        <div className="conversation-info">
                                             <span className="conversation-name">{conv.veterinaryName} (Veterinário)</span>
                                            <span className="conversation-subtitle">Conversa sobre o pet: {conv.petName}</span>
                                            <span className="conversation-details">
                                                 {formatDate(conv.consultationdate, conv.consultationtime)} - {conv.speciality}
                                            </span>
                                         </div>
                                    </div>
                                </Link>
                            ))}

                            {/* Lista de Serviços (Funcionários) */}
                            {servicos.map(serv => (
                                <Link to={`/chat/service/${serv.id}`} key={`s-${serv.id}`} className="conversation-item-link">
                                    <div className="conversation-item">
                                         <div className="avatar-placeholder">{serv.employeeName?.charAt(0)}</div>
                                        <div className="conversation-info">
                                             <span className="conversation-name">{serv.employeeName} (Funcionário)</span>
                                            <span className="conversation-subtitle">Conversa sobre: {serv.serviceName} (Pet: {serv.petName})</span>
                                            <span className="conversation-details">
                                                 {formatDate(serv.scheduleDate, serv.scheduleTime)}
                                            </span>
                                         </div>
                                    </div>
                                </Link>
                            ))}
                        </>
                     )
                    }
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ConversationList;