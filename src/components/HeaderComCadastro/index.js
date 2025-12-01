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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="header" role="banner">
      <div className="logo">
        <NavLink to="/" aria-label="Pet Vita - Ir para página inicial">
           <img src={logo} alt="Pet Vita - Logotipo da clínica veterinária" />
        </NavLink>
      </div>

      <button 
        className="mobile-menu-toggle" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu de navegação"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <nav id="nav" className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Navegação principal">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
          aria-current={({ isActive }) => isActive ? 'page' : undefined}
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </NavLink>
        <NavLink 
          to="/consultas" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
          aria-current={({ isActive }) => isActive ? 'page' : undefined}
          onClick={() => setMobileMenuOpen(false)}
        >
           Consultas
        </NavLink>
        <NavLink 
          to="/pets" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
          aria-current={({ isActive }) => isActive ? 'page' : undefined}
          onClick={() => setMobileMenuOpen(false)}
        >
          Pets
        </NavLink>
        <NavLink 
          to="/sobre-nos" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
          aria-current={({ isActive }) => isActive ? 'page' : undefined}
          onClick={() => setMobileMenuOpen(false)}
        >
          Sobre nós
        </NavLink>
        <NavLink 
          to="/conversations" 
          className={({ isActive }) => `nav_link ${isActive ? 'active' : ''}`}
          aria-current={({ isActive }) => isActive ? 'page' : undefined}
          onClick={() => setMobileMenuOpen(false)}
        >
          Chat
        </NavLink>

        {/* Icons para mobile - dentro do nav */}
        <div className="icons-mobile">
          <NavLink to="/agendar-escolha" className="icon-item" onClick={() => setMobileMenuOpen(false)}>
            <img src={calendarIcon} alt="" style={{ width: 24, height: 24 }} />
            <span className="icon-label">Agendar</span>
          </NavLink>
          <NavLink to="/conversations" className="icon-item" onClick={() => setMobileMenuOpen(false)}>
            <BsChatDots size={24} color="#8D7EFB" />
            <span className="icon-label">Chat</span>
          </NavLink>
          <NavLink to="/perfil" className="icon-item" onClick={() => setMobileMenuOpen(false)}>
            <img src={userImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }} />
            <span className="icon-label">Meu Perfil</span>
          </NavLink>
          <button className="icon-item" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            <span className="icon-label" style={{ color: '#ff4d4d' }}>Sair</span>
          </button>
        </div>
      </nav>

      {/* Overlay para fechar menu */}
      {mobileMenuOpen && (
        <div className="mobile-overlay active" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <div className="icons-container icons-desktop" role="toolbar" aria-label="Ações rápidas">
    
        {/* --- ROTA ATUALIZADA AQUI --- */}
        <NavLink 
          to="/agendar-escolha" 
          className="calendar-icon" 
          aria-label="Agendar nova consulta"
        >
          <img src={calendarIcon} alt="" aria-hidden="true" />
          <span className="sr-only">Agendar</span>
        </NavLink>
        
        <NavLink 
          to="/conversations" 
          className="header-icon" 
          aria-label="Abrir conversas do chat"
        >
          <BsChatDots size={26} aria-hidden="true" />
          <span className="sr-only">Chat</span>
        </NavLink>
        
        <div className="notification-icon-wrapper" ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="header-icon notification-icon"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-haspopup="true"
            aria-expanded={showNotifications}
            aria-label={`Notificações${unreadCount > 0 ? ` - ${unreadCount} não lidas` : ''}`}
          >
            <BsBellFill size={26} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="notification-badge" aria-label={`${unreadCount} notificações não lidas`}>
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown 
              notifications={notifications} 
              onNotificationRead={fetchNotifications}
              role="region"
              aria-label="Lista de notificações"
            />
          )}
        </div>
        
        <div className="profile-icon-container">
          <button
            type="button"
            className="profile-icon"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            aria-controls="user-profile-menu"
            aria-label="Menu do perfil do usuário"
          >
            <img 
              src={userImage} 
              alt="" 
              aria-hidden="true"
              onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }}
            />
          </button>
          
          {showDropdown && (
            <div id="user-profile-menu" className="dropdown-menu" role="menu">
              <NavLink 
                to="/perfil" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
                role="menuitem"
              >
                Meu Perfil
              </NavLink>
              <button 
                 onClick={handleLogout} 
                className="dropdown-item" 
                role="menuitem"
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