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
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      const allNotifs = response.data;
      setNotifications(allNotifs);
      const count = allNotifs.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar notificações', error);
    }
  }, []);

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

  return (
    <header className="header">
      <div className="logo">
        <NavLink to="/vet/dashboard"><img src={logo} alt="Pet Vita Logo" /></NavLink>
      </div>
      
      <nav className="nav nav-center">
        <NavLink to="/vet/dashboard" className="nav_link">Home</NavLink>
        <NavLink to="/vet/consultas" className="nav_link">Consultas</NavLink>
        <NavLink to="/vet/relatorios" className="nav_link">Relatórios</NavLink>
      </nav>

      <div className="icons-container">
        <NavLink to="/vet/chat" className="header-icon">
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
            aria-controls="vet-profile-menu"
          >
            <img src={profileIcon} alt="Perfil" />
          </button>
          {showDropdown && (
            <div id="vet-profile-menu" className="dropdown-menu">
              <NavLink to="/vet/perfil" className="dropdown-item">Meu Perfil</NavLink>
              <button onClick={handleLogout} className="dropdown-item" style={{border: 'none', width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer'}}>Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderVet;