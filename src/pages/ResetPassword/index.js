import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './styles.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            await api.post(`/auth/reset-password?token=${token}`, { password });
            setMessage('Senha redefinida com sucesso! Você será redirecionado para o login.');
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            setMessage('Token inválido ou expirado. Por favor, solicite um novo link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-box">
                <h2>Crie sua Nova Senha</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="password">Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"}
                                id="password" 
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
                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword" 
                                required 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    {message && <p className="feedback-message">{message}</p>}
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;