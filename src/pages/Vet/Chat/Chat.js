import React, { useState, useEffect, useRef } from 'react';
import HeaderVet from '../../../components/HeaderVet/HeaderVet';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { IoSend } from 'react-icons/io5';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import '../css/styles.css'; 

const VetChat = () => {
    const { user, loading: authLoading } = useAuth();
    const messagesEndRef = useRef(null);

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [allNotifications, setAllNotifications] = useState([]);
    const [unreadConversations, setUnreadConversations] = useState(new Set());

    // 1. Busca conversas
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchData = async () => {
            setLoadingConversations(true);
            try {
                // Busca consultas do veterinário
                const [convResponse, notifResponse] = await Promise.all([
                    api.get('/consultas/vet/my-consultations'),
                    api.get('/notifications')
                ]);

                // Filtra apenas consultas ativas (Agendada/Finalizada/Em Andamento)
                const activeConversations = convResponse.data.filter(c => 
                    ['AGENDADA', 'FINALIZADA', 'EM_ANDAMENTO', 'CHECKED_IN'].includes(c.status)
                );
                setConversations(activeConversations);
                
                // Lógica de notificações não lidas
                const unreadNotifs = notifResponse.data.filter(n => !n.read && n.consultationId);
                setAllNotifications(unreadNotifs);
                const unreadIds = new Set(unreadNotifs.map(n => n.consultationId));
                setUnreadConversations(unreadIds);

            } catch (error) {
                console.error("Erro ao buscar dados do chat:", error);
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchData();
    }, [user, authLoading]);

    // 2. Listener do Firebase
    useEffect(() => {
        if (!activeConversation) return;
        setLoadingMessages(true);

        // DIAGNÓSTICO: Verifica se o chatRoomId está chegando
        // Se aparecer "undefined" no console, significa que o DTO do Backend não está enviando este campo.
        console.log("Conectando ao chat. ID:", activeConversation.id, "UUID (Room):", activeConversation.chatRoomId);

        // LÓGICA CORRETA: Usa 'chatRoomId' se existir.
        // Se for uma consulta muito antiga sem UUID, usa o ID normal (fallback), 
        // mas o ideal é que todas tenham UUID agora.
        const roomId = activeConversation.chatRoomId || activeConversation.id.toString();

        // Define a coleção base. Se tiver UUID, usa 'chats', senão usa a antiga 'consultas'
        const collectionName = activeConversation.chatRoomId ? 'chats' : 'consultas';

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
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleConversationClick = (conv) => {
        setActiveConversation(conv);

        // Limpa notificação visual se houver
        if (unreadConversations.has(conv.id)) {
            const notificationsToClear = allNotifications.filter(n => n.consultationId === conv.id);
            notificationsToClear.forEach(n => api.post(`/notifications/${n.id}/read`));

            setUnreadConversations(prev => {
                const newSet = new Set(prev);
                newSet.delete(conv.id);
                return newSet;
            });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeConversation) return;
        
        const originalMessage = newMessage;
        setNewMessage(''); // Limpa input imediatamente para melhor UX

        try {
            // --- CORREÇÃO CRÍTICA AQUI ---
            // A URL estava /chat/{id}, mas o backend agora exige /chat/consultation/{id}
            await api.post(`/chat/consultation/${activeConversation.id}`, originalMessage, {
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
            setNewMessage(originalMessage); // Devolve a mensagem se falhar
            alert("Não foi possível enviar a mensagem.");
        }
    };

    return (
        <div className="chat-page">
            <HeaderVet />
            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="sidebar-header"><h3>Conversas</h3></div>
                    <div className="contact-list">
                        {loadingConversations ? <p style={{padding: '20px'}}>Carregando...</p> : conversations.map(conv => (
                            <div 
                                key={conv.id} 
                                className={`contact-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                                onClick={() => handleConversationClick(conv)}
                            >
                                <div className="card-avatar-placeholder">{conv.userName?.charAt(0)}</div>
                                <div className="contact-info">
                                    <span className="contact-name">{conv.userName}</span>
                                    <span className="contact-last-message">Pet: {conv.petName}</span>
                                </div>
                                {unreadConversations.has(conv.id) && <span className="unread-badge">!</span>}
                            </div>
                        ))}
                        {conversations.length === 0 && !loadingConversations && (
                            <p style={{padding: '20px', color: '#777'}}>Nenhuma consulta ativa no momento.</p>
                        )}
                    </div>
                </div>
                
                <div className="chat-main">
                    {activeConversation ? (
                        <>
                            <div className="chat-header">
                                <span className="contact-name">{activeConversation.userName} (Tutor de {activeConversation.petName})</span>
                            </div>
                            <div className="message-area">
                                {loadingMessages ? <p>Carregando mensagens...</p> : messages.map(msg => (
                                    <div key={msg.id} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                        {msg.content}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="message-input-area" onSubmit={handleSendMessage}>
                                <input 
                                    type="text" 
                                    placeholder='Digite sua mensagem...'
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit"><IoSend size={22} /></button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">Selecione uma conversa para começar</div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VetChat;