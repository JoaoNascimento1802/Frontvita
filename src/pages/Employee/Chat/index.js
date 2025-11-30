import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { IoSend } from 'react-icons/io5';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Footer from '../../../components/Footer';
import HeaderEmployee from '../../../components/HeaderEmployee';
import './styles.css';
import '../css/styles.css';

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
            await api.post(`/chat/service/${activeConversation.id}`, originalMessage, {
                headers: { 'Content-Type': 'text/plain' }
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
                    <div className="chat-container">
                        <div className="chat-sidebar">
                            <div className="sidebar-header">
                                <h3>Atendimentos</h3>
                            </div>
                            <div className="contact-list">
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
                                            className={`contact-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                                            onClick={() => handleConversationClick(conv)}
                                        >
                                            <div className="card-avatar-placeholder">{conv.avatarChar}</div>
                                            <div className="contact-info">
                                                <span className="contact-name">{conv.displayName}</span>
                                                <span className="contact-last-message">{conv.subTitle}</span>
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
                                        {loadingMessages ? (
                                            <p>Carregando...</p>
                                        ) : (
                                            messages.map(msg => (
                                                <div 
                                                    key={msg.id} 
                                                    className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                                                >
                                                    <strong>{msg.senderName}: </strong>
                                                    {msg.content}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <form className="message-input-area" onSubmit={handleSendMessage}>
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
                                <div className="no-chat-selected">
                                    Selecione um atendimento para iniciar o chat
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
