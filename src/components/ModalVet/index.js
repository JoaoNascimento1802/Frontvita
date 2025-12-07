// components/ModalVet/index.js
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './css/styles.css';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';

// --- 1. ADICIONADO 'switchToForgotPassword' AOS PROPS ---
const ModalVet = ({ onClose, switchToUser, switchToRegisterVet, onLoginSuccess, switchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [crmv, setCrmv] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLoginSuccess(email, password);
      // O redirecionamento é feito no ModalManager após login bem-sucedido
    } catch (err) {
      setError('CRMV, e-mail ou senha inválidos. Por favor, tente novamente.');
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
        aria-labelledby="modal-vet-title"
      >
        <div className="button-group">
          <button className="button" onClick={switchToUser}>Cliente</button>
          <button className="button active">Veterinário</button>
        </div>
        <div className="logo-modal">
          <img src={logo} alt="Pet Vita Logo" />
        </div>
        <h2 id="modal-vet-title" style={{ textAlign: 'center' }}>Login do Veterinário</h2>
        
        <form className="form" onSubmit={handleSubmit}>
          {error && <p className="error-message" role="alert" aria-live="assertive">{error}</p>}
          <div className="input-group">
            <label htmlFor="CRMV">CRMV</label>
            <input 
              type="text" 
              id="CRMV" 
              placeholder="Digite o seu CRMV" 
              required 
              value={crmv}
              onChange={(e) => setCrmv(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email-vet">Email</label>
            <input 
              type="email" 
              id="email-vet" 
              placeholder="Digite o seu email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="senha-vet">Senha</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                id="senha-vet" 
                placeholder="Digite a sua senha" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="options">
            <div className="remember-me">
              <input type="checkbox" id="remember-vet" />
              <label htmlFor="remember-vet">Lembrar minha senha</label>
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
          <button type="button" className="link-button" onClick={switchToRegisterVet}>
            Cadastrar-se
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVet;