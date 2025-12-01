// components/ModalUser/index.js
import React, { useState } from 'react';
import './css/styles.css';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';

// --- 1. ADICIONADO 'switchToForgotPassword' AOS PROPS ---
const ModalUser = ({ onClose, switchToVet, switchToRegisterUser, onLoginSuccess, switchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLoginSuccess(email, password);
      // O redirecionamento é feito no ModalManager após login bem-sucedido
    } catch (err) {
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-user-title"
      >
        <div className="button-group">
          <button className="button active">Cliente</button>
          <button className="button" onClick={switchToVet}>Veterinário</button>
        </div>
        <div className="logo-modal">
          <img src={logo} alt="Pet Vita Logo" />
        </div>
        <h2 id="modal-user-title" style={{ textAlign: 'center' }}>Login do Cliente</h2>
        <form className="form" onSubmit={handleLogin}>
          {error && <p className="error-message" role="alert" aria-live="assertive">{error}</p>}
          <div className="input-group">
            <label htmlFor="email-user">Email</label>
            <input 
              type="email" 
              id="email-user"
              placeholder='Digite o seu email'
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label htmlFor="senha-user">Senha</label>
            <input 
              type="password" 
              id="senha-user"
              placeholder='Digite a sua senha'
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div className="options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Lembrar minha senha</label>
            </div>
            
            {/* --- 2. CORREÇÃO DO LINK --- */}
            <div className="forgot-password">
              <button type="button" className="link-button" onClick={switchToForgotPassword}>
                Esqueci a Senha
              </button>
            </div>
            {/* ------------------------ */}
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="links">
          <button type="button" className="link-button" onClick={onClose}>Voltar</button>
          <button type="button" className="link-button" onClick={switchToRegisterUser}>
             Cadastrar-se
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalUser;