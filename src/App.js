// src/App.js
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/index.js';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import React, { useEffect, useState } from 'react';

// Importa TODOS os headers aqui
import HeaderSemCadastro from './components/HeaderSemCadastro/index.js';
import HeaderComCadastro from './components/HeaderComCadastro/index.js';
import HeaderVet from './components/HeaderVet/HeaderVet.js';
import HeaderAdmin from './components/HeaderAdmin/HeaderAdmin.js';
import HeaderEmployee from './components/HeaderEmployee/index.js';

// Componente para controlar qual Header mostrar baseado no authentication e role
function HeaderController() {
  const { user } = useAuth();
  const location = useLocation();

  // Se não estiver autenticado, mostra HeaderSemCadastro
  if (!user) {
    return <HeaderSemCadastro />;
  }

  // Se estiver autenticado, mostra o header baseado no role
  switch (user.role) {
    case 'VETERINARY':
      return <HeaderVet />;
    case 'ADMIN':
      return <HeaderAdmin />;
    case 'EMPLOYEE':
      return <HeaderEmployee />;
    case 'USER':
    default:
      return <HeaderComCadastro />;
  }
}

// Componente principal da aplicação
function AppContent() {
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', highContrast ? 'true' : 'false');
  }, [highContrast]);

  const decreaseFont = () => setFontScale((s) => Math.max(0.85, +(s - 0.05).toFixed(2)));
  const increaseFont = () => setFontScale((s) => Math.min(1.5, +(s + 0.05).toFixed(2)));
  const toggleContrast = () => setHighContrast((v) => !v);

  return (
    <div className="App">
      <a href="#main-content" className="skip-link">Ir para o conteúdo principal</a>
      <ScrollToTop />
      <HeaderController />

      <div className="accessibility-bar" role="region" aria-label="Barra de acessibilidade">
        <div className="accessibility-controls">
          <button type="button" onClick={decreaseFont} aria-label="Diminuir tamanho da fonte">A-</button>
          <button type="button" onClick={increaseFont} aria-label="Aumentar tamanho da fonte">A+</button>
          <button
            type="button"
            onClick={toggleContrast}
            aria-pressed={highContrast}
            aria-label="Alternar alto contraste"
          >
            Alto contraste
          </button>
        </div>
      </div>

      <main id="main-content" className="main-content">
        <AppRoutes />
      </main>

      <div id="aria-announcements" className="sr-only" aria-live="polite" aria-atomic="true"></div>
      <ToastContainer position="bottom-right" newestOnTop closeOnClick pauseOnFocusLoss draggable theme={highContrast ? 'dark' : 'light'} />
    </div>
  );
}

// Componente App principal
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;