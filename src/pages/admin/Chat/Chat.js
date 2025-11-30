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
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchConversations = async () => {
            setLoadingConversations(true);
            try {
                let allConsultas = [];
                let allServicos = [];

                if (user.role === 'ADMIN') {
                    const [consultasRes, servicosRes] = await Promise.all([
                        api.get('/admin/consultations'),
                        api.get('/admin/service-schedules')
                    ]);
                    allConsultas = consultasRes.data || [];
                    allServicos = servicosRes.data || [];
                } 
                else if (user.role === 'EMPLOYEE') {
                    const servicosRes = await api.get('/api/employee/my-schedules');
                    allServicos = servicosRes.data || [];
                }

                // Mapeia Consultas (Admin vê tudo)
                const mappedConsultas = allConsultas
                    .filter(c => ['AGENDADA', 'FINALIZADA', 'CHECKED_IN', 'EM_ANDAMENTO'].includes(c.status))
                    .map(c => ({
                        id: c.id,
                        chatRoomId: c.chatRoomId, // UUID
                        type: 'consultation',
                        displayName: `${c.userName} (Tutor) - ${c.veterinaryName} (Vet)`,
                        petName: `Pet: ${c.petName} - ${c.speciality}`,
                        avatarChar: c.userName?.charAt(0)
                    }));

                // Mapeia Serviços (Admin vê tudo, Func vê seus clientes)
                const mappedServicos = allServicos
                    .filter(s => ['AGENDADA', 'FINALIZADA'].includes(s.status))
                    .map(s => {
                        // MELHORIA DE UI: Se for funcionário, mostra só o nome do cliente
                        const displayName = user.role === 'EMPLOYEE' 
                            ? `${s.clientName} (Tutor)`
                            : `${s.clientName} (Tutor) - ${s.employeeName} (Func)`;

                        return {
                            id: s.id,
                            chatRoomId: s.chatRoomId, // UUID
                            type: 'service',
                            displayName: displayName,
                            petName: `Pet: ${s.petName} - ${s.serviceName}`,
                            avatarChar: s.clientName?.charAt(0)
                        };
                    });
                
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
        if (!activeConversation) return;

        setLoadingMessages(true);
        
        // Lógica de UUID vs Legado
        const roomId = activeConversation.chatRoomId || activeConversation.id.toString();
        const collectionName = activeConversation.chatRoomId ? 'chats' : (activeConversation.type === 'service' ? 'services' : 'consultas');

        console.log(`Conectando ao chat [${collectionName}]: ${roomId}`);

        const q = query(
            collection(firestore, `${collectionName}/${roomId}/mensagens`),
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

        // Define a URL baseada no tipo (consulta ou serviço)
        const endpointType = activeConversation.type === 'service' ? 'service' : 'consultation';
        
        try {
            // Envia JSON { content: ... }
            await api.post(`/chat/${endpointType}/${activeConversation.id}`, {
                content: originalMessage
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
                    {loadingConversations ? (
                        <p style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>
                    ) : conversations.length === 0 ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Nenhuma conversa encontrada.</p>
                    ) : (
                        conversations.map(conv => (
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
                        ))
                    )}
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
                            <input 
                                type="text" 
                                placeholder="Digite sua mensagem..." 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                            />
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