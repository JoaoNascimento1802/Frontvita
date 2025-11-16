// src/pages/User/Consultations/AgendarEscolha.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import { FaUserMd, FaCut } from 'react-icons/fa';
import './css/AgendarEscolha.css';

const AgendarEscolha = () => {
  return (
    <div className="add-pet-page">
      <HeaderComCadastro />
      <h1 className="welcome-title">O que você deseja agendar?</h1>
      <div className="add-pet-wrapper">
        <div className="add-pet-container">
          <div className="type-selection">
            <Link to="/agendar-consulta" className="choice-button">
              <FaUserMd className="type-icon" />
              <div>
                <span>Consulta Veterinária</span>
                <small>Agende com um de nossos veterinários especialistas.</small>
              </div>
            </Link>
            
            <Link to="/agendar-servico" className="choice-button">
              <FaCut className="type-icon" />
              <div>
                <span>Serviços (Banho, Tosa, etc.)</span>
                <small>Agende serviços de estética e bem-estar.</small>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AgendarEscolha;