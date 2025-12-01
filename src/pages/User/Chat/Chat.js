// src/pages/User/Chat/Chat.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import HeaderComCadastro from '../../../components/HeaderComCadastro';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { IoSend, IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import './css/chat-styles.css';

const Chat = () => {
    const { consultationId } = useParams(); // ID da Consulta
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chatPartnerName, setChatPartnerName] = useState('Carregando...');
    const [chatRoomId, setChatRoomId] = useState(null);
    
    useEffect(() => {
        const fetchDetails = async () => {
            if (!user) return;
            try {
                const consultaResponse = await api.get(`/consultas/${consultationId}`);
                setChatRoomId(consultaResponse.data.chatRoomId);
                const partner = user.role === 'USER' ? consultaResponse.data.veterinaryName : consultaResponse.data.userName;
                setChatPartnerName(partner || "Desconhecido");
            } catch (err) {
                console.error("Erro ao buscar detalhes da consulta", err);
                setChatPartnerName("Desconhecido");
            }
        };
        fetchDetails();
    }, [consultationId, user]);

    useEffect(() => {
        if (!chatRoomId) return;
        setLoading(true);

        // DIAGNÓSTICO: Verifica se o chatRoomId está chegando
        console.log("Conectando ao chat do usuário. Consultation ID:", consultationId, "UUID (Room):", chatRoomId);

        // LÓGICA CORRETA: Usa 'chatRoomId' se existir.
        // Se for uma consulta muito antiga sem UUID, usa o ID normal (fallback)
        const roomId = chatRoomId || consultationId;

        // Define a coleção base. Se tiver UUID, usa 'chats', senão usa a antiga 'consultas'
        const collectionName = chatRoomId ? 'chats' : 'consultas';

        const q = query(
            collection(firestore, `${collectionName}/${roomId}/mensagens`),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Firebase snapshot recebido. Total de mensagens:", msgs.length);
            setMessages(msgs);
            setLoading(false);
        }, (err) => {
            console.error("Erro ao escutar mensagens:", err);
            setError("Não foi possível carregar o chat.");
            setLoading(false);
        });
        return () => {
            console.log("Limpando listener do Firebase");
            unsubscribe();
        };
    }, [chatRoomId, consultationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const originalMessage = newMessage;
        setNewMessage('');
        try {
            // CORREÇÃO: Removemos o terceiro argumento que continha o header text/plain
            await api.post(`/chat/consultation/${consultationId}`, {
                content: originalMessage
            });
        } catch (err) {
             console.error("Erro ao enviar mensagem:", err);
            setNewMessage(originalMessage);
            alert("Não foi possível enviar a mensagem.");
        }
    };

    console.log("Renderizando chat. Messages:", messages.length, "Loading:", loading);

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
                            <span style={{ fontWeight: 600, color: '#333' }}>Consulta #{consultationId}</span>
                        </div>
                    </div>
                </div>

                <div className="user-chat-main">
                    <div className="user-chat-header">
                        <span style={{ fontWeight: 600, color: '#333' }}>{chatPartnerName} (Veterinário)</span>
                    </div>
                    <div className="user-message-area">
                        {loading && <p>Carregando histórico...</p>}
                        {error && <p style={{ color: '#d32f2f' }}>{error}</p>}
                        {!loading && messages.map(msg => (
                            <div 
                                key={msg.id} 
                                className={`user-message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                            >
                                <strong>{msg.senderName}: </strong>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <form className="user-message-input-area" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder='Digite sua mensagem...'
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit">
                            <IoSend size={22} />
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Chat;