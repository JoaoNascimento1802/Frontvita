// src/pages/AboutUs/index.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import HeaderSemCadastro from '../../components/HeaderSemCadastro';
import HeaderComCadastro from '../../components/HeaderComCadastro';
import Footer from '../../components/Footer';
import LogoEquipe from '../../assets/images/AboutUs/Logo_equipe.png';
import PerfilIcon from '../../assets/images/Header/perfilIcon.png'; // Mantendo o ícone padrão
import './css/styles.css';

// O nome do componente foi atualizado para bater com o seu router
const AbaoutUs = () => { 
  const { user } = useAuth();
  
  // --- CORREÇÃO APLICADA AQUI ---
  // Nomes dos membros da equipe atualizados
  const teamMembers = [
    { name: "João Emanuel", image: PerfilIcon },
    { name: "Felipe Araujo", image: PerfilIcon },
    { name: "Iasmin Aicha", image: PerfilIcon },
    { name: "Pedro Henrique", image: PerfilIcon },
    { name: "Bernardo de Oliveira", image: PerfilIcon },
    { name: "Rhuan Rodrigues", image: PerfilIcon }
  ];
  // -----------------------------

  return (
    <div className="app-page">
      {/* Renderização Condicional do Header */}
      {user ? <HeaderComCadastro /> : <HeaderSemCadastro />}
      
      <div className="section">
        <h1 className="main-title">Sobre nós</h1>
        
        {/* Primeira seção do app - texto à esquerda, imagem à direita */}
        <div className="app-preview first-section">
          <div className="text-box left-text">
            <h3>Somos um grupo formado por alunos do SENAI, unidos pelo propósito de desenvolver soluções tecnológicas que facilitem 
                 o cuidado com os pets. Com dedicação e trabalho em equipe, criamos o Pet Vita para melhorar a comunicação e agilizar 
                o atendimento entre tutores e clínicas veterinárias.</h3>
          </div>
          <div className="image-container">
             <h3 className="image-title">2 bits</h3>
            <img src={LogoEquipe} alt="App Preview 1" className="app-image" />
          </div>
        </div>
        
        {/* Título "Nossa equipe" entre as seções */}
        <h1 className="main-title">Nossa equipe</h1>
        
        {/* Segunda seção do app - texto acima, imagens abaixo */}
        <div className="app-preview second-section">
          <div className="text-box centered-text">
            <h3>Oferecemos agendamento de consultas, acompanhamento dos cuidados do seu pet, histórico médico digital e comunicação 
                 direta com os profissionais da clínica — tudo para facilitar o cuidado e garantir a saúde do seu melhor amigo.</h3>
          </div>
          
          <div className="team-grid-container">
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-member-card">
                  <div className="team-member">
                    <img src={member.image} alt={`Membro da equipe ${index + 1}`} />
                  </div>
                  {/* O nome agora vem do array atualizado */}
                  <p className="member-name">{member.name}</p>
                </div>
              ))}
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AbaoutUs; // Exportando com o nome correto