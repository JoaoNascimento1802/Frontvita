// src/pages/admin/VetList/AddVetModal.js
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import './css/VetList.css';
import profileIcon from '../../../assets/images/Header/perfilIcon.png';

const specialityOptions = [
    "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA",
    "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA",
    "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA"
];

const AddVetModal = ({ onClose, onVetAdded }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', crmv: '', rg: '',
        specialityenum: 'CLINICO_GERAL', phone: '', imageurl: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(profileIcon);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            // 1. Criar o usuário (Envia o CRMV aqui!)
            const userResponse = await api.post('/admin/users', {
                username: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: "Endereço Padrão (Admin)",
                rg: formData.rg,
                crmv: formData.crmv,
                speciality: formData.specialityenum, // <--- MUDANÇA AQUI
                imageurl: '', 
                role: 'VETERINARY'
            });
            
            // Se a criação do usuário tiver sucesso, o UserService agora cria o perfil Vet automaticamente
            // com o CRMV correto. Não precisamos chamar /veterinary manualmente.
            
            const newUser = userResponse.data;

            // 2. Fazer upload da imagem (se houver)
            if (imageFile) {
                // Busca o VetID para fazer o upload da imagem no perfil correto
                // Como o backend cria o vet automaticamente, precisamos descobrir o ID dele ou usar o ID do usuário se a rota permitir
                // Assumindo que o upload/user funciona para o avatar do usuário:
                 const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                await api.post(`/upload/user/${newUser.id}`, uploadFormData);
            }
            
            toast.success('Veterinário cadastrado com sucesso!');
            onVetAdded();
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erro ao cadastrar veterinário.";
            setError(errorMsg);
            console.error(err);
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
                    <div className="form-group-modal">
                        <label>Senha Provisória</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password" 
                                required 
                                onChange={handleChange}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Campo CRMV */}
                    <div className="form-group-modal"><label>CRMV</label><input type="text" name="crmv" required onChange={handleChange} placeholder="Ex: SP-12345" /></div>
                    
                     <div className="form-group-modal"><label>RG</label><input type="text" name="rg" required onChange={handleChange} /></div>
                    <div className="form-group-modal"><label>Telefone</label><input type="tel" name="phone" required onChange={handleChange} /></div>
                    <div className="form-group-modal">
                         <label>Especialidade</label>
                        <select name="specialityenum" required onChange={handleChange} value={formData.specialityenum}>
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