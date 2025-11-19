// src/pages/admin/Consultas/Consultas.js
import React, { useState, useEffect, useCallback } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import './css/Consultas.css';
import { toast } from 'react-toastify';
import { formatEnumLabel } from '../../../utils/format';

// Lista de especialidades (agora inclui Estética)
const specialityLabels = [
    "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA",
    "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA",
    "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA",
    "ESTETICA" // Chave para filtrar serviços
];

const Consultas = () => {
    const [allAppointments, setAllAppointments] = useState([]); // Combina consultas e serviços
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Filtros
    const [userFilter, setUserFilter] = useState('');
    const [vetFilter, setVetFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const fetchConsultas = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Buscar ambas as fontes de dados
            const [consultasRes, servicosRes] = await Promise.all([
                api.get('/admin/consultations'),
                api.get('/admin/service-schedules') // Rota de admin para serviços
            ]);

            // 2. Mapear Consultas (Vets) para o formato unificado
            const consultas = (consultasRes.data || []).map(c => ({
                id: c.id,
                isService: false,
                date: c.consultationdate,
                time: c.consultationtime,
                status: c.status,
                reason: c.reason,
                petName: c.petName,
                clientName: c.userName,
                professionalName: c.veterinaryName,
                displayName: c.speciality ? formatEnumLabel(c.speciality) : 'N/A',
                filterKey: c.specialityEnum, // Chave para filtro (ex: CLINICO_GERAL)
            }));
            
            // 3. Mapear Serviços (Employees) para o formato unificado
            const servicos = (servicosRes.data || []).map(s => ({
                id: `s-${s.id}`,
                isService: true,
                date: s.scheduleDate,
                time: s.scheduleTime,
                status: s.status,
                reason: s.observations,
                petName: s.petName,
                clientName: s.clientName,
                professionalName: s.employeeName,
                displayName: s.serviceName, // Nome de exibição (ex: "Banho e Tosa")
                filterKey: s.speciality, // Chave para filtro (ex: "ESTETICA")
            }));

            // 4. Combinar e ordenar
            const combinedData = [...consultas, ...servicos].sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB - dateA; // Mais recentes primeiro
            });
            
            setAllAppointments(combinedData);
            setFilteredAppointments(combinedData);

        } catch (err) {
            setError('Falha ao buscar agendamentos.');
            toast.error('Falha ao buscar agendamentos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchConsultas();
    }, []);

    useEffect(() => {
        // --- FILTRO CORRIGIDO ---
        let result = allAppointments.filter(c =>
            (c.clientName?.toLowerCase() || c.petName?.toLowerCase() || '').includes(userFilter.toLowerCase()) &&
            (c.professionalName?.toLowerCase() || '').includes(vetFilter.toLowerCase()) && 
            // Filtra pela "categoria" (filterKey)
            (specialtyFilter ? c.filterKey === specialtyFilter : true) &&
            (dateFilter ? c.date === dateFilter : true)
        );
        setFilteredAppointments(result);
    }, [userFilter, vetFilter, specialtyFilter, dateFilter, allAppointments]);
    
    const handleEditClick = (consulta) => {
        setEditingId(consulta.id);
        setEditFormData({
            consultationdate: consulta.date,
            consultationtime: consulta.time.substring(0, 5),
            reason: consulta.reason,
            observations: consulta.observations || '',
        });
    };

    const handleCancelClick = () => setEditingId(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async (id, isService) => {
        if (isService) {
            toast.warn('A edição de serviços de estética pelo painel de admin ainda não foi implementada.');
            return;
        }
        
        try {
            // A rota de edição do admin espera o DTO de update
            const updateDTO = {
                consultationdate: editFormData.consultationdate,
                consultationtime: editFormData.consultationtime,
                reason: editFormData.reason,
                observations: editFormData.observations
            };
            
            await api.put(`/admin/consultations/${id}`, updateDTO);
            setEditingId(null);
            toast.success('Consulta atualizada com sucesso!');
            fetchConsultas();
        } catch (err) {
            toast.error('Erro ao salvar a consulta.');
            console.error("Erro ao salvar:", err.response?.data || err);
        }
    };

    const handleDelete = async (id, isService) => {
        if (isService) {
            toast.warn('A exclusão de serviços de estética pelo painel de admin ainda não foi implementada.');
            return;
        }

        if (window.confirm('Tem certeza que deseja excluir esta consulta?')) {
            try {
                // Rota de admin para excluir consulta
                await api.delete(`/admin/consultations/${id}`); 
                toast.success('Consulta excluída com sucesso!');
                fetchConsultas();
            } catch (err) {
                toast.error('Erro ao excluir a consulta.');
            }
        }
    };

    return (
         <div className="admin-page">
            <HeaderAdmin />
            <main className="admin-content">
                <div className="admin-page-header"><h1>Gerenciar Agendamentos</h1></div>
                <div className="admin-filters">
                     <input type="text" placeholder="Filtrar por paciente/pet..." value={userFilter} onChange={e => setUserFilter(e.target.value)} />
                    <input type="text" placeholder="Filtrar por profissional..." value={vetFilter} onChange={e => setVetFilter(e.target.value)} />
                    <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)}>
                        <option value="">Todas as Categorias</option>
                        {specialityLabels.map(spec => (
                            <option key={spec} value={spec}>{formatEnumLabel(spec)}</option>
                        ))}
                    </select>
                     <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                </div>
                
                {loading && <p>Carregando...</p>}
                {error && <p className="error-message">{error}</p>}
                
                {!loading && !error && (
                    <div className="admin-card-grid">
                         {filteredAppointments.map(c => (
                            <div key={c.id} className="admin-card">
                                 {editingId === c.id ? (
                                    <>
                                         <div className="card-header-admin" style={{justifyContent: 'center'}}>
                                            <span className="card-title">Editando Agendamento #{String(c.id).replace('s-','')}</span>
                                         </div>
                                        <div className="card-body-admin">
                                             <div className="form-group-card"><label>Data</label><input type="date" name="consultationdate" value={editFormData.consultationdate} onChange={handleFormChange} className="card-input" disabled={c.isService} /></div>
                                             <div className="form-group-card"><label>Hora</label><input type="time" name="consultationtime" value={editFormData.consultationtime} onChange={handleFormChange} className="card-input" disabled={c.isService} /></div>
                                            <div className="form-group-card"><label>Motivo/Observação</label><textarea name="reason" value={editFormData.reason} onChange={handleFormChange} className="card-input" rows="3" disabled={c.isService}></textarea></div>
                                         </div>
                                        <div className="card-actions-admin">
                                             <button className="action-button-card cancel" onClick={handleCancelClick}><FaTimes /> Cancelar</button>
                                             <button className="action-button-card save" onClick={() => handleSaveClick(c.id, c.isService)} disabled={c.isService}><FaSave /> Salvar</button>
                                        </div>
                                     </>
                                ) : (
                                     <>
                                        <div className="card-header-admin" style={{justifyContent: 'center'}}>
                                             <span className="card-title">{c.isService ? 'Serviço' : 'Consulta'} #{String(c.id).replace('s-','')}</span>
                                        </div>
                                         <div className="card-body-admin">
                                            <p><strong>Pet:</strong> {c.petName || 'N/A'}</p>
                                            <p><strong>Cliente:</strong> {c.clientName || 'N/A'}</p>
                                            <p><strong>Profissional:</strong> {c.professionalName}</p>
                                            
                                            {/* --- EXIBIÇÃO CORRIGIDA --- */}
                                            <p><strong>Serviço/Categoria:</strong> {c.displayName}</p>
                                            
                                            <p><strong>Data:</strong> {new Date(c.date + 'T' + c.time).toLocaleString('pt-BR')}
                                            </p>
                                            <p><strong>Status:</strong> <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span></p>
                                         </div>
                                        <div className="card-actions-admin">
                                             <button className="action-button-card delete" onClick={() => handleDelete(c.id, c.isService)} disabled={c.isService}><FaTrash /> Excluir</button>
                                            <button className="action-button-card edit" onClick={() => handleEditClick(c)} disabled={c.isService}><FaEdit /> Editar</button>
                                        </div>
                                     </>
                                )}
                            </div>
                         ))}
                    </div>
                )}
            </main>
            <Footer />
         </div>
    );
};

export default Consultas;