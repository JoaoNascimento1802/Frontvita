import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import ImageCropper from '../../../../components/ImageCropper/ImageCropper';
import { FaPencilAlt, FaPlus, FaNotesMedical, FaFileMedical } from 'react-icons/fa';
import profileIcon from '../../../../assets/images/Header/perfilIcon.png';
import './css/styles.css';
import '../../../../pages/admin/EmployeeList/css/modal-styles.css';
import { formatEnumLabel } from '../../../../utils/format';

// Importação dos componentes de vacina
import VaccineCard from '../../../../components/VaccineCard'; 
import AddVaccineModal from '../../../../components/AddVaccineModal';

// Enums e Constantes para os Selects
const speciesOptions = [ "CACHORRO", "GATO", "PASSARO", "PEIXE", "ROEDOR", "REPTIL", "COELHO", "OUTROS" ];
const porteOptions = ["PEQUENO", "MEDIO", "GRANDE"];
const genderOptions = ["Macho", "Femea"];
const breedOptions = {
    CACHORRO: ["LABRADOR_RETRIEVER", "GOLDEN_RETRIEVER", "BULLDOG_FRANCES", "PASTOR_ALEMAO", "POODLE", "BEAGLE", "ROTTWEILER", "DACHSHUND", "SHIH_TZU", "OUTRO"],
    GATO: ["PERSA", "SIAMES", "MAINE_COON", "RAGDOLL", "BENGAL", "SPHYNX", "BRITISH_SHORTHAIR", "SCOTTISH_FOLD", "OUTRO"],
    PASSARO: ["CALOPSITA", "CANARIO", "PERIQUITO_AUSTRALIANO", "AGAPORNIS", "RINGNECK", "CACATUA", "ARARA", "PAPAGAIO_VERDADEIRO", "OUTRO"],
    PEIXE: ["BETA", "GUPPY", "GOLDFISH_COMETA", "MOLLY", "PLATY", "TETRA_NEON", "CORYDORA", "PEIXE_PALHACO", "OUTRO"],
    ROEDOR: ["HAMSTER_SIRIO", "HAMSTER_ANAO_RUSSO", "RATO_TWISTER", "PORQUINHO_DA_INDIA_INGLES", "PORQUINHO_DA_INDIA_PERUANO", "CHINCHILA", "GERBIL", "ESQUILO_DA_MONGOLIA", "OUTRO"],
    REPTIL: ["DRAGAO_BARBUDO", "CORN_SNAKE", "TARTARUGA_TIGRE_DAGUA", "LEOPARDO_GECKO", "IGUANA_VERDE", "PITON_REAL", "JIBOIA", "CAMALEAO", "OUTRO"],
    COELHO: ["ANAO_HOLANDES", "MINI_LOP", "NOVA_ZELANDIA_BRANCO", "LIONHEAD", "FLEMISH_GIANT", "HOLLAND_LOP", "REX", "ANGORA_INGLES", "OUTRO"],
};

const getBreedKeyForSpecies = (species) => {
    switch (species) {
        case 'CACHORRO': return 'dogBreed';
        case 'GATO': return 'catBreed';
        case 'PASSARO': return 'birdBreed';
        case 'PEIXE': return 'fishBreed';
        case 'ROEDOR': return 'rodentBreed';
        case 'REPTIL': return 'reptileBreed';
        case 'COELHO': return 'rabbitBreed';
        default: return null;
    }
};

const PetsDetails = () => {
    const { petId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados de Dados do Pet
    const [petData, setPetData] = useState(null);
    const [editData, setEditData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados de Imagem
    const [isSaving, setIsSaving] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(profileIcon);
    const [hasChanges, setHasChanges] = useState(false);

    // Estados de Abas e Listas
    const [activeTab, setActiveTab] = useState('details');
    const [vaccines, setVaccines] = useState([]);
    const [showVaccineModal, setShowVaccineModal] = useState(false);
    const [medicalRecords, setMedicalRecords] = useState([]);

    const isVet = user?.role === 'VETERINARY';

    // --- BUSCA DE DADOS ---
    useEffect(() => {
        const fetchPetDetails = async () => {
            if (!petId) return;
            setLoading(true);
            try {
                const response = await api.get(`/pets/${petId}`);
                setPetData(response.data);
                setEditData(response.data);
                setImagePreview(response.data.imageurl || profileIcon);
            } catch (err) {
                console.error(err);
                setError('Não foi possível carregar os dados do pet.');
            } finally {
                setLoading(false);
            }
        };

        const fetchVaccinesLocal = async () => {
            try {
                const response = await api.get(`/api/vaccines/pet/${petId}`);
                setVaccines(response.data || []);
            } catch (err) {
                console.error("Erro ao buscar vacinas:", err);
            }
        };

        const fetchMedicalRecordsLocal = async () => {
            try {
                // Busca o prontuário na rota correta
                const response = await api.get(`/api/pets/${petId}/medical-records`);
                setMedicalRecords(response.data || []);
            } catch (err) {
                console.error("Erro ao buscar prontuários (pode estar vazio):", err);
            }
        };

        fetchPetDetails();
        fetchVaccinesLocal();
        fetchMedicalRecordsLocal();
    }, [petId]);

    const fetchVaccines = async () => {
        try {
            const response = await api.get(`/api/vaccines/pet/${petId}`);
            setVaccines(response.data || []);
        } catch (err) {}
    };

    // --- HANDLERS DE IMAGEM ---
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => { setImageToCrop(reader.result); };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropComplete = (croppedFile) => {
        setImageFile(croppedFile);
        setImagePreview(URL.createObjectURL(croppedFile));
        setImageToCrop(null);
        setHasChanges(true);
    };

    // --- HANDLERS DE FORMULÁRIO ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...editData, [name]: value };
        
        if (name === 'speciespet') {
            updatedData.dogBreed = null;
            updatedData.catBreed = null;
            updatedData.birdBreed = null;
            updatedData.fishBreed = null;
            updatedData.rodentBreed = null;
            updatedData.reptileBreed = null;
            updatedData.rabbitBreed = null;
            updatedData.personalizedBreed = null;
        }
        setEditData(updatedData);
        setHasChanges(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { name, age, speciespet, porte, gender, personalizedBreed } = editData;
            const breedKey = getBreedKeyForSpecies(speciespet);
            const selectedBreed = breedKey ? editData[breedKey] : null;

            const dataToSend = {
                name, age: parseInt(age),
                imageurl: petData.imageurl,
                speciespet, porte, gender, usuarioId: petData.usuarioId,
                dogBreed: null, catBreed: null, birdBreed: null, fishBreed: null,
                rodentBreed: null, reptileBreed: null, rabbitBreed: null,
                personalizedBreed: null,
            };

            if (selectedBreed === 'OUTRO') {
                dataToSend.personalizedBreed = personalizedBreed;
            } else if (breedKey && selectedBreed) {
                dataToSend[breedKey] = selectedBreed;
            }

            await api.put(`/pets/${petId}`, dataToSend);

            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                await api.post(`/upload/pet/${petId}`, uploadFormData);
            }

            const updatedPet = await api.get(`/pets/${petId}`);
            setPetData(updatedPet.data);
            setEditData(updatedPet.data);
            setImagePreview(updatedPet.data.imageurl || profileIcon);
            
            setIsEditing(false);
            setHasChanges(false);
            setImageFile(null);
            alert('Dados do pet atualizados com sucesso!');

        } catch (err) {
            console.error(err);
            alert('Erro ao salvar as alterações.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (event) => {
        event.preventDefault();
        if (window.confirm(`Tem certeza que deseja remover ${petData.name}?`)) {
            try {
                await api.delete(`/pets/${petId}`);
                alert('Pet removido com sucesso!');
                navigate('/pets');
            } catch (err) {
                alert('Erro ao remover o pet.');
            }
        }
    };

    const handleEditClick = (event) => {
        event.preventDefault();
        setIsEditing(true);
        setHasChanges(false);
    };

    const handleCancelClick = (event) => {
        event.preventDefault();
        setIsEditing(false);
        setEditData(petData);
        setImagePreview(petData.imageurl || profileIcon);
        setImageFile(null);
        setImageToCrop(null);
    };

    const handleDeleteVaccine = async (vaccineId) => {
        if (window.confirm('Tem certeza que deseja remover esta vacina?')) {
            try {
                await api.delete(`/api/vaccines/${vaccineId}`);
                fetchVaccines();
            } catch (error) {
                alert('Erro ao deletar vacina.');
            }
        }
    };

    const renderBreedSelector = () => {
        const selectedSpecies = editData.speciespet;
        const breedKey = getBreedKeyForSpecies(selectedSpecies);

        if (!selectedSpecies || !breedOptions[selectedSpecies] || selectedSpecies === 'OUTROS') {
            return (
                <div className="profile-field">
                    <label>Raça</label>
                    <input type="text" name="personalizedBreed" value={editData.personalizedBreed || ''} onChange={handleInputChange} className="info-field editable" placeholder="Digite a raça"/>
                </div>
            );
        }

        return (
            <div className="profile-field">
                <label>Raça</label>
                <select name={breedKey} value={editData[breedKey] || ''} onChange={handleInputChange} className="info-field editable">
                    <option value="">Selecione a raça</option>
                    {breedOptions[selectedSpecies].map(breed => (
                        <option key={breed} value={breed}>{breed.replace(/_/g, ' ').charAt(0) + breed.replace(/_/g, ' ').slice(1).toLowerCase()}</option>
                    ))}
                </select>
            </div>
        );
    };

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (error) return <div className="error-message" style={{margin: '150px auto'}}>{error}</div>;
    if (!petData) return null;

    return (
        <div className="profile-page">
            <HeaderComCadastro />
            {imageToCrop && (
                <ImageCropper imageSrc={imageToCrop} onCropComplete={handleCropComplete} onClose={() => setImageToCrop(null)} />
            )}
            <main className="page-content">
                <div className="profile-container">
                    {/* Navegação de Abas */}
                    <div className="details-tabs">
                        <button className={`tab-button ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Dados</button>
                        <button className={`tab-button ${activeTab === 'vaccines' ? 'active' : ''}`} onClick={() => setActiveTab('vaccines')}>Carteira de Vacinação</button>
                        <button className={`tab-button ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>Prontuário Médico</button>
                    </div>

                    {/* ABA: DETALHES DO PET */}
                    {activeTab === 'details' && (
                        <>
                            <div className="profile-header">
                                <h1>{isEditing ? `Editando ${petData.name}` : `Detalhes de ${petData.name}`}</h1>
                            </div>
                            <form className="profile-content-column" onSubmit={handleUpdate}>
                                <div className="profile-picture-section">
                                    <div className="profile-picture-container">
                                        <img 
                                            src={isEditing ? imagePreview : petData.imageurl} 
                                            alt={`Foto de ${petData.name}`} 
                                            className="profile-picture" 
                                            onError={(e) => { e.target.onerror = null; e.target.src=profileIcon }} 
                                        />
                                        {isEditing && (
                                            <div className="profile-picture-edit">
                                                <label htmlFor="pet-image-input">
                                                    <FaPencilAlt className="edit-icon" />
                                                </label>
                                                <input id="pet-image-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="profile-info-section">
                                    <div className="profile-row">
                                        <div className="profile-field">
                                            <label>Nome do Pet</label>
                                            {isEditing ? <input type="text" name="name" value={editData.name} onChange={handleInputChange} className="info-field editable" /> : <div className="info-field">{petData.name}</div>}
                                        </div>
                                        <div className="profile-field">
                                            <label>Idade (anos)</label>
                                            {isEditing ? <input type="number" name="age" value={editData.age} onChange={handleInputChange} className="info-field editable" /> : <div className="info-field">{petData.age}</div>}
                                        </div>
                                    </div>
                                    <div className="profile-row">
                                        <div className="profile-field">
                                            <label>Espécie</label>
                                            {isEditing ? (
                                                <select name="speciespet" value={editData.speciespet} onChange={handleInputChange} className="info-field editable">
                                                    {speciesOptions.map(s => <option key={s} value={s}>{formatEnumLabel(s)}</option>)}
                                                </select>
                                            ) : <div className="info-field">{formatEnumLabel(petData.speciespet)}</div>}
                                        </div>
                                        {isEditing ? renderBreedSelector() : (
                                            <div className="profile-field">
                                                <label>Raça</label>
                                                <div className="info-field">{formatEnumLabel(petData.personalizedBreed || petData.dogBreed || petData.catBreed || petData.birdBreed || petData.fishBreed || petData.rodentBreed || petData.reptileBreed || petData.rabbitBreed || 'Não especificada')}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-row">
                                        <div className="profile-field">
                                            <label>Porte</label>
                                            {isEditing ? (
                                                <select name="porte" value={editData.porte} onChange={handleInputChange} className="info-field editable">
                                                    {porteOptions.map(p => <option key={p} value={p}>{formatEnumLabel(p)}</option>)}
                                                </select>
                                            ) : <div className="info-field">{formatEnumLabel(petData.porte)}</div>}
                                        </div>
                                        <div className="profile-field">
                                            <label>Gênero</label>
                                            {isEditing ? (
                                                <select name="gender" value={editData.gender} onChange={handleInputChange} className="info-field editable">
                                                    {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            ) : <div className="info-field">{formatEnumLabel(petData.gender)}</div>}
                                        </div>
                                    </div>
                                    <div className="profile-actions">
                                        {isEditing ? (
                                            <>
                                                <button type="button" className="cancel-button" onClick={handleCancelClick}>Cancelar</button>
                                                <button type="submit" className="save-button" disabled={!hasChanges || isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" className="edit-button" onClick={handleEditClick}>Editar</button>
                                                <button type="button" className="decline-button" onClick={handleDelete}>Remover Pet</button>
                                                <Link to="/pets" className="back-button">Voltar</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ABA: VACINAS */}
                    {activeTab === 'vaccines' && (
                        <div className="vaccines-section">
                            <div className="vaccines-header">
                                <h2>Carteira de Vacinação</h2>
                                {isVet && (
                                    <button className="add-vaccine-btn" onClick={() => setShowVaccineModal(true)}>
                                        <FaPlus /> Registrar Vacina
                                    </button>
                                )}
                            </div>
                            <div className="vaccines-list">
                                {vaccines.length === 0 ? (
                                    <div className="no-data-message" style={{gridColumn: '1 / -1'}}>
                                        <p>Nenhuma vacina registrada para {petData.name}.</p>
                                        {isVet && <small>Clique em "Registrar Vacina" para adicionar a primeira.</small>}
                                    </div>
                                ) : (
                                    // Ordena: Atrasadas primeiro, depois por data
                                    [...vaccines].sort((a, b) => {
                                        const today = new Date();
                                        today.setHours(0,0,0,0);
                                        const nextA = a.nextDoseDate ? new Date(a.nextDoseDate) : null;
                                        const nextB = b.nextDoseDate ? new Date(b.nextDoseDate) : null;
                                        
                                        const isLateA = nextA && nextA < today;
                                        const isLateB = nextB && nextB < today;

                                        if (isLateA && !isLateB) return -1;
                                        if (!isLateA && isLateB) return 1;
                                        return new Date(b.applicationDate) - new Date(a.applicationDate);
                                    }).map(vac => (
                                        <VaccineCard 
                                            key={vac.id} 
                                            vaccine={vac} 
                                            isVet={isVet} 
                                            onDelete={handleDeleteVaccine} 
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ABA: PRONTUÁRIO MÉDICO */}
                    {activeTab === 'records' && (
                        <div className="records-section">
                            {isVet && (
                                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
                                    <Link to={`/vet/consultas?tab=pedidos`} className="add-record-btn">
                                        <FaNotesMedical /> Ir para Consultas (Criar Prontuário)
                                    </Link>
                                </div>
                            )}
                            <div className="timeline">
                                {medicalRecords.length === 0 ? (
                                    <div className="no-data-message">
                                        <p>Nenhum histórico médico encontrado.</p>
                                        <small>Os prontuários são gerados automaticamente após as consultas.</small>
                                    </div>
                                ) : (
                                    medicalRecords.map(record => (
                                        <div key={record.id} className="timeline-item">
                                            <div className="timeline-date">
                                                <span>{new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
                                                <small>{new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                            </div>
                                            <div className="timeline-content">
                                                <h4>Consulta com {record.veterinaryName}</h4>
                                                
                                                <div style={{marginBottom: '10px'}}>
                                                    <p><strong>Diagnóstico:</strong></p>
                                                    <p style={{whiteSpace: 'pre-wrap', color: '#555'}}>{record.diagnosis || 'Não informado.'}</p>
                                                </div>
                                                
                                                <div style={{marginBottom: '10px'}}>
                                                    <p><strong>Tratamento:</strong></p>
                                                    <p style={{whiteSpace: 'pre-wrap', color: '#555'}}>{record.treatment || 'Não informado.'}</p>
                                                </div>

                                                {record.attachments && record.attachments.length > 0 && (
                                                    <div className="attachments-list">
                                                        <h5>Exames e Anexos:</h5>
                                                        {record.attachments.map(att => (
                                                            <a key={att.id || att.fileUrl} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                                                <FaFileMedical /> {att.fileName || 'Documento'}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {record.prescriptions && record.prescriptions.length > 0 && (
                                                    <div className="prescriptions-list">
                                                        <h5>Receituário:</h5>
                                                        <ul>
                                                            {record.prescriptions.map((p, idx) => (
                                                                <li key={idx}>
                                                                    <strong>{p.medicationName}</strong>: {p.dosage} 
                                                                    <br/>
                                                                    <small>({p.frequency} por {p.duration})</small>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showVaccineModal && (
                <AddVaccineModal 
                    petId={petId} 
                    onClose={() => setShowVaccineModal(false)} 
                    onSuccess={fetchVaccines} 
                />
            )}
            
            <Footer />
        </div>
    );
};

export default PetsDetails;