import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import './css/Dashboard.css';

const COLORS = ['#8D7EFB', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B'];

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const today = new Date();
                let startDate, endDate;

                // CORREÇÃO: Lógica de data robusta
                if (period === 'month') {
                    // Primeiro dia do mês
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    // Último dia do mês
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                } else {
                    // Ano corrente
                    startDate = new Date(today.getFullYear(), 0, 1);
                    endDate = new Date(today.getFullYear(), 11, 31);
                }

                // Ajuste para fuso horário local (evita que a data mude ao converter para ISO)
                const formatDate = (date) => {
                    const offset = date.getTimezoneOffset();
                    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
                    return adjustedDate.toISOString().split('T')[0];
                };

                const response = await api.get('/admin/reports/summary', {
                    params: {
                        startDate: formatDate(startDate),
                        endDate: formatDate(endDate)
                    }
                });

                setReportData(response.data);
            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [period]);

    const getStatusData = () => {
        if (!reportData?.consultationsByStatus) return [];
        
        const mapTranslations = {
            'PENDENTE': 'Pendente',
            'AGENDADA': 'Agendada',
            'FINALIZADA': 'Finalizada',
            'CANCELADA': 'Cancelada',
            'RECUSADA': 'Recusada',
            'CHECKED_IN': 'Em Atendimento',
            'EM_ANDAMENTO': 'Em Andamento'
        };

        return Object.keys(reportData.consultationsByStatus).map(key => ({
            name: mapTranslations[key] || key,
            value: reportData.consultationsByStatus[key]
        }));
    };

    const getSpecialityData = () => {
        if (!reportData?.consultationsBySpeciality) return [];
        return Object.keys(reportData.consultationsBySpeciality).map(key => ({
            name: key,
            consultas: reportData.consultationsBySpeciality[key]
        }));
    };

    const getRevenueData = () => {
        if (!reportData?.revenueByService) return [];
        return Object.keys(reportData.revenueByService)
            .map(key => ({ 
                name: key, 
                receita: parseFloat(reportData.revenueByService[key]) 
            }))
            .sort((a, b) => b.receita - a.receita)
            .slice(0, 5);
    };

    return (
        <div className="admin-page">
            <HeaderAdmin />
            <main className="admin-content">
                <div className="dashboard-header-flex">
                    <div>
                        <h1>Dashboard Administrativo</h1>
                        <p className="subtitle">Visão geral do desempenho da clínica</p>
                    </div>
                    <div className="period-selector">
                        <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Este Mês</button>
                        <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>Este Ano</button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container-dash">Carregando dados...</div>
                ) : reportData ? (
                    <>
                        <div className="kpi-grid">
                            <div className="kpi-card purple">
                                <div className="kpi-icon"><FaClipboardList /></div>
                                <div className="kpi-info">
                                    <h3>Total Consultas</h3>
                                    <p>{reportData.totalConsultations}</p>
                                </div>
                            </div>
                            <div className="kpi-card green">
                                <div className="kpi-icon"><FaMoneyBillWave /></div>
                                <div className="kpi-info">
                                    <h3>Faturamento</h3>
                                    <p>R$ {reportData.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="charts-grid">
                            <div className="chart-card">
                                <h3>Status dos Agendamentos</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie 
                                                data={getStatusData()} 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={60} 
                                                outerRadius={80} 
                                                fill="#8884d8" 
                                                paddingAngle={5} 
                                                dataKey="value" 
                                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {getStatusData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-card">
                                <h3>Agendamentos por Especialidade</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={getSpecialityData()} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                                            <Tooltip />
                                            <Bar dataKey="consultas" fill="#8D7EFB" radius={[0, 4, 4, 0]} name="Qtd. Consultas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-card full-width">
                                <h3>Top 5 Serviços mais Rentáveis</h3>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={getRevenueData()}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `R$ ${value}`} />
                                            <Bar dataKey="receita" fill="#00C49F" radius={[4, 4, 0, 0]} name="Receita (R$)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="error-message">Não foi possível carregar os dados. Tente novamente mais tarde.</p>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;