// src/pages/Vet/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeaderVet from '../../../components/HeaderVet/HeaderVet';
import Footer from '../../../components/Footer';
import api from '../../../services/api'; 

// Imagens para os cards
import mainImage from '../../../assets/images/Vet/Consultas.jpeg';
import cardImage1 from '../../../assets/images/Vet/Horarios.jpeg';
import cardImage2 from '../../../assets/images/Vet/Pacientes.jpeg';

import '../css/styles.css';

const Dashboard = () => {
    const [vetName, setVetName] = useState("Veterinário(a)");
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
             try {
                const userResponse = await api.get('/users/me');
                setVetName(userResponse.data.username);

                // --- CORREÇÃO AQUI ---
                // A rota /consultas/my-consultations foi trocada para /consultas/vet/my-consultations
                const consultasResponse = await api.get('/consultas/vet/my-consultations');
                const pendingConsultas = consultasResponse.data.filter(c => c.status === 'PENDENTE');
                setPendingCount(pendingConsultas.length);

             } catch (error) {
                // O log de erro 403 que você enviou apareceu aqui
                console.error("Erro ao buscar dados do dashboard:", error);
            } finally {
                setLoading(false);
             }
        };

        fetchData();
    }, []);

    return (
        <div className="vet-dashboard-page">
            <HeaderVet />
            <main className="dashboard-content">
                <section className="welcome-section">
                     <div className="welcome-text">
                        <h1>Seja bem vindo(a) Dr(a). {vetName}!</h1>
                        <Link to="/vet/consultas" className="visualizar-button">
                             VISUALIZAR CONSULTAS
                        </Link>
                    </div>
                 </section>

                <section className="cards-container">
                    <Link to="/vet/consultas?tab=pedidos" className="main-card">
                        <img src={mainImage} alt="Novos pedidos de agendamento" className="card-image" />
                        <div className="card-footer">
                            <span>NOVOS PEDIDOS DE AGENDAMENTO</span>
                            {!loading && pendingCount > 0 && (
                                 <span className="notification-badge-card">{pendingCount}</span>
                            )}
                        </div>
                     </Link>

                    <div className="bottom-cards">
                        <Link to="/vet/consultas?tab=calendario" className="small-card">
                            <img src={cardImage1} alt="Horários de consultas" className="card-image"/>
                            <div className="card-footer">
                                <span>HORÁRIOS DE CONSULTAS</span>
                             </div>
                        </Link>
                        <Link to="/vet/consultas?tab=agendadas" className="small-card">
                             <img src={cardImage2} alt="Compromissos agendados" className="card-image"/>
                            <div className="card-footer">
                                 <span>COMPROMISSOS AGENDADOS</span>
                            </div>
                        </Link>
                     </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;