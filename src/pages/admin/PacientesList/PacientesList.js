import React, { useState, useEffect, useCallback } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSave, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AddPatientModal from './AddPatientModal';
import './css/PacientesList.css';
import { toast } from 'react-toastify';

const PacientesList = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 9;

    const fetchPacientes = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { 
                name: searchTerm,
                page: currentPage,
                size: PAGE_SIZE,
                sort: 'username,asc' 
            };
            
            const response = await api.get('/admin/users', { params });
            
            // Corrigido para response.data.content
            const clientUsers = response.data.content.filter(user => user.role === 'USER');
            setPacientes(clientUsers);
            setTotalPages(response.data.totalPages);

        } catch (err) {
            setError('Falha ao buscar pacientes.');
            toast.error('Falha ao buscar pacientes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage]);

    useEffect(() => {
        fetchPacientes();
    }, [fetchPacientes]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const handlePatientAdded = () => {
        setIsModalOpen(false);
        setCurrentPage(0); 
        fetchPacientes();
    };

    const handleEditClick = (paciente) => {
        setEditingId(paciente.id);
        setEditFormData({ ...paciente });
    };

    const handleCancelClick = () => setEditingId(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async (id) => {
        try {
            const updateDTO = {
                username: editFormData.username,
                email: editFormData.email,
                phone: editFormData.phone,
                address: editFormData.address 
            };
            await api.put(`/admin/users/${id}`, updateDTO);
            setEditingId(null);
            fetchPacientes(); 
            toast.success('Paciente atualizado com sucesso!');
        } catch (err) {
            toast.error('Erro ao salvar paciente.');
            console.error(err);
        }
    };

    const handleDelete = async (paciente) => {
        if (window.confirm(`Tem certeza que deseja excluir ${paciente.username}?`)) {
            try {
                // --- CORREÇÃO APLICADA AQUI ---
                // O erro 'id is not defined' foi corrigido.
                // Trocado 'id' por 'paciente.id'.
                await api.delete(`/admin/users/${paciente.id}`);
                fetchPacientes(); 
                toast.success('Paciente excluído com sucesso!');
            } catch (err) {
                toast.error('Erro ao excluir paciente.');
                console.error(err);
            }
        }
    };

    return (
        <div className="admin-page">
            <HeaderAdmin />
            <main className="admin-content">
                <div className="admin-page-header">
                    <h1>Gerenciar Pacientes (Tutores)</h1>
                    <button className="add-new-button" onClick={() => setIsModalOpen(true)}>
                        <FaPlus /> Adicionar Novo
                    </button>
                </div>
                <div className="admin-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome do tutor..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                {loading && <p>Carregando...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    <>
                        {pacientes.length === 0 ? (
                            <div className="no-data-message" style={{textAlign: 'center', padding: '20px'}}>
                                {searchTerm ? 'Nenhum paciente encontrado com esse nome.' : 'Nenhum paciente (tutor) cadastrado.'}
                            </div>
                        ) : (
                            <div className="admin-card-grid">
                                {pacientes.map(p => (
                                    <div key={p.id} className="admin-card">
                                        {editingId === p.id ? (
                                            <>
                                                <div className="card-header-admin">
                                                  <span className="card-title">Editando: {editFormData.username}</span>
                                                </div>
                                                <div className="card-body-admin">
                                                    <div className="form-group-card"><label>Nome do Tutor</label><input type="text" name="username" value={editFormData.username} onChange={handleFormChange} className="card-input" /></div>
                                                    <div className="form-group-card"><label>Email</label><input type="email" name="email" value={editFormData.email} onChange={handleFormChange} className="card-input" /></div>
                                                    <div className="form-group-card"><label>Telefone</label><input type="text" name="phone" value={editFormData.phone} onChange={handleFormChange} className="card-input"/></div>
                                                </div>
                                                <div className="card-actions-admin">
                                                    <button className="action-button-card cancel" onClick={handleCancelClick}><FaTimes /> Cancelar</button>
                                                    <button className="action-button-card save" onClick={() => handleSaveClick(p.id)}><FaSave /> Salvar</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="card-header-admin">
                                                    <div className="card-avatar-placeholder">{p.username.charAt(0)}</div>
                                                    <span className="card-title">{p.username}</span>
                                                </div>
                                                <div className="card-body-admin">
                                                    <p><strong>Email:</strong> {p.email}</p>
                                                    <p><strong>Telefone:</strong> {p.phone}</p>
                                                </div>
                                                <div className="card-actions-admin">
                                                    <button className="action-button-card delete" onClick={() => handleDelete(p)}><FaTrash /> Excluir</button>
                                                    <button className="action-button-card edit" onClick={() => handleEditClick(p)}><FaEdit /> Editar</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={currentPage === 0}
                                >
                                    <FaChevronLeft /> Anterior
                                </button>
                                <span>
                                    Página {currentPage + 1} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage + 1 >= totalPages}
                                >
                                    Próxima <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
            
            {isModalOpen && <AddPatientModal onClose={() => setIsModalOpen(false)} onPatientAdded={handlePatientAdded} />}
            
            <Footer />
        </div>
    );
};

export default PacientesList;