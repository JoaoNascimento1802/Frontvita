// components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rolagem suave para o topo sempre que a rota mudar
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Mude para 'auto' se preferir instantâneo
    });
  }, [pathname]); // Executa sempre que o pathname mudar

  return null; // Componente não renderiza nada visual
};

export default ScrollToTop;