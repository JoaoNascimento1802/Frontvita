// src/pages/admin/Chat/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { IoSend } from 'react-icons/io5';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import '../Chat/css/Chat.css';

const AdminChat = () => {
    const { user, loading: authLoading } = useAuth();
    const messagesEndRef = useRef(null);

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null); // Agora vai guardar { id, type, ...data }
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchConversations = async () => {
            setLoadingConversations(true);
            try {
                // Listas para guardar os dados
                let allConsultas = [];
                let allServicos = [];

                // Se for ADMIN, busca tudo
                if (user.role === 'ADMIN') {
                    const [consultasRes, servicosRes] = await Promise.all([
                        api.get('/admin/consultations'),
                        api.get('/admin/service-schedules')
                    ]);
                    allConsultas = consultasRes.data || [];
                    allServicos = servicosRes.data || [];
                } 
                // Se for FUNCIONÁRIO, busca só os serviços dele
                else if (user.role === 'EMPLOYEE') {
                    const servicosRes = await api.get('/api/employee/my-schedules');
                    allServicos = servicosRes.data || [];
                    // Opcional: Funcionário também pode ver consultas? Se sim, descomente a linha abaixo.
                    // const consultasRes = await api.get('/admin/consultations'); 
                    // allConsultas = consultasRes.data || [];
                }

                // Mapeia consultas para o formato unificado
                const mappedConsultas = allConsultas
                    .filter(c => ['PENDENTE', 'AGENDADA', 'FINALIZADA', 'CHECKED_IN', 'EM_ANDAMENTO'].includes(c.status))
                    .map(c => ({
                        id: c.id,
                        type: 'consultation', // Identifica o tipo
                        displayName: `${c.userName} <> ${c.veterinaryName}`,
                        petName: `Pet: ${c.petName} (Consulta #${c.id})`,
                        avatarChar: c.userName?.charAt(0)
                    }));

                // Mapeia serviços para o formato unificado
                const mappedServicos = allServicos
                    .filter(s => ['PENDENTE', 'AGENDADA', 'FINALIZADA'].includes(s.status))
                    .map(s => ({
                        id: s.id,
                        type: 'service', // Identifica o tipo
                        displayName: `${s.clientName} <> ${s.employeeName}`,
                        petName: `Pet: ${s.petName} (Serviço #${s.id})`,
                        avatarChar: s.clientName?.charAt(0)
                    }));
                
                setConversations([...mappedConsultas, ...mappedServicos]);

            } catch (error) {
                console.error("Erro ao buscar conversas", error);
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchConversations();
    }, [user, authLoading]);

    useEffect(() => {
        // Agora o 'listener' depende do tipo de conversa ativa
        if (!activeConversation) return;

        setLoadingMessages(true);
        
        const collectionName = activeConversation.type === 'service' ? 'services' : 'consultas';
        const docId = activeConversation.id.toString();

        const q = query(
            collection(firestore, `${collectionName}/${docId}/mensagens`),
            orderBy("timestamp", "asc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoadingMessages(false);
        }, (err) => {
            console.error("Erro ao escutar snapshot:", err);
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [activeConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleConversationClick = (conv) => {
        setActiveConversation(conv);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeConversation) return;
        
        const originalMessage = newMessage;
        setNewMessage('');

        // --- CORREÇÃO: Envia para a rota correta (consulta ou serviço) ---
        const { type, id } = activeConversation;
        
        try {
            await api.post(`/chat/${type}/${id}`, originalMessage, {
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
            setNewMessage(originalMessage);
            alert("Não foi possível enviar a mensagem.");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header"><h3>Conversas Ativas</h3></div>
                <div className="contact-list">
                    {loadingConversations ? <p style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p> : conversations.map(conv => (
                        <div 
                            key={`${conv.type}-${conv.id}`} 
                            className={`contact-item ${activeConversation?.id === conv.id && activeConversation?.type === conv.type ? 'active' : ''}`}
                            onClick={() => handleConversationClick(conv)}
                        >
                            <div className="card-avatar-placeholder">{conv.avatarChar}</div>
                            <div className="contact-info">
                                <span className="contact-name">{conv.displayName}</span>
                                <span className="contact-last-message">{conv.petName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="chat-main">
                {activeConversation ? (
                    <>
                        <div className="chat-header">
                            <span className="contact-name">{activeConversation.displayName}</span>
                        </div>
                        <div className="message-area">
                            {loadingMessages ? <p>Carregando mensagens...</p> : messages.map(msg => (
                                <div key={msg.id} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                    <strong>{msg.senderName}: </strong>{msg.content}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input type="text" placeholder="Digite sua mensagem..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <button type="submit"><IoSend size={22} /></button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">Selecione uma conversa para visualizar</div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;