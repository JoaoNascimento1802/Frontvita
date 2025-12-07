import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HeaderVet from '../../../components/HeaderVet/HeaderVet';
import Footer from '../../../components/Footer';
import ConfirmModal from '../../../components/ConfirmModal';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import './css/style.css';
import profileIcon from '../../../assets/images/Header/perfilIcon.png';
import { FaFileUpload, FaPrescriptionBottleAlt, FaPlus, FaFileDownload, FaSyringe, FaFileMedical, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { formatEnumLabel } from '../../../utils/format';

import VaccineCard from '../../../components/VaccineCard';
import AddVaccineModal from '../../../components/AddVaccineModal';

const DetalhesConsulta = () => {
    const { consultaId } = useParams();
    const navigate = useNavigate();

    const [consulta, setConsulta] = useState(null);
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [recordId, setRecordId] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    const [prescriptionData, setPrescriptionData] = useState({ medication: '', dosage: '', instructions: '' });
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

    const [vaccines, setVaccines] = useState([]);
    const [showVaccineModal, setShowVaccineModal] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState(null);
    const [confirmFinalize, setConfirmFinalize] = useState(false);
    const [vaccineToDelete, setVaccineToDelete] = useState(null);

    const fetchVaccines = async (petId) => {
        try {
            const response = await api.get(`/api/vaccines/pet/${petId}`);
            setVaccines(response.data || []);
        } catch (err) {
            console.error("Erro ao buscar vacinas", err);
        }
    };
    
    const fetchConsultaDetails = async () => {
        if (!consultaId) return;
        setLoading(true);
        try {
            const response = await api.get(`/consultas/${consultaId}`);
            setConsulta(response.data);
            setReport(response.data.doctorReport || '');
            
            // Verifica se existe o nome e se ele INCLUI a palavra "Vacina"
            if (response.data.serviceName && response.data.serviceName.includes('Vacina')) {
                fetchVaccines(response.data.petId);
            }

            // Se houver ID de prontuário, busca anexos e prescrições
            if (response.data.medicalRecordId) {
                setRecordId(response.data.medicalRecordId);
                try {
                    const recordRes = await api.get(`/api/medical-records/${response.data.medicalRecordId}`);
                    setAttachments(recordRes.data.attachments || []);
                    setPrescriptions(recordRes.data.prescriptions || []);
                } catch {}
            }
        } catch (err) {
            setError('Não foi possível carregar os detalhes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultaDetails();
    }, [consultaId]);

    const handleSaveReport = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/consultas/${consultaId}/report`, report, {
                headers: { 'Content-Type': 'text/plain' }
            });
            toast.success('Relatório salvo e Prontuário inicializado.');
            // Recarrega para obter o recordId gerado pelo backend
            fetchConsultaDetails(); 
        } catch (err) {
            toast.error('Erro ao salvar relatório.');
        }
    };
    
    const handleFinalizeConsultation = async () => {
        try {
            await api.post(`/consultas/${consultaId}/finalize`);
            toast.success('Consulta finalizada com sucesso!');
            navigate('/vet/consultas');
        } catch (err) {
            toast.error('Erro ao finalizar consulta.');
        } finally {
            setConfirmFinalize(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Trava de segurança no front também
        if (!recordId) {
            toast.warn('Salve o relatório primeiro para habilitar uploads.');
            return;
        }
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            // Usa a rota antiga que depende do recordId (já que você manteve a lógica original)
            await api.post(`/veterinary/medical-records/${recordId}/attachments`, formData);
            toast.success('Enviado com sucesso!');
            fetchConsultaDetails(); 
        } catch (error) {
            toast.error('Erro ao enviar arquivo.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleAddPrescription = async (e) => {
        e.preventDefault();
        if (!recordId) {
             toast.warn('Salve o relatório primeiro para habilitar prescrições.');
             return;
        }

        try {
            const payload = {
                medicationName: prescriptionData.medication,
                dosage: prescriptionData.dosage,
                frequency: prescriptionData.instructions,
                duration: "Uso contínuo/Indefinido"
            };
            await api.post(`/veterinary/consultations/${consultaId}/prescriptions`, payload);
            toast.success('Prescrição adicionada!');
            setPrescriptionData({ medication: '', dosage: '', instructions: '' });
            setShowPrescriptionForm(false);
            fetchConsultaDetails(); 
        } catch (error) {
            console.error(error);
            toast.error('Erro ao adicionar.');
        }
    };

    const handleDeleteVaccine = async () => {
        try {
            await api.delete(`/api/vaccines/${vaccineToDelete}`);
            toast.success("Vacina removida com sucesso!");
            fetchVaccines(consulta.petId);
        } catch (error) {
            toast.error('Erro ao deletar vacina.');
        } finally {
            setVaccineToDelete(null);
        }
    };

    const handleEditVaccine = (vaccine) => {
        setEditingVaccine(vaccine);
        setShowVaccineModal(true);
    };

    const handleAddVaccine = () => {
        setEditingVaccine(null);
        setShowVaccineModal(true);
    };

    const onVaccineSuccess = () => {
        fetchVaccines(consulta.petId);
    };

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (!consulta) return null;

    return (
        <div className="pets-details-page">
            <HeaderVet />
            <div className="welcome-section">
                <h1 className="welcome-title">Atendimento Clínico</h1>
            </div>
            <div className="pet-details-wrapper">
                <div className="pet-details-container">
                    
                    {/* CABEÇALHO */}
                    <div className="section-block info-header">
                        <div className="avatar-display-small">
                            {consulta.petImageUrl ? (
                                <img src={consulta.petImageUrl} alt={consulta.petName} className="pet-avatar-medium" onError={(e) => { e.target.onerror = null; e.target.src = profileIcon; }} />
                            ) : (
                                <div className="card-avatar-placeholder">{consulta.petName?.charAt(0)}</div>
                            )}
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Paciente</label>
                                <span>{consulta.petName}</span>
                            </div>
                            <div className="info-item">
                                <label>Tutor</label>
                                <span>{consulta.userName}</span>
                            </div>
                            <div className="info-item">
                                <label>Serviço</label>
                                <span>{formatEnumLabel(consulta.speciality)}</span>
                            </div>
                            <div className="info-item">
                                <label>Data/Hora</label>
                                <span>{new Date(consulta.consultationdate + 'T' + consulta.consultationtime).toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>

                    {/* MOTIVO */}
                    <div className="section-block">
                        <div className="section-title">
                            <FaInfoCircle /> Motivo da Consulta
                        </div>
                        <div className="detail-value long-text readonly">
                            {consulta.reason}
                        </div>
                    </div>

                    {/* VACINAÇÃO */}
                    {consulta.serviceName && consulta.serviceName.includes('Vacina') && (
                        <div className="section-block vaccination-block">
                            <div className="section-title-row">
                                <h3><FaSyringe /> Carteira de Vacinação</h3>
                                <button className="add-btn-small" onClick={handleAddVaccine}>
                                    <FaPlus /> Registrar Dose
                                </button>
                            </div>
                            <div className="vaccines-list">
                                {vaccines.length === 0 ? (
                                    <p className="no-data">Nenhuma vacina registrada.</p>
                                ) : (
                                    [...vaccines].sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)).map(vac => (
                                        <VaccineCard 
                                            key={vac.id} 
                                            vaccine={vac} 
                                            isVet={true} 
                                            onDelete={(vaccineId) => setVaccineToDelete(vaccineId)}
                                            onEdit={handleEditVaccine}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* RELATÓRIO MÉDICO */}
                    <div className="section-block report-block">
                        <div className="section-title"><FaFileMedical /> Relatório Médico & Diagnóstico</div>
                        <textarea 
                            className="report-textarea" 
                            value={report} 
                            onChange={(e) => setReport(e.target.value)} 
                            rows="8" 
                            placeholder="Escreva aqui o diagnóstico, observações clínicas e evolução do paciente..." 
                            disabled={consulta.status === 'FINALIZADA'} 
                        />
                        {consulta.status === 'AGENDADA' && (
                            <div className="action-right">
                                <button className="save-report-btn" onClick={handleSaveReport}>Salvar Relatório</button>
                            </div>
                        )}
                    </div>

                    <div className="split-columns">
                        {/* ANEXOS */}
                        <div className="section-block half-width">
                            <div className="section-title"><FaFileUpload /> Anexos e Exames</div>
                            
                            {(consulta.status === 'AGENDADA' || consulta.status === 'FINALIZADA') && (
                                <>
                                    {/* --- AVISO INSTRUTIVO --- */}
                                    {!recordId && consulta.status === 'AGENDADA' && (
                                        <div className="warning-box">
                                            <FaExclamationTriangle /> 
                                            <span>Salve o <strong>Relatório Médico</strong> acima primeiro para habilitar o envio de anexos.</span>
                                        </div>
                                    )}

                                    {recordId && consulta.status === 'AGENDADA' && (
                                        <div className="upload-controls">
                                            <input type="file" id="exam-upload" style={{display: 'none'}} onChange={handleFileUpload} disabled={uploading} />
                                            <label htmlFor="exam-upload" className="upload-button">{uploading ? 'Enviando...' : 'Selecionar Arquivo'}</label>
                                        </div>
                                    )}
                                    <ul className="attachments-list">
                                        {attachments.length === 0 && <p className="no-data-small">Nenhum anexo.</p>}
                                        {attachments.map(att => (
                                            <li key={att.id}>
                                                <a href={att.fileUrl} target="_blank" rel="noopener noreferrer"><FaFileDownload/> {att.fileName}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        {/* PRESCRIÇÕES */}
                        <div className="section-block half-width">
                            <div className="section-title-row">
                                <div className="section-title"><FaPrescriptionBottleAlt /> Prescrições</div>
                                {consulta.status === 'AGENDADA' && recordId && (
                                    <button className="add-btn-icon" onClick={() => setShowPrescriptionForm(!showPrescriptionForm)} title="Adicionar Prescrição">
                                        <FaPlus />
                                    </button>
                                )}
                            </div>
                            
                            {(consulta.status === 'AGENDADA' || consulta.status === 'FINALIZADA') && (
                                <>
                                    {/* --- AVISO INSTRUTIVO --- */}
                                    {!recordId && consulta.status === 'AGENDADA' && (
                                        <div className="warning-box">
                                            <FaExclamationTriangle /> 
                                            <span>Salve o <strong>Relatório Médico</strong> acima para habilitar a prescrição.</span>
                                        </div>
                                    )}

                                    {showPrescriptionForm && (
                                        <div className="prescription-form-container">
                                            <input placeholder="Medicamento" value={prescriptionData.medication} onChange={e => setPrescriptionData({...prescriptionData, medication: e.target.value})} className="presc-input"/>
                                            <input placeholder="Dosagem" value={prescriptionData.dosage} onChange={e => setPrescriptionData({...prescriptionData, dosage: e.target.value})} className="presc-input"/>
                                            <textarea placeholder="Instruções..." value={prescriptionData.instructions} onChange={e => setPrescriptionData({...prescriptionData, instructions: e.target.value})} className="presc-input" rows="2"/>
                                            <button className="confirm-btn-small" onClick={handleAddPrescription}>Salvar</button>
                                        </div>
                                    )}

                                    <div className="prescriptions-list-view">
                                        {prescriptions.length === 0 && <p className="no-data-small">Nenhuma prescrição.</p>}
                                        {prescriptions.map((p, idx) => (
                                            <div key={idx} className="prescription-item-card-small">
                                                <strong>{p.medicationName}</strong>
                                                <span>{p.dosage}</span>
                                                <p>{p.frequency}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* AÇÕES FINAIS */}
                    <div className="details-actions sticky-actions">
                        <Link to="/vet/consultas" className="back-button">Voltar</Link>
                        <Link to={`/vet/chat`} className="chat-button-link">Chat com Tutor</Link>
                        {consulta.status === 'AGENDADA' && (
                            <button type="button" className="finalize-button" onClick={() => setConfirmFinalize(true)}>Finalizar Atendimento</button>
                        )}
                    </div>

                </div>
            </div>
            
            {showVaccineModal && (
                <AddVaccineModal 
                    petId={consulta.petId} 
                    vaccineToEdit={editingVaccine}
                    onClose={() => setShowVaccineModal(false)} 
                    onSuccess={onVaccineSuccess} 
                />
            )}

            <ConfirmModal
                isOpen={confirmFinalize}
                title="Finalizar Atendimento"
                message="Tem certeza que deseja finalizar esta consulta? Esta ação não pode ser desfeita."
                onConfirm={handleFinalizeConsultation}
                onCancel={() => setConfirmFinalize(false)}
                confirmText="Sim, finalizar"
                cancelText="Cancelar"
                type="info"
            />

            <ConfirmModal
                isOpen={vaccineToDelete !== null}
                title="Remover Vacina"
                message="Tem certeza que deseja remover esta vacina do histórico?"
                onConfirm={handleDeleteVaccine}
                onCancel={() => setVaccineToDelete(null)}
                confirmText="Sim, remover"
                cancelText="Cancelar"
                type="danger"
            />

            <Footer />
        </div>
    );
};

export default DetalhesConsulta;