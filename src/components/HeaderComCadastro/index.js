// src/components/HeaderComCadastro/index.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';
import profileIcon from '../../assets/images/Header/perfilIcon.png';
import calendarIcon from '../../assets/images/Header/Calendario.png';
import { BsChatDots, BsBellFill } from 'react-icons/bs';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import './css/styles.css';

const HeaderComCadastro = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userImage, setUserImage] = useState(profileIcon);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Buscar foto do usuário
  useEffect(() => {
    const fetchUserImage = async () => {
      if (user?.id) {
        try {
          const response = await api.get(`/users/me?_t=${new Date().getTime()}`);
          if (response.data.imageurl) {
            // Adiciona timestamp para evitar cache
            const imageUrlWithTimestamp = `${response.data.imageurl}?t=${new Date().getTime()}`;
            setUserImage(imageUrlWithTimestamp);
          } else {
            setUserImage(profileIcon); // Garante que a imagem padrão seja usada se a URL for nula/vazia
          }
        } catch (error) {
          console.error('Erro ao buscar imagem do usuário:', error);
          setUserImage(profileIcon); // Fallback em caso de erro
        }
      }
    };
    fetchUserImage();

    // Listener para atualizar foto quando o perfil for atualizado
    const handleProfileUpdate = () => {
      fetchUserImage();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/notifications');
      const allNotifs = response.data;
      setNotifications(allNotifs);
      const count = allNotifs.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar notificações', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    // O logout já redireciona para '/' no AuthContext
  };

  return (
    <header className="header">
      <div className="logo">
        <NavLink to="/">
           <img src={logo} alt="Pet Vita Logo" />
        </NavLink>
      </div>
      
      <nav className="nav nav-center">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
        >
          Home
        </NavLink>
        <NavLink 
          to="/consultas" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
        >
           Consultas
        </NavLink>
        <NavLink 
          to="/pets" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
        >
          Pets
        </NavLink>
        <NavLink 
          to="/sobre-nos" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
        >
          Sobre nós
        </NavLink>
        <NavLink 
          to="/conversations" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
        >
          Chat
        </NavLink>
      </nav>
      
      <div className="icons-container">
    
        {/* --- ROTA ATUALIZADA AQUI --- */}
        <NavLink 
          to="/agendar-escolha" 
          className="calendar-icon" 
          title="Agendar"
        >
          <img src={calendarIcon} alt="Calendário" />
        </NavLink>
        
        <NavLink 
          to="/conversations" 
          className="header-icon" 
          title="Chat"
        >
          <BsChatDots size={26} />
        </NavLink>
        
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
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <NotificationDropdown notifications={notifications} onNotificationRead={fetchNotifications} />
          )}
        </div>
        
        <div className="profile-icon-container">
          <button
            type="button"
            className="profile-icon"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-haspopup="true"
            aria-expanded={showDropdown}
            aria-controls="user-profile-menu"
          >
            <img 
              src={userImage} 
              alt="Perfil" 
              onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }}
            />
          </button>
          
          {showDropdown && (
            <div id="user-profile-menu" className="dropdown-menu">
              <NavLink 
                to="/perfil" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Meu Perfil
              </NavLink>
              <button 
                 onClick={handleLogout} 
                className="dropdown-item" 
                style={{
                  border: 'none', 
                   width: '100%', 
                  textAlign: 'left', 
                  background: 'none', 
                  cursor: 'pointer'
                 }}
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

export default HeaderComCadastro;