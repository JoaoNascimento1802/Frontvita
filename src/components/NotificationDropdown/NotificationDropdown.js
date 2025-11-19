// src/components/NotificationDropdown/NotificationDropdown.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './css/NotificationDropdown.css';

const NotificationDropdown = ({ notifications, onNotificationRead }) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    try {
      // 1. Marca como lida no backend
      if (!notification.read) {
        await api.post(`/notifications/${notification.id}/read`);
        onNotificationRead(); // Atualiza o contador no Header
      }

      // 2. Redireciona dependendo do tipo de notificação
      // Se tiver um ID de consulta associado, vai para o chat ou detalhes
      if (notification.consultationId) {
        // Tenta ir para o chat da consulta
        navigate(`/chat/consultation/${notification.consultationId}`);
      } else {
        // Se for genérica, vai para a lista de consultas
        navigate('/consultas');
      }

    } catch (error) {
      console.error("Erro ao processar notificação", error);
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className="notification-dropdown empty">
        <p>Nenhuma notificação.</p>
      </div>
    );
  }

  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <h4>Notificações</h4>
      </div>
      <ul className="notification-list">
        {notifications.map((notif) => (
          <li 
            key={notif.id} 
            className={`notification-item ${!notif.read ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notif)}
          >
            <div className="notif-content">
              <p className="notif-message">{notif.message}</p>
              <span className="notif-time">
                {new Date(notif.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            {!notif.read && <span className="unread-dot"></span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;