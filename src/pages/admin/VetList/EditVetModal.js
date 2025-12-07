// src/pages/admin/VetList/EditVetModal.js
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import './css/VetList.css'; // Reutiliza o mesmo CSS
import profileIcon from '../../../assets/images/Header/perfilIcon.png';

const specialityOptions = [
    "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA",
    "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA",
    "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA"
];

const EditVetModal = ({ vet, onClose, onVetUpdated }) => {
    // Inicializa o formulário com os dados do veterinário selecionado
    const [formData, setFormData] = useState({
        name: vet.name || '',
        email: vet.email || '', // O backend não espera e-mail, mas o userAccount sim
        crmv: vet.crmv || '',
        rg: vet.rg || '', // O backend espera rg
        specialityenum: vet.specialityenum || 'CLINICO_GERAL',
        phone: vet.phone || '',
        imageurl: vet.imageurl || '', // URL da imagem atual
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(vet.imageurl || profileIcon);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // 1. Atualiza os dados do veterinário no backend
            // A rota /admin/veterinarians/{id} espera um VeterinaryRequestDTO 
            // que é diferente do VeterinaryResponseDTO.
            const vetDataPayload = {
                name: formData.name,
                email: formData.email,
                password: '', // Senha não pode ser alterada aqui (ou adicione um campo)
                crmv: formData.crmv,
                rg: formData.rg,
                specialityenum: formData.specialityenum,
                phone: formData.phone,
                imageurl: formData.imageurl // Passa a URL atual
            };

            await api.put(`/admin/veterinarians/${vet.id}`, vetDataPayload);

            // 2. Faz upload da nova imagem (se uma foi selecionada)
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                // A rota de upload espera o ID do VETERINÁRIO
                await api.post(`/upload/veterinary/${vet.id}`, uploadFormData);
            }
            
            toast.success('Veterinário atualizado com sucesso!');
            onVetUpdated(); // Fecha o modal e atualiza a lista
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erro ao atualizar veterinário.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                 <h2>Editando Veterinário: {vet.name}</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload">
                         <label htmlFor="avatar-input-edit-vet" className="avatar-label">
                            <img src={imagePreview} alt="Preview" className="avatar-preview" />
                        </label>
                         <input id="avatar-input-edit-vet" type="file" accept="image/*" onChange={handleImageChange} className="avatar-input" />
                    </div>
                    <div className="form-group-modal"><label>Nome Completo</label><input type="text" name="name" value={formData.name} required onChange={handleChange} /></div>
                    <div className="form-group-modal"><label>Email (Login)</label><input type="email" name="email" value={formData.email} required onChange={handleChange} /></div>
                    <div className="form-group-modal"><label>CRMV</label><input type="text" name="crmv" value={formData.crmv} required onChange={handleChange} /></div>
                     <div className="form-group-modal"><label>RG</label><input type="text" name="rg" value={formData.rg} required onChange={handleChange} /></div>
                    <div className="form-group-modal"><label>Telefone</label><input type="tel" name="phone" value={formData.phone} required onChange={handleChange} /></div>
                    <div className="form-group-modal">
                         <label>Especialidade</label>
                        <select name="specialityenum" required onChange={handleChange} value={formData.specialityenum}>
                            <option value="">Selecione...</option>
                             {specialityOptions.map(spec => (
                                <option key={spec} value={spec}>{spec.replace(/_/g, " ")}</option>
                             ))}
                        </select>
                    </div>
                     <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
                     </div>
                </form>
            </div>
        </div>
    );
};

export default EditVetModal;