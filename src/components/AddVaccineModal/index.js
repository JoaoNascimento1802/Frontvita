import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaSyringe, FaCalendarAlt, FaIndustry, FaBarcode, FaNotesMedical } from 'react-icons/fa';
import './styles.css';

const AddVaccineModal = ({ petId, onClose, onSuccess, vaccineToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        manufacturer: '',
        batch: '',
        applicationDate: new Date().toISOString().split('T')[0],
        nextDoseDate: '',
        observations: ''
    });
    const [loading, setLoading] = useState(false);

    // Preenche o formulário se for edição
    useEffect(() => {
        if (vaccineToEdit) {
            setFormData({
                name: vaccineToEdit.name || '',
                manufacturer: vaccineToEdit.manufacturer || '',
                batch: vaccineToEdit.batch || '',
                applicationDate: vaccineToEdit.applicationDate || '',
                nextDoseDate: vaccineToEdit.nextDoseDate || '',
                observations: vaccineToEdit.observations || ''
            });
        }
    }, [vaccineToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.nextDoseDate && formData.nextDoseDate < formData.applicationDate) {
            toast.warn("A data da próxima dose não pode ser anterior à aplicação.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                petId: parseInt(petId),
                nextDoseDate: formData.nextDoseDate || null 
            };

            if (vaccineToEdit) {
                // PUT para edição
                await api.put(`/api/vaccines/${vaccineToEdit.id}`, payload);
                toast.success("Vacina atualizada com sucesso!");
            } else {
                // POST para criação
                await api.post('/api/vaccines', payload);
                toast.success("Vacina registrada com sucesso!");
            }
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar vacina.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-vaccine" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><FaSyringe /> {vaccineToEdit ? 'Editar Vacina' : 'Registrar Vacina'}</h3>
                    <button className="close-btn-icon" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome da Vacina *</label>
                        <div className="input-with-icon">
                            <FaSyringe className="input-icon" />
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    {/* ... Resto do formulário igual ... */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fabricante</label>
                            <div className="input-with-icon">
                                <FaIndustry className="input-icon" />
                                <input name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Lote</label>
                            <div className="input-with-icon">
                                <FaBarcode className="input-icon" />
                                <input name="batch" value={formData.batch} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Data Aplicação *</label>
                            <div className="input-with-icon">
                                <FaCalendarAlt className="input-icon" />
                                <input type="date" name="applicationDate" value={formData.applicationDate} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Próxima Dose</label>
                            <div className="input-with-icon">
                                <FaCalendarAlt className="input-icon" />
                                <input type="date" name="nextDoseDate" value={formData.nextDoseDate} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Observações</label>
                        <div className="input-with-icon textarea-icon">
                            <FaNotesMedical className="input-icon" />
                            <textarea name="observations" value={formData.observations} onChange={handleChange} rows="2"></textarea>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Salvando...' : (vaccineToEdit ? 'Atualizar' : 'Registrar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVaccineModal;