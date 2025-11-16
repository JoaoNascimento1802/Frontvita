import React, { useState } from 'react';
import api from '../../../services/api';
import './css/styles.css';
import './css/modal-styles.css';
import defaultProfileIcon from '../../../assets/images/Header/perfilIcon.png';
import { toast } from 'react-toastify';

const AddEmployeeModal = ({ onClose, onEmployeeAdded }) => {
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', phone: '',
        address: '', rg: '', imageurl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(defaultProfileIcon);
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
        try {
            // Adiciona a role 'EMPLOYEE' ao payload da requisição
            const payload = { ...formData, role: 'EMPLOYEE' };
            
            // Assumindo um endpoint /admin/users para criação, que é mais seguro
            const response = await api.post('/admin/users', payload); 
            const newUser = response.data;

            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                await api.post(`/upload/user/${newUser.id}`, uploadFormData);
            }

            toast.success('Funcionário cadastrado com sucesso!');
            onEmployeeAdded();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Erro ao cadastrar funcionário.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>✨ Adicionar Novo Funcionário</h2>
                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload">
                        <label htmlFor="avatar-input-add-employee" className="avatar-label" title="Clique para adicionar foto">
                            <img src={imagePreview} alt="Preview do Avatar" className="avatar-preview" />
                        </label>
                        <input 
                            id="avatar-input-add-employee" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="avatar-input" 
                        />
                    </div>
                    
                    <div className="form-group-modal">
                        <label>Nome Completo</label>
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Digite o nome completo do funcionário"
                            required 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="form-group-modal">
                        <label>Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="funcionario@exemplo.com"
                            required 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="form-group-modal">
                        <label>Senha Provisória</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Mínimo 6 caracteres"
                            minLength="6"
                            required 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="form-group-modal">
                        <label>Telefone</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            placeholder="11987654321 (apenas números)"
                            pattern="[0-9]{11}"
                            title="Digite 11 números (DDD + número)"
                            required 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="form-group-modal">
                        <label>Endereço Completo</label>
                        <input 
                            type="text" 
                            name="address" 
                            placeholder="Rua, número, bairro, cidade - Estado"
                            required 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="form-group-modal">
                        <label>RG (somente números)</label>
                        <input 
                            type="text" 
                            name="rg" 
                            placeholder="123456789"
                            pattern="[0-9]{7,12}"
                            title="Digite apenas números do RG"
                            required 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Salvando...' : 'Cadastrar Funcionário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
