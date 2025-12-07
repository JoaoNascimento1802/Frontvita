// src/pages/admin/Consultas/Consultas.js
import { useState, useEffect } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import ConfirmModal from '../../../components/ConfirmModal';
import api from '../../../services/api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import './css/Consultas.css';
import { toast } from 'react-toastify';
import { formatEnumLabel } from '../../../utils/format';

const specialityLabels = [
    "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA",
    "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA",
    "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA",
    "ESTETICA"
];

const Consultas = () => {
    const [allAppointments, setAllAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [userFilter, setUserFilter] = useState('');
    const [vetFilter, setVetFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, item: null });

    const fetchConsultas = async () => {
        setLoading(true);
        setError('');
        try {
            const [consultasRes, servicosRes] = await Promise.all([
                api.get('/admin/consultations'),
                api.get('/admin/service-schedules')
            ]);

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
                veterinaryId: c.veterinaryId, // ID do veterinário para buscar horários
                displayName: c.speciality ? formatEnumLabel(c.speciality) : 'N/A',
                filterKey: c.speciality, // Usa speciality para o filtro (mesmo campo do backend)
            }));

            const servicos = (servicosRes.data || []).map(s => ({
                id: `s-${s.id}`,
                realId: s.id, // ID numérico real
                isService: true,
                date: s.scheduleDate,
                time: s.scheduleTime,
                status: s.status,
                reason: s.observations,
                petName: s.petName,
                clientName: s.clientName,
                professionalName: s.employeeName,
                employeeId: s.employeeId, // ID do funcionário para buscar horários
                displayName: s.serviceName,
                filterKey: 'ESTETICA', // Padroniza para filtro
            }));

            const combinedData = [...consultas, ...servicos].sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB - dateA;
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
        let result = allAppointments.filter(c =>
            (c.clientName?.toLowerCase() || c.petName?.toLowerCase() || '').includes(userFilter.toLowerCase()) &&
            (c.professionalName?.toLowerCase() || '').includes(vetFilter.toLowerCase()) && 
            (specialtyFilter ? c.filterKey === specialtyFilter : true) &&
            (dateFilter ? c.date === dateFilter : true)
        );
        setFilteredAppointments(result);
    }, [userFilter, vetFilter, specialtyFilter, dateFilter, allAppointments]);

    const fetchAvailableTimes = async (item, date) => {
        if (!date) {
            setAvailableTimes([]);
            return;
        }
        setLoadingTimes(true);
        try {
            let response;
            if (item.isService) {
                // Para serviços, busca horários do funcionário
                response = await api.get(`/api/available-times/employee/${item.employeeId || item.realId}?date=${date}`);
            } else {
                // Para consultas, busca horários do veterinário
                response = await api.get(`/api/available-times/veterinary/${item.veterinaryId || item.id}?date=${date}`);
            }
            // Adiciona o horário atual como opção (caso queira manter)
            const currentTime = item.time?.substring(0, 5);
            const times = response.data || [];
            if (currentTime && !times.includes(currentTime)) {
                times.unshift(currentTime);
            }
            setAvailableTimes(times);
        } catch (err) {
            console.error("Erro ao buscar horários disponíveis:", err);
            // Se falhar, permite qualquer horário
            setAvailableTimes([]);
        } finally {
            setLoadingTimes(false);
        }
    };

    const handleEditClick = async (consulta) => {
        // Não permite editar consultas/serviços finalizados
        if (consulta.status === 'FINALIZADA') {
            toast.warn('Não é possível editar um agendamento finalizado.');
            return;
        }
        setEditingId(consulta.id);
        setEditingItem(consulta);
        setEditFormData({
            consultationdate: consulta.date,
            consultationtime: consulta.time.substring(0, 5),
            reason: consulta.reason,
            observations: consulta.observations || '',
        });
        // Busca horários disponíveis para a data atual
        await fetchAvailableTimes(consulta, consulta.date);
    };

    const handleCancelClick = () => {
        setEditingId(null);
        setEditingItem(null);
        setAvailableTimes([]);
    };

    const handleFormChange = async (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
        
        // Se mudou a data, busca novos horários disponíveis
        if (name === 'consultationdate' && editingItem) {
            setEditFormData(prev => ({ ...prev, consultationtime: '' }));
            await fetchAvailableTimes(editingItem, value);
        }
    };

    // --- FUNÇÃO DE SALVAR (AGORA HABILITADA PARA AMBOS) ---
    const handleSaveClick = async (item) => {
        const id = item.isService ? item.realId : item.id;
        try {
            if (item.isService) {
                // Mapeia os campos do formulário para o DTO de Serviço
                // O DTO espera: scheduleDate, scheduleTime, observations
                const serviceUpdateDTO = {
                    scheduleDate: editFormData.consultationdate, // Usa o campo do form
                    scheduleTime: editFormData.consultationtime,
                    observations: editFormData.reason // Mapeia 'Motivo' para 'Observações'
                };
                await api.put(`/admin/service-schedules/${id}`, serviceUpdateDTO);
                toast.success('Serviço atualizado com sucesso!');
            } else {
                // Mapeia para o DTO de Consulta
                const consultationUpdateDTO = {
                    consultationdate: editFormData.consultationdate,
                    consultationtime: editFormData.consultationtime,
                    reason: editFormData.reason,
                    observations: editFormData.observations
                };
                await api.put(`/admin/consultations/${id}`, consultationUpdateDTO);
                toast.success('Consulta atualizada com sucesso!');
            }
            setEditingId(null);
            fetchConsultas();
        } catch (err) {
            toast.error('Erro ao salvar.');
            console.error("Erro ao salvar:", err.response?.data || err);
        }
    };

    // --- FUNÇÃO DE DELETAR (AGORA HABILITADA PARA AMBOS) ---
    const handleDelete = (item) => {
        setConfirmDelete({ isOpen: true, item });
    };

    const confirmDeleteAppointment = async () => {
        const item = confirmDelete.item;
        const id = item.isService ? item.realId : item.id;
        const typeLabel = item.isService ? 'serviço' : 'consulta';
        
        try {
            if (item.isService) {
                await api.delete(`/admin/service-schedules/${id}`);
            } else {
                await api.delete(`/admin/consultations/${id}`);
            }
            toast.success(`${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} excluído(a) com sucesso!`);
            fetchConsultas();
        } catch (err) {
            toast.error(`Erro ao excluir ${typeLabel}.`);
        } finally {
            setConfirmDelete({ isOpen: false, item: null });
        }
    };

    return (
        <div className="admin-page">
            <HeaderAdmin />
            <main className="admin-content">
                <div className="admin-page-header">
                    <h1>Gerenciar Agendamentos</h1>
                </div>
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
                                            <span className="card-title">Editando {c.isService ? 'Serviço' : 'Consulta'}</span>
                                        </div>
                                        <div className="card-body-admin">
                                            <div className="form-group-card">
                                                <label>Data</label>
                                                <input type="date" name="consultationdate" value={editFormData.consultationdate} onChange={handleFormChange} className="card-input" min={new Date().toISOString().split('T')[0]} />
                                            </div>
                                            <div className="form-group-card">
                                                <label>Hora</label>
                                                {loadingTimes ? (
                                                    <select className="card-input" disabled>
                                                        <option>Carregando...</option>
                                                    </select>
                                                ) : availableTimes.length > 0 ? (
                                                    <select name="consultationtime" value={editFormData.consultationtime} onChange={handleFormChange} className="card-input">
                                                        <option value="">Selecione um horário</option>
                                                        {availableTimes.map(time => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <select className="card-input" disabled>
                                                        <option>Nenhum horário disponível</option>
                                                    </select>
                                                )}
                                            </div>
                                            <div className="form-group-card">
                                                <label>Motivo/Observação</label>
                                                <textarea name="reason" value={editFormData.reason} onChange={handleFormChange} className="card-input" rows="3"></textarea>
                                            </div>
                                        </div>
                                        <div className="card-actions-admin">
                                            <button className="action-button-card cancel" onClick={handleCancelClick}>
                                                <FaTimes /> Cancelar
                                            </button>
                                            {/* Passa o objeto inteiro 'c' para saber se é serviço ou consulta */}
                                            <button className="action-button-card save" onClick={() => handleSaveClick(c)}>
                                                <FaSave /> Salvar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="card-header-admin" style={{justifyContent: 'center'}}>
                                            <span className="card-title">{c.isService ? 'Serviço' : 'Consulta'} #{c.isService ? c.realId : c.id}</span>
                                        </div>
                                        <div className="card-body-admin">
                                            <p><strong>Pet:</strong> {c.petName || 'N/A'}</p>
                                            <p><strong>Cliente:</strong> {c.clientName || 'N/A'}</p>
                                            <p><strong>Profissional:</strong> {c.professionalName}</p>
                                            <p><strong>Serviço/Categoria:</strong> {c.displayName}</p>
                                            <p><strong>Data:</strong> {new Date(c.date + 'T' + c.time).toLocaleString('pt-BR')}</p>
                                            <p><strong>Status:</strong> <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span></p>
                                        </div>
                                        <div className="card-actions-admin">
                                            {/* Passa o objeto inteiro 'c' */}
                                            <button className="action-button-card delete" onClick={() => handleDelete(c)}>
                                                <FaTrash /> Excluir
                                            </button>
                                            {c.status !== 'FINALIZADA' && (
                                                <button className="action-button-card edit" onClick={() => handleEditClick(c)}>
                                                    <FaEdit /> Editar
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title={`Excluir ${confirmDelete.item?.isService ? 'Serviço' : 'Consulta'}`}
                message={`Tem certeza que deseja excluir este(a) ${confirmDelete.item?.isService ? 'serviço' : 'consulta'}? Esta ação é irreversível.`}
                onConfirm={confirmDeleteAppointment}
                onCancel={() => setConfirmDelete({ isOpen: false, item: null })}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
            />

            <Footer />
        </div>
    );
};

export default Consultas;
