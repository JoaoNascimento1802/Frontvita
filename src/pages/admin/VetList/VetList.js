// src/pages/admin/VetList/VetList.js
import React, { useState, useEffect, useCallback } from 'react';
import HeaderAdmin from '../../../components/HeaderAdmin/HeaderAdmin';
import Footer from '../../../components/Footer';
import AddVetModal from './AddVetModal';
import EditVetModal from './EditVetModal';
import ConfirmModal from '../../../components/ConfirmModal';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import './css/VetList.css'; 

const specialityLabels = [
    "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA",
    "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA",
    "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA",
    "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA"
];

const VetList = () => {
    const [vets, setVets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVet, setSelectedVet] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, vetId: null });

    // Estados dos filtros
    const [nameFilter, setNameFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');

    const fetchVets = useCallback(async (query = {}) => {
        setLoading(true);
        try {
            const response = await api.get('/veterinary/search', { params: query });
            
            // --- CORREÇÃO 1: Carregamento de dados ---
            // A API retorna um array, não um objeto .content 
            setVets(response.data || []); 

        } catch (error) {
            setError('Falha ao carregar veterinários.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVets({}); // Busca todos na montagem
    }, [fetchVets]);

    const handleFilter = () => {
        const query = {};
        if (nameFilter) query.name = nameFilter;
        if (specialtyFilter) query.speciality = specialtyFilter;
        fetchVets(query);
    };

    const handleEdit = (vet) => {
        setSelectedVet(vet);
        setIsEditModalOpen(true);
    };

    const handleDelete = (vetId) => {
        setConfirmDelete({ isOpen: true, vetId });
    };

    const confirmDeleteVet = async () => {
        try {
            await api.delete(`/admin/veterinarians/${confirmDelete.vetId}`);
            toast.success('Veterinário excluído com sucesso!');
            fetchVets();
        } catch (error) {
            toast.error('Erro ao excluir veterinário.');
        } finally {
            setConfirmDelete({ isOpen: false, vetId: null });
        }
    };

    const onVetAdded = () => {
        setIsAddModalOpen(false);
        fetchVets();
    };
    
    const onVetUpdated = () => {
        setIsEditModalOpen(false);
        setSelectedVet(null);
        fetchVets();
    };

    return (
        <div className="admin-page">
            <HeaderAdmin />
            <main className="admin-content">
                <div className="admin-page-header">
                    <h1>Veterinários Cadastrados</h1>
                    <button className="add-new-button" onClick={() => setIsAddModalOpen(true)}>
                        Adicionar Veterinário
                    </button>
                </div>

                <div className="admin-filters">
                    <input type="text" placeholder="Filtrar por nome..." value={nameFilter} onChange={e => setNameFilter(e.target.value)} />
                    <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)}>
                        <option value="">Todas as Especialidades</option>
                        {specialityLabels.map(spec => (
                            <option key={spec} value={spec}>{spec.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <button onClick={handleFilter}>Filtrar</button>
                </div>
                
                {loading && <p>Carregando...</p>}
                {error && <p className="error-message">{error}</p>}
                
                {!loading && !error && (
                    <div className="admin-card-grid">
                        {vets.length === 0 ? (
                            <p>Nenhum veterinário encontrado.</p>
                        ) : (
                            vets.map(vet => (
                                <div key={vet.id} className="vet-card">
                                    <img 
                                        src={vet.imageurl} 
                                        alt={vet.name} 
                                        className="vet-avatar" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/2qgrCI2.png'; }}
                                    />
                                    <h4 className="vet-name">{vet.name}</h4>
                                    
                                    {/* --- CORREÇÃO 2: Verificação de Nulo --- */}
                                    <p className="vet-specialty">
                                        {(vet.specialityenum || 'N/A').replace(/_/g, " ")}
                                    </p>
                                    
                                    <p className="vet-info">{vet.email}</p>
                                    <p className="vet-info">{vet.phone}</p>
                                    <p className="vet-info">CRMV: {vet.crmv}</p>
                                    
                                    <div className="card-actions">
                                        <button className="action-button edit" onClick={() => handleEdit(vet)}>Editar</button>
                                        <button className="action-button delete" onClick={() => handleDelete(vet.id)}>Excluir</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
            
            {isAddModalOpen && (
                <AddVetModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onVetAdded={onVetAdded} 
                />
            )}
            
            {isEditModalOpen && selectedVet && (
                <EditVetModal 
                    vet={selectedVet}
                    onClose={() => setIsEditModalOpen(false)} 
                    onVetUpdated={onVetUpdated}
                />
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Excluir Veterinário"
                message="Tem certeza que deseja excluir este veterinário? Esta ação é irreversível."
                onConfirm={confirmDeleteVet}
                onCancel={() => setConfirmDelete({ isOpen: false, vetId: null })}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
            />
            
            <Footer />
        </div>
    );
};

export default VetList;