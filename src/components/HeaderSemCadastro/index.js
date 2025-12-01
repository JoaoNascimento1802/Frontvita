// components/Header_sem_cadastro.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';
import ModalManager from '../../components/ModalManager';
import './css/styles.css';

const HeaderSemCadastro = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation(); // Hook para pegar a rota atual

  const openUserModal = () => setActiveModal('user');
  const openRegisterUserModal = () => setActiveModal('register-user');
  const closeModal = () => setActiveModal(null);

  // Função para verificar se o link está ativo
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="header" role="banner">
        <div className="logo">
          <Link to="/" aria-label="Pet Vita - Ir para página inicial">
            <img src={logo} alt="Pet Vita - Logotipo da clínica veterinária" />
          </Link>
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
          <Link 
            to="/" 
            className={`nav_link ${isActiveLink('/') ? 'active' : ''}`}
            aria-current={isActiveLink('/') ? 'page' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/app" 
            className={`nav_link ${isActiveLink('/app') ? 'active' : ''}`}
            aria-current={isActiveLink('/app') ? 'page' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            App
          </Link>
          <Link 
            to="/sobre-nos" 
            className={`nav_link ${isActiveLink('/sobre-nos') ? 'active' : ''}`}
            aria-current={isActiveLink('/sobre-nos') ? 'page' : undefined}
            onClick={() => setMobileMenuOpen(false)}
          >
            Saiba Mais
          </Link>
          
          <div className="auth auth-mobile" role="toolbar" aria-label="Autenticação">
            <button
              className="button"
              onClick={() => { openUserModal(); setMobileMenuOpen(false); }}
              aria-haspopup="dialog"
              aria-label="Abrir formulário de login"
            >
              Login
            </button>
            <button
              className="button"
              onClick={() => { openRegisterUserModal(); setMobileMenuOpen(false); }}
              aria-haspopup="dialog"
              aria-label="Abrir formulário de cadastro"
            >
              Cadastre-se
            </button>
          </div>
        </nav>

        <div className="auth auth-desktop" role="toolbar" aria-label="Autenticação">
          <button
            className="button"
            onClick={openUserModal}
            aria-haspopup="dialog"
            aria-label="Abrir formulário de login"
          >
            Login
          </button>
          <button
            className="button"
            onClick={openRegisterUserModal}
            aria-haspopup="dialog"
            aria-label="Abrir formulário de cadastro"
          >
            Cadastre-se
          </button>
        </div>
      </header>

      {/* Overlay para fechar menu ao clicar fora */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay active" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Modal Manager - Controla todos os modais */}
      {activeModal && (
        <ModalManager 
          initialModal={activeModal}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default HeaderSemCadastro;