import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';
import profileIcon from '../../assets/images/Header/perfilIcon.png';
import { BsChatDots, BsBellFill } from 'react-icons/bs';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import './css/Header.css';

const HeaderVet = () => {
  // Estados para controle de UI e Dados
  const [showDropdown, setShowDropdown] = useState(false); // Menu de Perfil
  const [showNotifications, setShowNotifications] = useState(false); // Menu de Notificações
  const [notifications, setNotifications] = useState([]); // Lista de notificações
  const [unreadCount, setUnreadCount] = useState(0); // Contador de não lidas
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Refs para detectar clique fora
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- LÓGICA DE BUSCA DE NOTIFICAÇÕES ---
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      // O endpoint /notifications retorna as notificações do usuário logado (seja ele Vet, Admin ou User)
      const response = await api.get('/notifications');
      const allNotifs = response.data;
      
      setNotifications(allNotifs);
      
      // Conta quantas não foram lidas para exibir no badge vermelho
      const count = allNotifs.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar notificações do veterinário:', error);
    }
  }, [user]);

  // 1. Busca inicial e Configuração do Polling (Intervalo)
  useEffect(() => {
    fetchNotifications(); // Busca imediatamente ao carregar
    
    // Configura atualização a cada 15 segundos para tempo real
    const intervalId = setInterval(fetchNotifications, 15000);
    
    // Limpa o intervalo quando o componente desmonta
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // 2. Lógica para fechar dropdowns ao clicar fora deles
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Se clicou fora da área de notificação, fecha o dropdown
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      // Se clicou fora da área de perfil, fecha o dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <NavLink to="/vet/dashboard"><img src={logo} alt="Pet Vita Logo" /></NavLink>
      </div>
      
      <nav className="nav nav-center" aria-label="Navegação do veterinário">
        <NavLink to="/vet/dashboard" className={({isActive}) => `nav_link ${isActive ? 'active' : ''}`}>Home</NavLink>
        <NavLink to="/vet/consultas" className={({isActive}) => `nav_link ${isActive ? 'active' : ''}`}>Consultas</NavLink>
        <NavLink to="/vet/relatorios" className={({isActive}) => `nav_link ${isActive ? 'active' : ''}`}>Relatórios</NavLink>
      </nav>

      <div className="icons-container">
        {/* Ícone de Chat */}
        <NavLink to="/vet/chat" className="header-icon" title="Chat">
            <BsChatDots size={26} />
        </NavLink>
        
        {/* --- ÁREA DE NOTIFICAÇÃO --- */}
        <div className="notification-icon-wrapper" ref={notifRef} style={{ position: 'relative' }}>
            <button
                type="button"
                className="header-icon notification-icon"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-haspopup="true"
                aria-expanded={showNotifications}
                title="Notificações"
            >
                <BsBellFill size={26} />
                {/* Badge Vermelho condicional */}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            {/* Dropdown de Notificações */}
            {showNotifications && (
              <NotificationDropdown 
                notifications={notifications} 
                onNotificationRead={fetchNotifications} // Passa a função para atualizar a lista ao ler
              />
            )}
        </div>
        
        {/* --- ÁREA DE PERFIL --- */}
        <div className="profile-icon-container" ref={profileRef}>
          <button
            type="button"
            className="profile-icon"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-haspopup="true"
            aria-expanded={showDropdown}
            aria-controls="vet-profile-menu"
          >
            <img 
              src={user?.imageurl || profileIcon} 
              alt="Perfil" 
              onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }}
            />
          </button>
          
          {showDropdown && (
            <div id="vet-profile-menu" className="dropdown-menu">
              <NavLink 
                to="/vet/perfil" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Meu Perfil
              </NavLink>
              <button 
                onClick={handleLogout} 
                className="dropdown-item" 
                style={{border: 'none', width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer'}}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderVet;