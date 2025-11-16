// src/pages/User/Chat/ServiceChat.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import HeaderComCadastro from '../../../components/HeaderComCadastro';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { IoSend } from 'react-icons/io5';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './css/styles.css';

const ServiceChat = () => {
    const { serviceScheduleId } = useParams(); // ID do Serviço
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chatPartnerName, setChatPartnerName] = useState('Carregando...');
    
    useEffect(() => {
        const fetchPartnerName = async () => {
            if (!user) return;
            try {
                // Rota da API de funcionário (precisa estar criada no backend)
                const serviceResponse = await api.get(`/api/employee/schedules/${serviceScheduleId}`);
                const partner = user.role === 'USER' ? serviceResponse.data.employeeName : serviceResponse.data.clientName;
                setChatPartnerName(partner || "Desconhecido");
             } catch (err) {
                console.error("Erro ao buscar detalhes do serviço", err);
                setChatPartnerName("Desconhecido");
            }
        };
        fetchPartnerName();
     }, [serviceScheduleId, user]);

    useEffect(() => {
        if (!serviceScheduleId) return;
        setLoading(true);
        const q = query(
            // Ouve a nova coleção "services"
            collection(firestore, `services/${serviceScheduleId}/mensagens`), 
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoading(false);
        }, (err) => {
            console.error("Erro ao escutar mensagens:", err);
            setError("Não foi possível carregar o chat.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, [serviceScheduleId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const originalMessage = newMessage;
        setNewMessage('');
        try {
            // --- ROTA ATUALIZADA ---
            await api.post(`/chat/service/${serviceScheduleId}`, originalMessage, {
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (err) {
             console.error("Erro ao enviar mensagem:", err);
            setNewMessage(originalMessage);
            alert("Não foi possível enviar a mensagem.");
        }
    };

    return (
        <div className="chat-page">
            <HeaderComCadastro />
            <div className="chat-container">
                 <div className="chat-sidebar">
                    <div className="sidebar-header"><h3>Conversa</h3></div>
                    <div className="contact-list">
                        <div className="contact-item active">
                             <div className="contact-info">
                                <span className="contact-name">Serviço #{serviceScheduleId}</span>
                             </div>
                        </div>
                    </div>
                </div>

                 <div className="chat-main">
                    <div className="chat-header">
                        <span className="contact-name">{chatPartnerName} (Funcionário)</span>
                    </div>
                     <div className="message-area">
                        {loading && <p>Carregando histórico...</p>}
                        {error && <p className="error-message">{error}</p>}
                         {!loading && messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                 <strong>{msg.senderName}: </strong>
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
                         <button type="submit"> <IoSend size={22} /> </button>
                    </form>
                </div>
            </div>
             <Footer />
        </div>
    );
};

export default ServiceChat;