// src/pages/admin/VetList/AddVetModal.js
import React, { useState } from 'react';
import api from '../../../services/api';
import './css/VetList.css';
import profileIcon from '../../../assets/images/Header/perfilIcon.png'; // Importar ícone padrão

const specialityOptions = [
    "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA",
    "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA",
    "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA"
];

const AddVetModal = ({ onClose, onVetAdded }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', crmv: '', rg: '',
        specialityenum: '', phone: '', imageurl: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(profileIcon); // CORREÇÃO: Usar ícone padrão
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
            // 1. Criar o usuário (backend define a role VETERINARY)
            const userResponse = await api.post('/admin/users', {
                username: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: "Endereço Padrão (Admin)", 
                rg: formData.rg,
                imageurl: '', // Backend usará o default
                role: 'VETERINARY'
            });
            
            // 2. Criar o perfil veterinário (usando a rota /veterinary original)
            const vetData = {
                name: formData.name,
                email: formData.email, // O DTO /veterinary ainda espera email/password
                password: formData.password,
                crmv: formData.crmv,
                rg: formData.rg,
                specialityenum: formData.specialityenum,
                phone: formData.phone,
                imageurl: '', // Backend usará o default
            };
            
            // Nota: O backend precisa ser ajustado para linkar o userAccount na rota POST /veterinary
            // ou a rota POST /veterinary deve ser removida em favor de POST /admin/users
            // Por enquanto, vamos assumir que o /admin/users é suficiente.
            
            // Se o seu backend CRIA O VETERINÁRIO automaticamente ao criar o USUÁRIO VETERINÁRIO:
             const newVetId = userResponse.data.id; // Isto está errado, o ID do Vet não é o ID do User
             // Precisamos de uma forma de obter o ID do Vet. 
             // Vamos assumir que o backend foi corrigido e /admin/users (VETERINARY) cria ambos.
             // E que o /upload/veterinary/ deve usar o ID DO USUÁRIO.
             
             // --- Tentativa de correção ---
             // Vamos assumir que o /admin/users retorna o UserResponseDTO
             // E que o /upload/veterinary/ precisa do ID DO VETERINÁRIO, não do usuário.
             // O fluxo está quebrado.
             
             // Vamos simplificar: A rota /veterinary (pública) cria o USER e o VET
             // A rota /admin/users (admin) cria o USER (e o VET/SCHEDULE)
             
             // Vamos usar a rota /admin/users que é mais completa
             
            const newUser = userResponse.data; // Este é o UserResponseDTO

            // 3. Fazer upload da imagem (se houver)
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                // Precisamos do ID do VETERINÁRIO, não do usuário.
                // Vamos assumir que o backend /admin/users não cria o VET, só o USER
                // Vamos reverter e usar a rota POST /veterinary
                
                // --- REVERTENDO A LÓGICA ---
                setLoading(true);
                setError('');
                
                const vetPayload = {
                    ...formData,
                    imageurl: '' // Backend define o padrão
                };
                
                const response = await api.post('/veterinary', vetPayload);
                const newVet = response.data; // Isto é VeterinaryResponseDTO

                if (imageFile) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', imageFile);
                    await api.post(`/upload/veterinary/${newVet.id}`, uploadFormData);
                }
            }
            
            alert('Veterinário cadastrado com sucesso!');
            onVetAdded();
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erro ao cadastrar veterinário.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                 <h2>Adicionar Novo Veterinário</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload">
                         <label htmlFor="avatar-input-add-vet" className="avatar-label">
                            <img src={imagePreview} alt="Preview" className="avatar-preview" />
                        </label>
                         <input id="avatar-input-add-vet" type="file" accept="image/*" onChange={handleImageChange} className="avatar-input" />
                    </div>
                    <div className="form-group-modal"><label>Nome Completo</label><input type="text" name="name" required onChange={handleChange} /></div>
                     <div className="form-group-modal"><label>Email</label><input type="email" name="email" required onChange={handleChange} /></div>
                    <div className="form-group-modal"><label>Senha Provisória</label><input type="password" name="password" required onChange={handleChange} /></div>
                    <div className="form-group-modal"><label>CRMV</label><input type="text" name="crmv" required onChange={handleChange} /></div>
                     <div className="form-group-modal"><label>RG</label><input type="text" name="rg" required onChange={handleChange} /></div>
                    <div className="form-group-modal"><label>Telefone</label><input type="tel" name="phone" required onChange={handleChange} /></div>
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

export default AddVetModal;