import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Se ainda estiver verificando o token, exibe uma tela de carregamento
  if (loading) {
    return <div style={{ paddingTop: '150px', textAlign: 'center' }}>Verificando autenticação...</div>;
  }

  // 2. Se não houver usuário, redireciona para a página inicial
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. Se a rota exige um cargo e o usuário não tem o cargo correto, redireciona
  if (requiredRole && user.role !== requiredRole) {
    // Redireciona para o dashboard correto do usuário, se ele tentar acessar uma área indevida
    switch(user.role) {
        case 'ADMIN':
            return <Navigate to="/admin/dashboard" replace />;
        case 'VETERINARY':
            return <Navigate to="/vet/dashboard" replace />;
        case 'EMPLOYEE':
            return <Navigate to="/employee/dashboard" replace />;
        case 'USER':
        default:
            return <Navigate to="/" replace />; // Usuário comum volta para a home
    }
  }

  // 4. Se tudo estiver certo, permite o acesso à página
  return children;
};

export default PrivateRoute;