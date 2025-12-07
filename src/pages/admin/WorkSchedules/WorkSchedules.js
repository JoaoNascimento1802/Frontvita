import React, { useState, useEffect, useCallback } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSave, FaTrash, FaCog, FaTimes, FaClock } from 'react-icons/fa';
import './WorkSchedules.css';

const dayTranslation = {
    "MONDAY": "Segunda-feira", 
    "TUESDAY": "Terça-feira", 
    "WEDNESDAY": "Quarta-feira",
    "THURSDAY": "Quinta-feira", 
    "FRIDAY": "Sexta-feira", 
    "SATURDAY": "Sábado", 
    "SUNDAY": "Domingo"
};

const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const WorkSchedules = () => {
    const [professionals, setProfessionals] = useState([]);
    const [selectedProfessional, setSelectedProfessional] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date()); 

    const [templateSchedules, setTemplateSchedules] = useState([]);
    const [monthlySchedules, setMonthlySchedules] = useState([]); 

    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [selectedDateData, setSelectedDateData] = useState(null);

    // Gera estrutura vazia se o usuário não tiver horário
    const generateDefaultWeek = () => {
        return dayOrder.map((day, index) => ({
            id: `temp-${index}`, // ID temporário
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            isWorking: index < 5 // Seg a Sex true, Sáb/Dom false
        }));
    };

    useEffect(() => {
        const loadPros = async () => {
            try {
                const [vets, emps] = await Promise.all([
                    api.get('/admin/veterinarians'),
                    api.get('/api/employee/all')
                ]);
                const allPros = [
                    ...vets.data.map(v => ({ id: v.id, name: v.name, type: 'VET' })),
                    ...emps.data.map(e => ({ id: e.id, name: e.username, type: 'EMP' }))
                ];
                setProfessionals(allPros);
            } catch (error) { 
                console.error(error);
                toast.error("Erro ao carregar profissionais.");
            }
        };
        loadPros();
    }, []);

    const fetchData = useCallback(async () => {
        if (!selectedProfessional) return;
        const [type, id] = selectedProfessional.split('-');
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            const [templateRes, monthlyRes] = await Promise.all([
                api.get(`/admin/schedules/template/${id}`),
                api.get(`/admin/schedules/monthly/${id}?year=${year}&month=${month}`)
            ]);

            // --- CORREÇÃO AQUI ---
            let loadedTemplate = templateRes.data || [];
            
            // Se veio vazio do banco, gera o padrão localmente para exibir na tela
            if (loadedTemplate.length === 0) {
                loadedTemplate = generateDefaultWeek();
            } else {
                // Ordena se veio do banco
                loadedTemplate.sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
            }

            setTemplateSchedules(loadedTemplate);
            setMonthlySchedules(monthlyRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar horários.");
        } finally {
            setLoading(false);
        }
    }, [selectedProfessional, currentDate]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getDayData = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        
        const specific = monthlySchedules.find(s => s.workDate === dateStr);
        if (specific) return { ...specific, type: 'specific' };

        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const jsDayIndex = dateObj.getDay(); 
        const javaDayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const dayName = javaDayNames[jsDayIndex];

        const template = templateSchedules.find(t => t.dayOfWeek === dayName);
        if (template) {
            return { ...template, workDate: dateStr, type: 'template' };
        } else {
            // Fallback se template estiver vazio (raro com a correção acima)
            return { 
                workDate: dateStr, 
                startTime: '09:00', 
                endTime: '18:00', 
                isWorking: false, 
                type: 'template', 
                dayOfWeek: dayName 
            };
        }
    };

    const handleDayClick = (day) => {
        const data = getDayData(day);
        setSelectedDateData({
            ...data,
            startTime: data.startTime || '09:00',
            endTime: data.endTime || '18:00',
            isWorking: data.isWorking,
            id: data.type === 'specific' ? data.id : null 
        });
        setIsDayModalOpen(true);
    };

    const saveSpecific = async () => {
        const [type, userId] = selectedProfessional.split('-');
        setIsSaving(true);
        try {
            await api.post(`/admin/schedules/specific/${userId}`, selectedDateData);
            toast.success("Dia salvo!");
            setIsDayModalOpen(false);
            fetchData();
        } catch(e) { 
            toast.error("Erro ao salvar."); 
        } finally { 
            setIsSaving(false); 
        }
    };

    const deleteSpecific = async () => {
        if (!selectedDateData.id) return;
        setIsSaving(true);
        try {
            await api.delete(`/admin/schedules/specific/${selectedDateData.id}`);
            toast.success("Restaurado.");
            setIsDayModalOpen(false);
            fetchData();
        } catch(e) { 
            toast.error("Erro."); 
        } finally { 
            setIsSaving(false); 
        }
    };

    const handleTemplateChange = (id, field, value) => {
        setTemplateSchedules(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const saveTemplate = async () => {
        const [type, id] = selectedProfessional.split('-');
        setIsSaving(true);
        try {
            // Ao salvar, o backend vai criar os registros reais
            await api.put(`/admin/schedules/template/${id}`, templateSchedules);
            toast.success("Padrão salvo com sucesso!");
            setIsTemplateModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Falha ao salvar padrão.");
        } finally {
            setIsSaving(false);
        }
    };

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const slots = [];

        for(let i=0; i<firstDay; i++) slots.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);

        for(let d=1; d<=daysInMonth; d++) {
            const data = getDayData(d);
            let classes = "cal-cell";
            if (data.isWorking) {
                if (data.type === 'specific') classes += " specific";
                else classes += " working";
            } else { 
                classes += " off"; 
            }

            slots.push(
                <div key={d} className={classes} onClick={() => handleDayClick(d)}>
                    <span className="day-num">{d}</span>
                    <div className="day-content">
                        {data.isWorking ? 
                            <small>{data.startTime?.slice(0,5)} - {data.endTime?.slice(0,5)}</small> : 
                            <small className="label-off">FOLGA</small>
                        }
                        {data.type === 'specific' && <span className="dot-indicator">●</span>}
                    </div>
                </div>
            );
        }
        return slots;
    };

    return (
        <div className="admin-page">
            <HeaderAdmin />
            <main className="admin-content">
                <div className="admin-page-header">
                    <h1>Gerenciar Escalas</h1>
                </div>

                <div className="admin-filters">
                    <select value={selectedProfessional} onChange={e => setSelectedProfessional(e.target.value)}>
                        <option value="">Selecione um Profissional</option>
                        <optgroup label="Veterinários">
                            {professionals.filter(p => p.type === 'VET').map(p => 
                                <option key={p.id} value={`vet-${p.id}`}>{p.name}</option>
                            )}
                        </optgroup>
                        <optgroup label="Funcionários">
                            {professionals.filter(p => p.type === 'EMP').map(p => 
                                <option key={p.id} value={`emp-${p.id}`}>{p.name}</option>
                            )}
                        </optgroup>
                    </select>
                    {selectedProfessional && (
                        <button className="btn-config-template" onClick={() => setIsTemplateModalOpen(true)}>
                            <FaCog /> Configurar Padrão Semanal
                        </button>
                    )}
                </div>

                {selectedProfessional && (
                    <div className="schedule-box">
                        <div className="calendar-view">
                            <div className="cal-nav">
                                <button onClick={handlePrevMonth}><FaChevronLeft/></button>
                                <h3>{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
                                <button onClick={handleNextMonth}><FaChevronRight/></button>
                            </div>
                            <div className="cal-grid-header">
                                <div>DOM</div>
                                <div>SEG</div>
                                <div>TER</div>
                                <div>QUA</div>
                                <div>QUI</div>
                                <div>SEX</div>
                                <div>SÁB</div>
                            </div>
                            <div className="cal-grid">
                                {loading ? <p className="loading-cal">Carregando...</p> : renderCalendarGrid()}
                            </div>
                            <div className="calendar-legend">
                                <div><span className="dot working"></span> Padrão</div>
                                <div><span className="dot specific"></span> Exceção</div>
                                <div><span className="dot off"></span> Folga</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL PADRÃO SEMANAL CORRIGIDO */}
            {isTemplateModalOpen && (
                <div className="modal-overlay" onClick={() => setIsTemplateModalOpen(false)}>
                    <div className="modal-content-schedule template-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h3><FaClock /> Configurar Padrão Semanal</h3>
                            {/* BOTÃO X CORRIGIDO */}
                            <button className="btn-close-modal" onClick={() => setIsTemplateModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        <th>Dia</th>
                                        <th>Status</th>
                                        <th>Início</th>
                                        <th>Fim</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templateSchedules.map((s, index) => (
                                        <tr key={s.id || index} className={!s.isWorking ? 'disabled-row' : ''}>
                                            <td><strong>{dayTranslation[s.dayOfWeek]}</strong></td>
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={s.isWorking} 
                                                    onChange={e => handleTemplateChange(s.id, 'isWorking', e.target.checked)}
                                                />
                                                <span style={{marginLeft: '8px'}}>
                                                    {s.isWorking ? 'Trabalha' : 'Folga'}
                                                </span>
                                            </td>
                                            <td>
                                                <input 
                                                    type="time" 
                                                    value={s.startTime} 
                                                    disabled={!s.isWorking} 
                                                    onChange={e => handleTemplateChange(s.id, 'startTime', e.target.value)} 
                                                    className="time-input"
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="time" 
                                                    value={s.endTime} 
                                                    disabled={!s.isWorking} 
                                                    onChange={e => handleTemplateChange(s.id, 'endTime', e.target.value)} 
                                                    className="time-input"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-save" onClick={saveTemplate} disabled={isSaving}>
                                {isSaving ? 'Salvando...' : 'Salvar Padrão'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DIA ESPECÍFICO */}
            {isDayModalOpen && selectedDateData && (
                <div className="modal-overlay" onClick={() => setIsDayModalOpen(false)}>
                    <div className="modal-content-schedule day-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h3>Editar: {new Date(selectedDateData.workDate).toLocaleDateString('pt-BR')}</h3>
                            <button className="btn-close-modal" onClick={() => setIsDayModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="form-group-modal">
                            <label>Status:</label>
                            <select 
                                value={selectedDateData.isWorking} 
                                onChange={e => setSelectedDateData({...selectedDateData, isWorking: e.target.value === 'true'})} 
                                className="full-width-select"
                            >
                                <option value="true">Trabalha</option>
                                <option value="false">Folga</option>
                            </select>
                        </div>
                        {selectedDateData.isWorking && (
                            <div className="form-row-modal">
                                <div className="form-group-modal">
                                    <label>Início</label>
                                    <input 
                                        type="time" 
                                        value={selectedDateData.startTime} 
                                        onChange={e => setSelectedDateData({...selectedDateData, startTime: e.target.value})}
                                    />
                                </div>
                                <div className="form-group-modal">
                                    <label>Fim</label>
                                    <input 
                                        type="time" 
                                        value={selectedDateData.endTime} 
                                        onChange={e => setSelectedDateData({...selectedDateData, endTime: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="modal-actions">
                            {selectedDateData.id && (
                                <button className="btn-delete" onClick={deleteSpecific} disabled={isSaving}>
                                    <FaTrash/> Resetar
                                </button>
                            )}
                            <button className="btn-save" onClick={saveSpecific} disabled={isSaving}>
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default WorkSchedules;
