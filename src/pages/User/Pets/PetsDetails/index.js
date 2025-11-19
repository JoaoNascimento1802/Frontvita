// src/pages/User/Pets/PetsDetails.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import ImageCropper from '../../../../components/ImageCropper/ImageCropper'; // Importar Cropper
import { FaPencilAlt } from 'react-icons/fa'; // Importar Ícone
import profileIcon from '../../../../assets/images/Header/perfilIcon.png'; // Importar ícone padrão
import './css/styles.css';
import { formatEnumLabel } from '../../../../utils/format';

// Enums e Constantes
const speciesOptions = [ "CACHORRO", "GATO", "PASSARO", "PEIXE", "ROEDOR", "REPTIL", "COELHO", "OUTROS" ];
const porteOptions = ["PEQUENO", "MEDIO", "GRANDE"];
const genderOptions = ["Macho", "Femea"];
const breedOptions = {
    CACHORRO: ["LABRADOR_RETRIEVER", "GOLDEN_RETRIEVER", "BULLDOG_FRANCES", "PASTOR_ALEMAO", "POODLE", "BEAGLE", "ROTTWEILER", "DACHSHUND", "SHIH_TZU", "OUTRO"],
    GATO: ["PERSA", "SIAMES", "MAINE_COON", "RAGDOLL", "BENGAL", "SPHYNX", "BRITISH_SHORTHAIR", "SCOTTISH_FOLD", "OUTRO"],
    // ...
};

// Função ajudante para obter a chave de raça correta
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

    const [petData, setPetData] = useState(null);
    const [editData, setEditData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NOVOS ESTADOS PARA EDIÇÃO DE IMAGEM ---
    const [isSaving, setIsSaving] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(profileIcon);
    const [hasChanges, setHasChanges] = useState(false); // Rastreia mudanças

    useEffect(() => {
        const fetchPetDetails = async () => {
            if (!petId) return;
            setLoading(true);
            try {
                const response = await api.get(`/pets/${petId}`);
                setPetData(response.data);
                setEditData(response.data);
                setImagePreview(response.data.imageurl || profileIcon); // Define a preview inicial
            } catch (err) {
                setError('Não foi possível carregar os dados do pet.');
            } finally {
                setLoading(false);
            }
        };
        fetchPetDetails();
    }, [petId]);

    // --- NOVAS FUNÇÕES PARA IMAGEM ---
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
        setHasChanges(true); // Marca que houve mudança
    };
    // ---------------------------------

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
        setHasChanges(true); // Marca que houve mudança
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true); // Inicia o loading do botão salvar
        try {
            const { name, age, speciespet, porte, gender, personalizedBreed } = editData;
            const breedKey = getBreedKeyForSpecies(speciespet);
            const selectedBreed = breedKey ? editData[breedKey] : null;

            const dataToSend = {
                name, age: parseInt(age), 
                imageurl: petData.imageurl, // Mantém a imagem antiga por padrão
                speciespet, porte, gender, usuarioId: user.id,
                dogBreed: null, catBreed: null, birdBreed: null, fishBreed: null, 
                rodentBreed: null, reptileBreed: null, rabbitBreed: null,
                personalizedBreed: null,
            };

            if (selectedBreed === 'OUTRO') {
                dataToSend.personalizedBreed = personalizedBreed;
            } else if (breedKey && selectedBreed) {
                dataToSend[breedKey] = selectedBreed;
            }

            // 1. Atualiza os dados do pet (texto)
            const response = await api.put(`/pets/${petId}`, dataToSend);
            
            // 2. Se uma nova imagem foi selecionada, faz o upload
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);
                await api.post(`/upload/pet/${petId}`, uploadFormData);
            }

            // 3. Atualiza os dados locais
            setPetData(response.data);
            setIsEditing(false);
            setHasChanges(false);
            setImageFile(null);
            alert('Dados do pet atualizados com sucesso!');
            
            // Recarrega os dados para pegar a URL da imagem atualizada do Cloudinary
            const updatedPet = await api.get(`/pets/${petId}`);
            setPetData(updatedPet.data);
            setEditData(updatedPet.data);
            setImagePreview(updatedPet.data.imageurl || profileIcon);

        } catch (err) {
            alert('Erro ao salvar as alterações.');
        } finally {
            setIsSaving(false); // Termina o loading do botão salvar
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
        setHasChanges(false); // Reseta o 'hasChanges' ao entrar no modo de edição
    };

    const handleCancelClick = (event) => {
        event.preventDefault();
        setIsEditing(false);
        setEditData(petData);
        setImagePreview(petData.imageurl || profileIcon); // Restaura a imagem original
        setImageFile(null);
        setImageToCrop(null);
    };

    const renderBreedSelector = () => {
        const selectedSpecies = editData.speciespet;
        const breedKey = getBreedKeyForSpecies(selectedSpecies);
        
        if (!selectedSpecies || !breedOptions[selectedSpecies] || selectedSpecies === 'OUTROS') {
             return (
                <div className="profile-field">
                    <label>Raça</label>
                    <input type="text" name="personalizedBreed" value={editData.personalizedBreed || ''} onChange={handleInputChange} className="info-field editable" />
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
            
            {/* Componente Cropper (só aparece quando imageToCrop tem valor) */}
            {imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onClose={() => setImageToCrop(null)}
                />
            )}

            <main className="page-content">
                <div className="profile-container">
                     <div className="profile-header">
                        <h1>{isEditing ? `Editando ${petData.name}` : `Detalhes de ${petData.name}`}</h1>
                    </div>
                     <form className="profile-content-column" onSubmit={handleUpdate}>
                        
                        {/* --- SEÇÃO DA FOTO (COM LÓGICA DE EDIÇÃO) --- */}
                        <div className="profile-picture-section">
                            <div className="profile-picture-container">
                                <img 
                                    src={isEditing ? imagePreview : petData.imageurl} // Mostra o preview se estiver editando
                                    alt={`Foto de ${petData.name}`} 
                                    className="profile-picture" 
                                    onError={(e) => { e.target.onerror = null; e.target.src=profileIcon }}
                                />
                                {isEditing && (
                                    <div className="profile-picture-edit">
                                        <label htmlFor="pet-image-input">
                                            <FaPencilAlt className="edit-icon" />
                                        </label>
                                        <input 
                                            id="pet-image-input" 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                            style={{ display: 'none' }} 
                                        />
                                    </div>
                                )}
                            </div>
                         </div>
                         {/* --- FIM DA SEÇÃO DA FOTO --- */}

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
                                         <div className="info-field">
                                            {formatEnumLabel(
                                                petData.personalizedBreed || 
                                                petData.dogBreed || 
                                                petData.catBreed || 
                                                petData.birdBreed || 
                                                petData.fishBreed || 
                                                petData.rodentBreed || 
                                                petData.reptileBreed || 
                                                petData.rabbitBreed || 
                                                'Não especificada'
                                            )}
                                         </div>
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
                                         <button type="submit" className="save-button" disabled={!hasChanges || isSaving}>
                                            {isSaving ? 'Salvando...' : 'Salvar'}
                                         </button>
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
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PetsDetails;