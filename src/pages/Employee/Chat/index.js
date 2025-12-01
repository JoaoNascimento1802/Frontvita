import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { IoSend, IoArrowBack } from 'react-icons/io5';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Footer from '../../../components/Footer';
import HeaderEmployee from '../../../components/HeaderEmployee';
import './styles.css';
import '../../User/Chat/css/chat-styles.css';

const EmployeeChat = () => {
    const { user, loading: authLoading } = useAuth();

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
                const response = await api.get('/api/employee/my-schedules');
                const allSchedules = response.data || [];

                const mappedConversations = allSchedules
                    .filter(s => ['AGENDADA', 'FINALIZADA', 'EM_ANDAMENTO'].includes(s.status))
                    .map(s => ({
                        id: s.id,
                        chatRoomId: s.chatRoomId,
                        type: 'service',
                        displayName: `${s.clientName} (Tutor)`,
                        subTitle: `Pet: ${s.petName} - ${s.serviceName}`,
                        avatarChar: s.clientName?.charAt(0)
                    }));

                setConversations(mappedConversations);
            } catch (error) {
                console.error("Erro ao buscar conversas do funcionário", error);
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
        const collectionName = activeConversation.chatRoomId ? 'chats' : 'services';

        const q = query(
            collection(firestore, `${collectionName}/${roomId}/mensagens`),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoadingMessages(false);
        }, (err) => {
            console.error("Erro ao escutar mensagens:", err);
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [activeConversation]);

    const handleConversationClick = (conv) => {
        setActiveConversation(conv);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeConversation) return;

        const originalMessage = newMessage;
        setNewMessage('');

        try {
            // CORREÇÃO: Removido o header manual
            await api.post(`/chat/service/${activeConversation.id}`, {
                content: originalMessage
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
            setNewMessage(originalMessage);
            alert("Não foi possível enviar a mensagem.");
        }
    };

    return (
        <div className="employee-page employee-chat-page">
            <HeaderEmployee />
            <main className="employee-content">
                <div className="employee-header">
                    <h1>Chat de Serviços</h1>
                    <p>Comunique-se com os tutores dos pets agendados.</p>
                </div>
                <div className="employee-chat-container">
                    <div className={`user-chat-container ${activeConversation ? 'chat-active' : ''}`}>
                        <div className="user-chat-sidebar">
                            <div className="user-sidebar-header">
                                <h3>Atendimentos</h3>
                            </div>
                            <div className="user-contact-list">
                                {loadingConversations ? (
                                    <p style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>
                                ) : conversations.length === 0 ? (
                                    <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                        Nenhum atendimento ativo.
                                    </p>
                                ) : (
                                    conversations.map(conv => (
                                        <div 
                                            key={conv.id} 
                                            className={`user-contact-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                                            onClick={() => handleConversationClick(conv)}
                                        >
                                            <div className="contact-info">
                                                <span style={{ fontWeight: 600, color: '#333' }}>{conv.displayName}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#888' }}>{conv.subTitle}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="user-chat-main">
                            {activeConversation ? (
                                <>
                                    <div className="user-chat-header">
                                        <button 
                                            className="back-to-list-btn"
                                            onClick={() => setActiveConversation(null)}
                                            aria-label="Voltar para lista de conversas"
                                        >
                                            <IoArrowBack size={24} />
                                        </button>
                                        <span style={{ fontWeight: 600, color: 'white' }}>{activeConversation.displayName}</span>
                                    </div>
                                    <div className="user-message-area">
                                        {loadingMessages ? (
                                            <p>Carregando...</p>
                                        ) : (
                                            messages.map(msg => (
                                                <div 
                                                    key={msg.id} 
                                                    className={`user-message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                                                >
                                                    <strong>{msg.senderName}: </strong>
                                                    {msg.content}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <form className="user-message-input-area" onSubmit={handleSendMessage}>
                                        <input 
                                            type="text" 
                                            placeholder="Digite sua mensagem..." 
                                            value={newMessage} 
                                            onChange={(e) => setNewMessage(e.target.value)} 
                                        />
                                        <button type="submit">
                                            <IoSend size={22} />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="user-message-area" style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: '#888', fontSize: '1.2rem' }}>Selecione um atendimento para iniciar o chat</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EmployeeChat;
