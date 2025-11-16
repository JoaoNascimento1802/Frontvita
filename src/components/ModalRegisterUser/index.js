// components/ModalRegisterUser.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './css/styles.css';
import logo from '../../assets/images/Header/LogoPet_vita(Atualizado).png';

const ModalRegisterUser = ({ onClose, switchToVet, openLogin, onRegisterSuccess }) => {

  // Estados para todos os campos do formulário
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    // cpf: '', // <-- REMOVIDO
    rg: '',
    imageurl: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false
  });

  // --- Função validateCPF REMOVIDA ---
  
  // Função para validar RG
  const validateRG = (rg) => {
    rg = rg.replace(/[^\d]/g, '');
    return rg.length >= 7 && rg.length <= 12;
  };

  // Validar senha em tempo real
  const validatePassword = (password) => {
    setPasswordValidation({
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (id === 'password') {
      validatePassword(value);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    // --- Validação de CPF REMOVIDA ---

    if (!validateRG(formData.rg)) {
      setError('RG inválido. Digite entre 7 e 12 números.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (!passwordValidation.hasUpperCase || !passwordValidation.hasNumber || 
        !passwordValidation.hasSpecialChar || !passwordValidation.minLength) {
      setError('A senha não atende aos requisitos de segurança');
      setLoading(false);
      return;
    }

    try {
      // Prepara os dados para o backend
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        // cpf: formData.cpf.replace(/[^\d]/g, ''), // <-- REMOVIDO
        rg: formData.rg.replace(/[^\d]/g, ''),
        imageurl: formData.imageurl,
        role: 'USER'
      };

      await api.post('/users/register', userData);
      onRegisterSuccess(formData.email, formData.password);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao cadastrar. Verifique os dados.';
      setError(errorMessage);
      console.error('Erro no cadastro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
         <span className="close" onClick={onClose}>&times;</span>
        
        <div className="button-group">
          <button className="button active">Cliente</button>
          <button className="button" onClick={switchToVet}>Veterinário</button>
        </div>
        
        <div className="logo-modal">
           <img src={logo} alt="Pet Vita Logo" />
        </div>
        
        <form className="form" onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
           <label htmlFor="username">Nome Completo</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Digite o seu nome completo" 
               required 
              value={formData.username}
              onChange={handleChange} 
            />
          </div>
          
          <div className="input-group">
             <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="seu.email@exemplo.com" 
               required 
              value={formData.email}
              onChange={handleChange} 
            />
          </div>
          
           <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Digite uma senha segura" 
              required 
              value={formData.password}
              onChange={handleChange} 
            />
            {formData.password && (
               <div className="password-requirements">
                <p className={passwordValidation.minLength ? 'valid' : 'invalid'}>
                  {passwordValidation.minLength ? '✓' : '✗'} Mínimo 8 caracteres
                </p>
                 <p className={passwordValidation.hasUpperCase ? 'valid' : 'invalid'}>
                  {passwordValidation.hasUpperCase ? '✓' : '✗'} Letra maiúscula
                </p>
                <p className={passwordValidation.hasNumber ? 'valid' : 'invalid'}>
                   {passwordValidation.hasNumber ? '✓' : '✗'} Número
                </p>
                <p className={passwordValidation.hasSpecialChar ? 'valid' : 'invalid'}>
                  {passwordValidation.hasSpecialChar ? '✓' : '✗'} Caracter especial (@, #, &, etc.)
                </p>
              </div>
            )}
          </div>

          <div className="input-group">
             <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="Digite a senha novamente" 
               required 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          
           <div className="input-group">
            <label htmlFor="phone">Telefone</label>
            <input 
              type="tel" 
              id="phone" 
              placeholder="11987654321 (apenas números)" 
               required 
              pattern="[0-9]{11}"
              title="Digite 11 números (DDD + número)"
              value={formData.phone}
              onChange={handleChange} 
             />
          </div>
          
          <div className="input-group">
            <label htmlFor="address">Endereço Completo</label>
            <input 
               type="text" 
              id="address" 
              placeholder="Rua, número, bairro, cidade - Estado" 
              required 
              value={formData.address}
               onChange={handleChange} 
            />
          </div>

          {/* --- CAMPO DE CPF REMOVIDO --- */}
           
          <div className="input-group">
            <label htmlFor="rg">RG (somente números)</label>
            <input 
              type="text" 
              id="rg" 
               placeholder="123456789" 
              required 
              pattern="[0-9]{7,12}"
              title="Digite apenas números do RG"
              value={formData.rg}
               onChange={handleChange} 
            />
          </div>
          
          <button 
            type="submit" 
             className="login-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                 Cadastrando...
              </>
            ) : (
              'Cadastrar'
            )}
          </button>
         </form>
        
        <div className="links">
          <button type="button" className="link-button" onClick={onClose}>
            Voltar
          </button>
          <button type="button" className="link-button" onClick={openLogin}>
             Já tenho conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegisterUser;