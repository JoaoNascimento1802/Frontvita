import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { IoSend, IoArrowBack } from 'react-icons/io5';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import '../../User/Chat/css/chat-styles.css';
import '../../User/Chat/css/ConversationList.css';

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
                const [consultasRes, servicosRes] = await Promise.all([
                    api.get('/admin/consultations'),
                    api.get('/admin/service-schedules')
                ]);
                const allConsultas = consultasRes.data || [];
                const allServicos = servicosRes.data || [];

                const mappedConsultas = allConsultas
                    .filter(c => ['AGENDADA', 'FINALIZADA', 'CHECKED_IN', 'EM_ANDAMENTO'].includes(c.status))
                    .map(c => ({
                        id: c.id,
                        chatRoomId: c.chatRoomId,
                        type: 'consultation',
                        displayName: `${c.userName} ↔ ${c.veterinaryName}`,
                        subTitle: `Pet: ${c.petName} - ${c.speciality}`,
                        avatarChar: c.userName?.charAt(0)
                    }));

                const mappedServicos = allServicos
                    .filter(s => ['AGENDADA', 'FINALIZADA'].includes(s.status))
                    .map(s => ({
                        id: s.id,
                        chatRoomId: s.chatRoomId,
                        type: 'service',
                        displayName: `${s.clientName} ↔ ${s.employeeName}`,
                        subTitle: `Pet: ${s.petName} - ${s.serviceName}`,
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
        if (!activeConversation) return;

        setLoadingMessages(true);
        
        const roomId = activeConversation.chatRoomId || activeConversation.id.toString();
        const collectionName = activeConversation.chatRoomId ? 'chats' : (activeConversation.type === 'service' ? 'services' : 'consultas');

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

        // Se activeConversation.type não estiver definido, assume consultation
        const endpointType = activeConversation.type === 'service' ? 'service' : 'consultation';
        
        try {
            // Envia JSON
            await api.post(`/chat/${endpointType}/${activeConversation.id}`, {
                content: originalMessage
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
            setNewMessage(originalMessage);
            toast.error("Não foi possível enviar a mensagem.");
        }
    };

    // Se não há conversa ativa, mostra a lista de conversas (igual ConversationList do usuário)
    if (!activeConversation) {
        return (
            <div className="conversation-page">
                <HeaderAdmin />
                <main className="list-container">
                    <div className="list-header">
                        <h1>Conversas Ativas</h1>
                    </div>
                    <div className="conversation-list">
                        {loadingConversations ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Carregando...</p>
                        ) : conversations.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Nenhuma conversa encontrada.</p>
                        ) : (
                            conversations.map(conv => (
                                <div 
                                    key={`${conv.type}-${conv.id}`} 
                                    className="conversation-item"
                                    onClick={() => handleConversationClick(conv)}
                                >
                                    <div className="avatar-placeholder">{conv.avatarChar}</div>
                                    <div className="conversation-info">
                                        <span className="conversation-name">{conv.displayName}</span>
                                        <span className="conversation-subtitle">{conv.subTitle}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Se há conversa ativa, mostra o chat (igual Chat do usuário)
    return (
        <div className="user-chat-page">
            <HeaderAdmin />
            <div className="user-chat-container">
                <div className="user-chat-sidebar">
                    <div className="user-sidebar-header">
                        <h3>Conversas</h3>
                    </div>
                    <div className="user-contact-list">
                        {conversations.map(conv => (
                            <div 
                                key={`${conv.type}-${conv.id}`} 
                                className={`user-contact-item ${activeConversation?.id === conv.id && activeConversation?.type === conv.type ? 'active' : ''}`}
                                onClick={() => handleConversationClick(conv)}
                            >
                                <div className="avatar-placeholder" style={{ marginRight: '15px' }}>{conv.avatarChar}</div>
                                <div className="conversation-info">
                                    <span className="conversation-name">{conv.displayName}</span>
                                    <span className="conversation-subtitle">{conv.subTitle}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="user-chat-main">
                    <div className="user-chat-header">
                        <button 
                            className="back-to-list-btn"
                            onClick={() => setActiveConversation(null)}
                            aria-label="Voltar para lista de conversas"
                        >
                            <IoArrowBack size={24} />
                        </button>
                        <span>{activeConversation.displayName}</span>
                    </div>
                    <div className="user-message-area">
                        {loadingMessages ? <p>Carregando mensagens...</p> : messages.map(msg => (
                            <div key={msg.id} className={`user-message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                <strong>{msg.senderName}: </strong>
                                {msg.content}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="user-message-input-area" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Digite sua mensagem..." 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                        />
                        <button type="submit"><IoSend size={22} /></button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminChat;
