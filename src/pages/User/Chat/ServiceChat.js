import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import HeaderComCadastro from '../../../components/HeaderComCadastro';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { IoSend } from 'react-icons/io5';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './css/chat-styles.css'; // Garanta que seu CSS com as classes .user-* está aqui

const ServiceChat = () => {
    const { serviceScheduleId } = useParams();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [chatPartnerName, setChatPartnerName] = useState('Carregando...');
    const [chatRoomId, setChatRoomId] = useState(null);

    // 1. Busca Detalhes do Serviço (UUID e Nome do Parceiro)
    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (!user) return;
            try {
                const response = await api.get(`/api/service-schedules/${serviceScheduleId}`);
                
                // Salva o UUID da sala
                setChatRoomId(response.data.chatRoomId);
                
                const partner = user.role === 'USER' 
                    ? response.data.employeeName 
                    : response.data.clientName;
                
                setChatPartnerName(partner || "Desconhecido");

            } catch (err) {
                console.error("Erro ao buscar detalhes do serviço", err);
                setChatPartnerName("Desconhecido");
                setError("Não foi possível carregar os dados do chat.");
            }
        };
        fetchServiceDetails();
    }, [serviceScheduleId, user]);

    // 2. Conecta ao Firebase (Usando UUID)
    useEffect(() => {
        if (!serviceScheduleId || chatRoomId === undefined) return;
        
        setLoading(true);

        const roomId = chatRoomId || serviceScheduleId;
        const collectionName = chatRoomId ? 'chats' : 'services';
        
        console.log(`User Service Chat: Conectando em ${collectionName}/${roomId}`);

        const q = query(
            collection(firestore, `${collectionName}/${roomId}/mensagens`),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoading(false);
        }, (err) => {
            console.error("Erro ao escutar mensagens:", err);
            setError("Não foi possível carregar o histórico.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [serviceScheduleId, chatRoomId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 3. Envia Mensagem (JSON)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const originalMessage = newMessage;
        setNewMessage('');
        
        try {
            await api.post(`/chat/service/${serviceScheduleId}`, {
                content: originalMessage
            });
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
            setNewMessage(originalMessage);
            alert("Não foi possível enviar a mensagem.");
        }
    };

    return (
        <div className="user-chat-page">
            <HeaderComCadastro />
            <div className="user-chat-container">
                 <div className="user-chat-sidebar">
                    <div className="user-sidebar-header">
                        <h3>Conversa</h3>
                    </div>
                    <div className="user-contact-list">
                        <div className="user-contact-item">
                             <div className="contact-info">
                                <span className="contact-name">Serviço #{serviceScheduleId}</span>
                             </div>
                        </div>
                    </div>
                </div>

                 <div className="user-chat-main">
                    <div className="user-chat-header">
                        <span className="contact-name">{chatPartnerName} (Funcionário)</span>
                    </div>
                     <div className="user-message-area">
                        {loading && <p>Carregando histórico...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {!loading && messages.map(msg => (
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
                            placeholder='Digite sua mensagem...'
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit"> <IoSend size={22} /> </button>
                    </form>
                </div>
            </div>
             <Footer />
        </div>
    );
};

export default ServiceChat;