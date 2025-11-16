import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import ImageCropper from '../../../../components/ImageCropper/ImageCropper';
import { FaPencilAlt } from 'react-icons/fa';
import './css/styles.css';

// Enums e Constantes
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

// Função ajudante para obter a chave de raça correta (dogBreed, catBreed, etc.)
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

const AddPet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', age: '', imageurl: 'https://i.imgur.com/2qgrCI2.png',
    speciespet: '', porte: '', gender: '',
    dogBreed: null, catBreed: null, birdBreed: null, fishBreed: null, 
    rodentBreed: null, reptileBreed: null, rabbitBreed: null,
    personalizedBreed: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('https://i.imgur.com/2qgrCI2.png');
  const [imageToCrop, setImageToCrop] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para abrir o cropper quando seleciona uma imagem
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => { setImageToCrop(reader.result); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Callback quando o usuário finaliza o crop
  const handleCropComplete = (croppedFile) => {
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setImageToCrop(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    if (name === 'speciespet') {
        // Resetar todas as raças quando a espécie muda
        updatedData.dogBreed = null;
        updatedData.catBreed = null;
        updatedData.birdBreed = null;
        updatedData.fishBreed = null;
        updatedData.rodentBreed = null;
        updatedData.reptileBreed = null;
        updatedData.rabbitBreed = null;
        updatedData.personalizedBreed = null;
    }
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) { 
      setError("Você precisa estar logado para cadastrar um pet."); 
      return; 
    }
    
    setLoading(true);
    setError('');

    try {
        const { name, age, speciespet, porte, gender, personalizedBreed } = formData;
        const breedKey = getBreedKeyForSpecies(speciespet);
        const selectedBreed = breedKey ? formData[breedKey] : null;

        const dataToSend = {
            name, 
            age: parseInt(age), 
            imageurl: 'https://i.imgur.com/2qgrCI2.png', // Imagem padrão inicial
            speciespet, 
            porte, 
            gender, 
            usuarioId: user.id,
            dogBreed: null, 
            catBreed: null, 
            birdBreed: null, 
            fishBreed: null, 
            rodentBreed: null, 
            reptileBreed: null, 
            rabbitBreed: null,
            personalizedBreed: null
        };

        // Configurar a raça correta
        if (selectedBreed === 'OUTRO') {
            dataToSend.personalizedBreed = personalizedBreed;
        } else if (breedKey && selectedBreed) {
            dataToSend[breedKey] = selectedBreed;
        }
        
        console.log("DADOS FINAIS ENVIADOS PARA A API:", dataToSend);
        
        // Cria o pet primeiro
        const petResponse = await api.post('/pets', dataToSend);
        const petId = petResponse.data.id;

        // Se houver uma imagem, faz o upload depois
        if (imageFile && petId) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', imageFile);
          await api.post(`/upload/pet/${petId}`, uploadFormData);
        }

        alert('Pet cadastrado com sucesso!');
        navigate('/pets');
    } catch (error) {
        console.error("Erro ao cadastrar pet:", error.response?.data || error);
        const errorMsg = error.response?.data?.message || error.message || "Falha ao cadastrar o pet. Verifique os dados e tente novamente.";
        setError(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  const renderBreedSelector = () => {
    const selectedSpecies = formData.speciespet;
    if (!selectedSpecies || !breedOptions[selectedSpecies] || selectedSpecies === 'OUTROS') {
      return (
        <div className="form-group">
            <label htmlFor="personalizedBreed">Raça</label>
            <input 
              type="text" 
              id="personalizedBreed" 
              name="personalizedBreed" 
              placeholder="Especifique a raça" 
              required 
              onChange={handleChange} 
              value={formData.personalizedBreed || ''}
            />
        </div>
      );
    }

    const breedKey = getBreedKeyForSpecies(selectedSpecies);
    const currentBreedValue = formData[breedKey];

    return (
        <>
            <div className="form-group">
                <label htmlFor={breedKey}>Raça</label>
                <select 
                  id={breedKey} 
                  name={breedKey} 
                  required 
                  onChange={handleChange} 
                  value={currentBreedValue || ''}
                >
                    <option value="">Selecione a raça</option>
                    {breedOptions[selectedSpecies].map(breed => (
                        <option key={breed} value={breed}>
                            {breed.replace(/_/g, ' ').charAt(0) + breed.replace(/_/g, ' ').slice(1).toLowerCase()}
                        </option>
                    ))}
                </select>
            </div>
            {currentBreedValue === 'OUTRO' && (
                <div className="form-group">
                    <label htmlFor="personalizedBreed">Especifique a Raça</label>
                    <input 
                      type="text" 
                      id="personalizedBreed" 
                      name="personalizedBreed" 
                      placeholder="Digite o nome da raça" 
                      required 
                      onChange={handleChange}
                      value={formData.personalizedBreed || ''}
                    />
                </div>
            )}
        </>
    );
  };

  return (
    <div className="add-pet-page">
      <HeaderComCadastro />
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={() => setImageToCrop(null)}
        />
      )}
      <h1 className="welcome-title">Cadastre seu novo amigo</h1>
      <div className="add-pet-wrapper">
        <div className="add-pet-container">
          <form onSubmit={handleSubmit} className="pet-form">
            {error && <p className="error-message">{error}</p>}
            
            {/* Upload Circular - Estilo do perfil */}
            <div className="avatar-upload">
              <div className="profile-picture-container">
                <img 
                  src={imagePreview} 
                  alt="Preview do pet" 
                  className="profile-picture" 
                  onError={(e) => { e.target.onerror = null; e.target.src='https://i.imgur.com/2qgrCI2.png' }}
                />
                <div className="profile-picture-edit">
                  <label htmlFor="avatar-input">
                    <FaPencilAlt className="edit-icon" />
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  onChange={handleChange} 
                  value={formData.name}
                  placeholder="Digite o nome do pet"
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Idade (anos)</label>
                <input 
                  type="number" 
                  id="age" 
                  name="age" 
                  required 
                  onChange={handleChange} 
                  min="0" 
                  max="50"
                  value={formData.age}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="speciespet">Espécie</label>
                <select 
                  id="speciespet" 
                  name="speciespet" 
                  required 
                  onChange={handleChange} 
                  value={formData.speciespet}
                >
                  <option value="">Selecione a espécie</option>
                  {speciesOptions.map(specie => (
                    <option key={specie} value={specie}>
                      {specie.charAt(0) + specie.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              {renderBreedSelector()}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="porte">Porte</label>
                <select 
                  id="porte" 
                  name="porte" 
                  required 
                  onChange={handleChange} 
                  value={formData.porte}
                >
                    <option value="">Selecione o porte</option>
                    {porteOptions.map(p => (
                      <option key={p} value={p}>
                        {p.charAt(0) + p.slice(1).toLowerCase()}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gênero</label>
                <select 
                  id="gender" 
                  name="gender" 
                  required 
                  onChange={handleChange} 
                  value={formData.gender}
                >
                    <option value="">Selecione o gênero</option>
                    {genderOptions.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Pet'
                )}
              </button>
              <Link to="/pets" className="cancel-button">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddPet;