import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';
import profileIcon from '../../assets/images/Header/perfilIcon.png';
import './css/Header.css';
import { BsBellFill, BsChatDots } from 'react-icons/bs';

const HeaderAdmin = () => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get('/notifications');
            const allNotifs = response.data;
            setNotifications(allNotifs);
            const unreadCount = allNotifs.filter(n => !n.read).length;
            setNotificationCount(unreadCount);
        } catch (error) {
            console.error("Erro ao buscar notificações", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000);
        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="logo">
                <NavLink to="/admin/dashboard"><img src={logo} alt="Pet Vita Logo" /></NavLink>
            </div>
            
            <nav className="nav nav-center">
                <NavLink to="/admin/dashboard" className="nav_link">Painel</NavLink>
                <NavLink to="/admin/consultas" className="nav_link">Consultas</NavLink>
                <NavLink to="/admin/veterinarios" className="nav_link">Veterinários</NavLink>
                <NavLink to="/admin/funcionarios" className="nav_link">Funcionários</NavLink>
                <NavLink to="/admin/pacientes" className="nav_link">Pacientes</NavLink>
                <NavLink to="/admin/services" className="nav_link">Serviços</NavLink>
                {/* --- LINK ADICIONADO AQUI --- */}
                <NavLink to="/admin/schedules" className="nav_link">Horários</NavLink>
                <NavLink to="/admin/relatorios" className="nav_link">Relatórios</NavLink>
            </nav>

            <div className="icons-container">
                <NavLink to="/admin/chat" className="header-icon" title="Chat"><BsChatDots size={26} /></NavLink>
                
                <div className="notification-icon-wrapper" ref={notificationRef}>
                    <button
                        type="button"
                        className="header-icon notification-icon"
                        onClick={() => setShowNotifications(prev => !prev)}
                        title="Notificações"
                        aria-haspopup="true"
                        aria-expanded={showNotifications}
                    >
                        <BsBellFill size={26} />
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                    {showNotifications && (
                        <NotificationDropdown
                            notifications={notifications}
                            onNotificationRead={fetchNotifications}
                        />
                    )}
                </div>
                
                <div className="profile-icon-container" ref={profileRef}>
                    <button
                      type="button"
                      className="profile-icon"
                      onClick={() => setShowProfileDropdown(prev => !prev)}
                      aria-haspopup="true"
                      aria-expanded={showProfileDropdown}
                      aria-controls="admin-profile-menu"
                    >
                        <img 
                          src={user?.imageurl || profileIcon} 
                          alt="Perfil"
                          onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }}
                        />
                    </button>
                    {showProfileDropdown && (
                        <div id="admin-profile-menu" className="dropdown-menu">
                            <NavLink to="/admin/perfil" className="dropdown-item">Meu Perfil</NavLink>
                            <button onClick={handleLogout} className="dropdown-item" style={{border: 'none', width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer'}}>Sair</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default HeaderAdmin;