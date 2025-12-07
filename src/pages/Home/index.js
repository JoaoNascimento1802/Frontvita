// src/pages/Home/index.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import pet1 from '../../assets/images/Home/Pet1.png'; 
import pet2 from '../../assets/images/Home/Pet2.png'; 
import celular from '../../assets/images/Home/Celular.png'; 
import gato_maltratado from '../../assets/images/Home/Gato_mal_tratado.jpg'; 
import pontos from '../../assets/images/Home/Pontos.png'; 
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';
import './css/styles.css';

import { FaPaw, FaHeart, FaCalendarAlt, FaUserMd } from 'react-icons/fa'; 


const Home = () => {
  const navigate = useNavigate();
  const carrosselRef = useRef(null);
  const { user } = useAuth(); // Verifica se há um usuário logado

  const videos = [
    "takn-e-Ug7E",
    "4QxjNX-8k7c",
    "n0wT5cjC4A8"
  ];

  useEffect(() => {
    const carrossel = carrosselRef.current;
    if (!carrossel) return;

    const btnAnterior = document.querySelector('.anterior');
    const btnProximo = document.querySelector('.proximo');
    if (!btnAnterior || !btnProximo) return;

    let indiceAtual = 0;

    const atualizarCarrossel = () => {
      const offset = -indiceAtual * 100;
      carrossel.style.transform = `translateX(${offset}%)`;
    };

    const handleProximo = () => {
      indiceAtual = indiceAtual < carrossel.children.length - 1 ? indiceAtual + 1 : 0;
      atualizarCarrossel();
    };

    const handleAnterior = () => {
      indiceAtual = indiceAtual > 0 ? indiceAtual - 1 : carrossel.children.length - 1;
      atualizarCarrossel();
    };

    btnProximo.addEventListener('click', handleProximo);
    btnAnterior.addEventListener('click', handleAnterior);

    return () => {
       btnProximo.removeEventListener('click', handleProximo);
      btnAnterior.removeEventListener('click', handleAnterior);
    };
  }, []);

  const handleSobreNosClick = () => {
    navigate('/sobre-nos');
    window.scrollTo(0, 0);
  };

  // --- CORREÇÃO APLICADA AQUI ---
  const handleAgendarConsulta = () => {
    if (!user) {
      // Este comportamento está correto. O usuário deve usar o botão "Login" no header,
      // que é o componente que controla a exibição do modal.
      toast.info('Você precisa logar primeiro para marcar consulta');
      return;
    }
    // CORREÇÃO: Navega para a tela de ESCOLHA, e não direto para a consulta.
    navigate('/agendar-escolha');
  };

  return (
    <div className="app">
      <a href="#main" className="skip-link">Ir para conteúdo principal</a>
      <a href="#nav" className="skip-link">Ir para navegação</a>
      <main id="main">
      <section id="divulgacao" aria-labelledby="main-title">
        <div id="cara">
          <h1 id="main-title">Pet Vita <br /> é cuidado</h1>
          <div id="btn_consulta">
            <button 
              id="consulta" 
              onClick={handleAgendarConsulta}
              aria-label="Marcar uma consulta veterinária"
            >
              Marque uma consulta
            </button>
          </div>
        </div>
        
        <article id="info_quadro" aria-labelledby="info-quadro-title">
          <div id="info_quadro_texto">
             <div className="info_content_container">
              <h2 id="info-quadro-title">Confie-nos o melhor cuidado para o seu animal de estimação</h2>
              <p>Nossa equipe se dedica a garantir a felicidade e a saúde do seu amigo peludo</p>
            </div>
           </div>
          <div id="info_quadro_imagens" role="img" aria-label="Cachorros felizes recebendo cuidados veterinários">
            <img src={pet1} alt="Cachorro feliz sorrindo" className="imagem-cachorro" />
            <img src={pet2} alt="Cachorro recebendo carinho" className="imagem-cachorro" />
          </div>
          <aside id="info_quadro_numeros" aria-label="Estatísticas da Pet Vita">
             <div className="numero-item">
              <div className="icon-container" aria-hidden="true">
                <FaUserMd className="stat-icon" />
              </div>
              <span className="numero" aria-label="Mais de 120">120+</span>
               <span className="label">Clientes</span>
            </div>
            <div className="numero-item">
              <div className="icon-container" aria-hidden="true">
                <FaPaw className="stat-icon" />
               </div>
              <span className="numero" aria-label="Mais de 130">130+</span>
              <span className="label">Animais em nosso cuidado</span>
            </div>
            <div className="numero-item">
              <div className="icon-container" aria-hidden="true">
                 <FaHeart className="stat-icon" />
              </div>
              <span className="numero" aria-label="Mais de 145">145+</span>
              <span className="label">Parceiros</span>
            </div>
           </aside>
        </article>
        
        <section id="infos" aria-label="Recursos adicionais">
          <article id="info_cell" aria-labelledby="app-title">
            <div id="cell">
              <img src={celular} alt="Tela do aplicativo Pet Vita mostrando interface de agendamento" />
             </div>
            <div id="info_cell_texto">
              <div className="info_content_container">
                <h2 id="app-title">Aplicativo</h2>
                <br></br>
                 <p>Temos também aplicativo mobile para cuidar do seu pet</p>
              </div>
              <button 
                aria-label="Conheça nosso aplicativo mobile de perto"
                onClick={() => {
                  navigate('/app');
                  window.scrollTo(0, 0);
                }}
              >
                 Conheça nosso aplicativo
              </button>
            </div>
          </article>
          <article id="info_nos" aria-labelledby="about-title">
            <div id="info_pontinhos">
               <img src={pontos} alt="Ilustração representando a equipe Pet Vita" />
            </div>
            <div id="info_pontinhos_texto">
              <div className="info_content_container">
                <h2 id="about-title">Sobre nós</h2>
                 <br></br>
                <p>Conheça um pouco mais sobre nossa empresa</p>
              </div>
              <button 
                aria-label="Ir para página Sobre nós para conhecer nossa história"
                onClick={handleSobreNosClick}
              >
                Saiba mais
               </button>
            </div>
          </article>
        </section>
      </section>

      <section id="quadro_imagens" aria-labelledby="care-title">
        <div id="texto_quadro_imagens">
          <div className="info_content_container">
             <h2 id="care-title">Cuidado</h2>
            <p>Na Pet Vita, acreditamos que os pets são mais do que animais de estimação — são membros da família. Por isso, oferecemos cuidados especializados para garantir que seu amigo peludo tenha uma vida feliz, saudável e cheia de carinho. Com uma equipe de profissionais apaixonados por animais, serviços personalizados e tecnologia de ponta, estamos aqui para cuidar do seu pet em todas as fases da vida. Desde consultas veterinárias até dicas de bem-estar, na Pet Vita, seu pet encontra tudo o que precisa para brilhar. Porque cuidar do seu pet é cuidar da sua alegria.</p>
          </div>
        </div>
        <div id="videos">
          <div className="carrossel-container">
            <div className="carrossel" id="home-videos" ref={carrosselRef} role="region" aria-label="Carrossel de vídeos sobre cuidados com pets" aria-live="polite">
              {videos.map((videoId, index) => (
                <div className="carrossel-item" key={videoId} aria-label={`Vídeo ${index + 1} de ${videos.length}`}>
                  <iframe
                     src={`https://www.youtube.com/embed/${videoId}`}
                    title={`Vídeo informativo sobre cuidados com pets - parte ${index + 1}`}
                    allowFullScreen
                    aria-label={`Vídeo do YouTube sobre cuidados veterinários`}
                  ></iframe>
                 </div>
              ))}
            </div>
            <button 
              className="carrossel-btn anterior" 
              aria-controls="home-videos" 
              aria-label="Ir para vídeo anterior"
              type="button"
            >
              &lt;
            </button>
            <button 
              className="carrossel-btn proximo" 
              aria-controls="home-videos" 
              aria-label="Ir para próximo vídeo"
              type="button"
            >
              &gt;
            </button>
          </div>
         </div>
      </section>

      <section id="card_sentimento" aria-labelledby="mission-title">
        <div id="card_sentimento_imagem">
          <img 
            src={gato_maltratado} 
            alt="Gatinho machucado com olhar esperançoso, representando a importância dos cuidados veterinários" 
          />
        </div>
        <div id="card_sentimento_texto">
          <div className="info_content_container">
             <h2 id="mission-title">Cada animal merece uma segunda chance.</h2>
            <p>A imagem ao lado mostra um gatinho machucado, com um olhar que expressa dor, mas também esperança. É um lembrete poderoso de que nossos amigos de quatro patas dependem de nós para receberem os cuidados que precisam. Eles não podem falar, mas seus olhos e gestos nos mostram quando algo não está bem. Cuidar de um animal é um ato de amor e responsabilidade. Seja para tratar uma ferida, aliviar uma dor ou simplesmente garantir que eles estejam saudáveis, cada gesto faz a diferença na vida deles. Eles nos dão amor incondicional, e nós devemos retribuir com atenção, carinho e dedicação. <span> Porque um animal saudável é um animal feliz, e um animal feliz enche nossa vida de alegria.</span></p>
          </div>
         </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Home;