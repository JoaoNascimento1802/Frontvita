// src/pages/admin/ClinicServices.js
import React, { useState, useEffect, useCallback } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import ConfirmModal from '../../../components/ConfirmModal';
import api from '../../../services/api';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import './styles.css';
import { toast } from 'react-toastify';
import { formatEnumLabel } from '../../../utils/format';

const specialityOptions = [
    "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA",
    "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA",
    "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA", "ESTETICA"
];

const ClinicServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, serviceId: null });
    // Estado inicial padronizado
    const initialFormData = { name: '', description: '', price: '', isMedicalService: 'false', speciality: 'ESTETICA' };
    const [formData, setFormData] = useState(initialFormData);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/public/services'); // Rota pública para buscar
            setServices(response.data);
        } catch (err) {
            toast.error('Falha ao buscar os serviços da clínica.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        // Lógica para travar a especialidade
        if (name === 'isMedicalService') {
            if (value === 'false') {
                // Se for serviço geral, força a especialidade para ESTETICA
                updatedData.speciality = 'ESTETICA';
            } else {
                // Se for serviço médico, define um padrão (ex: Clinico Geral)
                updatedData.speciality = 'CLINICO_GERAL';
            }
        }
        setFormData(updatedData);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validação de preço
        if (parseFloat(formData.price) <= 0) {
            toast.error("O preço deve ser maior que zero.");
            return;
        }

        const payload = {
            ...formData,
            price: parseFloat(formData.price), // Garante que o preço é um número
            isMedicalService: formData.isMedicalService === 'true'
        };
        
        try {
            if (editingId) {
                // Rota de Edição (PUT)
                await api.put(`/admin/clinic-services/${editingId}`, payload);
                toast.success('Serviço atualizado com sucesso!');
            } else {
                // Rota de Criação (POST)
                await api.post('/admin/clinic-services', payload);
                toast.success('Serviço criado com sucesso!');
            }
            resetForm();
            fetchServices(); // Atualiza a lista
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Erro ao salvar o serviço.';
            toast.error(errorMsg);
            console.error(err.response || err);
        }
    };

    const handleDelete = (id) => {
        setConfirmDelete({ isOpen: true, serviceId: id });
    };

    const confirmDeleteService = async () => {
        try {
            await api.delete(`/admin/clinic-services/${confirmDelete.serviceId}`);
            toast.success('Serviço excluído com sucesso!');
            fetchServices();
        } catch (err) {
            toast.error('Erro ao excluir o serviço.');
        } finally {
            setConfirmDelete({ isOpen: false, serviceId: null });
        }
    };

    const handleEditClick = (service) => {
        setEditingId(service.id);
        setIsCreating(false);
        // Preenche o formulário com os dados do serviço
        setFormData({ 
            name: service.name, 
            description: service.description || '', 
            price: service.price,
            isMedicalService: String(service.medicalService), // Converte boolean para string
            speciality: service.speciality
        });
    };

    const resetForm = () => {
         setEditingId(null);
        setIsCreating(false);
        setFormData(initialFormData);
    };

    const handleAddNewClick = () => {
        setEditingId(null);
        setFormData(initialFormData);
        setIsCreating(true);
    };

    return (
        <div className="admin-page">
            <HeaderAdmin />
            <main className="admin-content">
                 <div className="admin-page-header">
                    <h1>Gerenciar Serviços da Clínica</h1>
                    <button className="add-new-button" onClick={handleAddNewClick}>
                        <FaPlus /> Adicionar Serviço
                     </button>
                </div>

                {(isCreating || editingId) && (
                     <div className="form-container">
                         <h3>{editingId ? 'Editando Serviço' : 'Novo Serviço'}</h3>
                        <form onSubmit={handleSave}>
                        
                             <div className="form-row">
                                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome do Serviço" required />
                                
                                 <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Preço (ex: 150.00)" required step="0.01" min="0.01" />
                            </div>
    
                            <div className="form-row">
                                 <select name="isMedicalService" value={formData.isMedicalService} onChange={handleInputChange} required>
                                    <option value="false">Serviço Geral / Estética</option>
                                     <option value="true">Serviço Médico (Consulta)</option>
                                </select>
                             
                                <select name="speciality" value={formData.speciality} onChange={handleInputChange} required disabled={formData.isMedicalService === 'false'}>
                                 {formData.isMedicalService === 'false' ? (
                                        <option value="ESTETICA">Estética</option>
                                 ) : (
                                    // Mapeia todas as opções exceto Estética
                                    specialityOptions.map(spec => (
                                        spec !== 'ESTETICA' && <option key={spec} value={spec}>{formatEnumLabel(spec)}</option>
                                    ))
                                 )}
                                </select>
                             </div>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Descrição do serviço..." rows="3"></textarea>
                        
                             <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={resetForm}><FaTimes /> Cancelar</button>
                                <button type="submit" className="btn-save"><FaSave /> Salvar</button>
                            </div>
                        </form>
                    </div>
                 )}
                
                {loading && <p>A carregar...</p>}
                
                 <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Nome do Serviço</th>
                            <th>Descrição</th>
                            <th>Preço</th>
                             <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                     </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id}>
                                <td>{service.name}</td>
                                <td>{service.description}</td>
                                 <td>R$ {Number(service.price).toFixed(2)}</td>
                                <td>
                                     <span className={`service-type-badge ${service.medicalService ? 'medical' : 'general'}`}>
                                        {service.medicalService ? 'Médico' : 'Geral'}
                                     </span>
                                </td>
                                 <td className="action-cell">
                                    <button className="action-button-card edit" onClick={() => handleEditClick(service)}><FaEdit /></button>
                                     <button className="action-button-card delete" onClick={() => handleDelete(service.id)}><FaTrash /></button>
                                </td>
                            </tr>
                         ))}
                    </tbody>
                </table>
            </main>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Excluir Serviço"
                message="Tem certeza que deseja excluir este serviço? Esta ação é irreversível."
                onConfirm={confirmDeleteService}
                onCancel={() => setConfirmDelete({ isOpen: false, serviceId: null })}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
            />

             <Footer />
        </div>
    );
};

export default ClinicServices;