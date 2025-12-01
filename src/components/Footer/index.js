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

  // Footer simplificado e padronizado para todas as áreas
  return (
    <footer className="footer-container">
      <div className="footer-content-simple">
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
};

export default Footer;
