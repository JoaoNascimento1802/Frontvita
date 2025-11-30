// components/Header_sem_cadastro.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';
import ModalManager from '../../components/ModalManager';
import './css/styles.css';

const HeaderSemCadastro = () => {
  const [activeModal, setActiveModal] = useState(null);
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
        
        <nav id="nav" className="nav nav-center" aria-label="Navegação principal">
          <Link 
            to="/" 
            className={`nav_link ${isActiveLink('/') ? 'active' : ''}`}
            aria-current={isActiveLink('/') ? 'page' : undefined}
          >
            Home
          </Link>
          <Link 
            to="/app" 
            className={`nav_link ${isActiveLink('/app') ? 'active' : ''}`}
            aria-current={isActiveLink('/app') ? 'page' : undefined}
          >
            App
          </Link>
          <Link 
            to="/sobre-nos" 
            className={`nav_link ${isActiveLink('/sobre-nos') ? 'active' : ''}`}
            aria-current={isActiveLink('/sobre-nos') ? 'page' : undefined}
          >
            Saiba Mais
          </Link>
        </nav>

        <div className="auth" role="toolbar" aria-label="Autenticação">
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