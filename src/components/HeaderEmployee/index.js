import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';
import profileIcon from '../../assets/images/Header/perfilIcon.png';
import { BsBellFill, BsChatDots } from 'react-icons/bs';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import './css/styles.css';

const HeaderEmployee = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState(profileIcon);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  
  // Estados de Notificação
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- LÓGICA DE IMAGEM DO PERFIL ---
  useEffect(() => {
    if (user?.imageurl) {
      setProfileImage(user.imageurl);
    }
  }, [user]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.imageurl) {
        setProfileImage(`${user.imageurl}?t=${new Date().getTime()}`);
      }
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, [user]);

  // --- LÓGICA DE NOTIFICAÇÃO (CORRIGIDA) ---
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/notifications');
      const allNotifs = response.data;
      setNotifications(allNotifs);
      const count = allNotifs.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar notificações do funcionário:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications(); // Busca inicial
    const intervalId = setInterval(fetchNotifications, 15000); // Atualiza a cada 15s
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <NavLink to="/employee/dashboard"><img src={logo} alt="Pet Vita Logo" /></NavLink>
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
      
      <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/employee/dashboard" className="nav_link" onClick={() => setMobileMenuOpen(false)}>Painel</NavLink>
        <NavLink to="/employee/servicos" className="nav_link" onClick={() => setMobileMenuOpen(false)}>Serviços</NavLink>
        <NavLink to="/employee/agenda" className="nav_link" onClick={() => setMobileMenuOpen(false)}>Agenda</NavLink>
        
        {/* Icons para mobile */}
        <div className="icons-mobile">
          <NavLink to="/employee/chat" className="icon-item" onClick={() => setMobileMenuOpen(false)}>
            <BsChatDots size={24} color="#8D7EFB" />
            <span className="icon-label">Chat</span>
          </NavLink>
          <NavLink to="/employee/perfil" className="icon-item" onClick={() => setMobileMenuOpen(false)}>
            <img src={profileImage || profileIcon} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }} />
            <span className="icon-label">Meu Perfil</span>
          </NavLink>
          <button className="icon-item" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            <span className="icon-label" style={{ color: '#ff4d4d' }}>Sair</span>
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {mobileMenuOpen && <div className="mobile-overlay active" onClick={() => setMobileMenuOpen(false)} />}
      
      <div className="icons-container icons-desktop">
        <NavLink to="/employee/chat" className="header-icon" title="Chat"><BsChatDots size={26} /></NavLink>

        {/* Ícone de Notificação */}
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

        {/* Ícone de Perfil */}
        <div className="profile-icon-container" ref={dropdownRef}>
          <button
            type="button"
            className="profile-icon"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-haspopup="true"
            aria-expanded={showDropdown}
            aria-controls="employee-profile-menu"
          >
            <img 
              src={profileImage || profileIcon} 
              alt="Perfil" 
              onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }}
            />
          </button>
          {showDropdown && (
            <div id="employee-profile-menu" className="dropdown-menu">
              <NavLink to="/employee/perfil" className="dropdown-item">Meu Perfil</NavLink>
              <button onClick={handleLogout} className="dropdown-item" style={{border: 'none', width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer'}}>Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderEmployee;