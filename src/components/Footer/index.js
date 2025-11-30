import React from 'react';
import { Link } from 'react-router-dom';
import './css/styles.css';
import facebookIcon from '../../assets/images/Footer/facebook.png';
import twitterIcon from '../../assets/images/Footer/twitter.png';
import youtubeIcon from '../../assets/images/Footer/youtube.png';
import instagramIcon from '../../assets/images/Footer/instagram.png';
import logo from '../../assets/images/Footer/LogoPet_vita(Atualizado).png';

const Footer = () => {
  // Função para rolar para o topo da página
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Detectar se está em área administrativa
  const isAdminArea = window.location.pathname.startsWith('/admin');
  const isVetArea = window.location.pathname.startsWith('/vet');
  const isEmployeeArea = window.location.pathname.startsWith('/employee');

  // Footer simplificado para admin/vet/employee - apenas contatos
  if (isAdminArea || isVetArea || isEmployeeArea) {
    return (
      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="Pet Vita - Logotipo da clínica veterinária" />
            <p>© Pet Vita 2025. Todos os direitos reservados.</p>
          </div>
          
          <section className="footer-contact" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">Contatos</h2>
            <ul>
              <li>
                <a href="mailto:petvitasenai@gmail.com" aria-label="Enviar email para petvitasenai@gmail.com">
                  petvitasenai@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+5511983542067" aria-label="Ligar para (11) 98354-2067">
                  (11) 98354-2067
                </a>
              </li>
            </ul>
          </section>
        </div>
      </footer>
    );
  }

  // Footer completo para usuários comuns
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logo} alt="Pet Vita - Logotipo da clínica veterinária" />
          <p>© Pet Vita 2025. Todos os direitos reservados.</p>
        </div>
        
        <nav className="footer-links" aria-labelledby="footer-links-title">
          <h2 id="footer-links-title">Recursos</h2>
          <ul>
            <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
            <li><Link to="/consultas" onClick={scrollToTop}>Consultas</Link></li>
            <li><Link to="/sobre-nos" onClick={scrollToTop}>Sobre nós</Link></li>
          </ul>
        </nav>
        
        <section className="footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">Contatos</h2>
          <ul>
            <li>
              <a href="mailto:petvitasenai@gmail.com" aria-label="Enviar email para petvitasenai@gmail.com">
                petvitasenai@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+5511983542067" aria-label="Ligar para (11) 98354-2067">
                (11) 98354-2067
              </a>
            </li>
          </ul>
        </section>
        
        <section className="footer-social" aria-labelledby="footer-social-title">
          <h2 id="footer-social-title">Redes Sociais</h2>
          <div className="social-icons" role="list">
            <a 
              href="https://www.facebook.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visite nossa página no Facebook (abre em nova aba)"
              role="listitem"
            >
              <img src={facebookIcon} alt="" aria-hidden="true" />
            </a>
            <a 
              href="https://twitter.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visite nosso perfil no Twitter (abre em nova aba)"
              role="listitem"
            >
              <img src={twitterIcon} alt="" aria-hidden="true" />
            </a>
            <a 
              href="https://www.youtube.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visite nosso canal no YouTube (abre em nova aba)"
              role="listitem"
            >
              <img src={youtubeIcon} alt="" aria-hidden="true" />
            </a>
            <a 
              href="https://www.instagram.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visite nosso perfil no Instagram (abre em nova aba)"
              role="listitem"
            >
              <img src={instagramIcon} alt="" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
