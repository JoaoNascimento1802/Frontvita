// src/pages/User/Consultations/ScheduleAppointment.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import '../css/styles.css';
import { toast } from 'react-toastify'; 

const specialityOptions = [
  "CLINICO_GERAL", "ANESTESIOLOGIA", "CARDIOLOGIA", "DERMATOLOGIA", "ENDOCRINOLOGIA", 
  "GASTROENTEROLOGIA", "NEUROLOGIA", "NUTRICAO", "OFTALMOLOGIA", "ONCOLOGIA", 
  "ORTOPEDIA", "REPRODUCAO_ANIMAL", "PATOLOGIA", "CIRURGIA_GERAL", "CIRURGIA_ORTOPEDICA", 
  "ODONTOLOGIA", "ZOOTECNIA", "EXOTICOS", "ACUPUNTURA", "FISIOTERAPIA", "IMAGINOLOGIA"
];

const ScheduleAppointment = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [allVets, setAllVets] = useState([]); 
  const [allMedicalServices, setAllMedicalServices] = useState([]);
  
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  
  const [availableTimes, setAvailableTimes] = useState([]);
  
  const [formData, setFormData] = useState({
    petId: '',
    veterinarioId: '',
    clinicServiceId: '', 
    specialityEnum: '', // Campo para controlar o filtro principal
    consultationdate: '',
    consultationtime: '',
    reason: '',
    observations: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          setError('');
          const [petsResponse, vetsResponse, servicesResponse] = await Promise.all([
            api.get('/pets/my-pets'),
            api.get('/veterinary/search'), // Busca todos os vets
            api.get('/api/public/services') 
          ]);

          setPets(petsResponse.data || []);
          
          // --- CORREÇÃO APLICADA AQUI ---
          // A API retorna um array (response.data), 
          // não um objeto (response.data.content)
          setAllVets(vetsResponse.data || []);
          // --- FIM DA CORREÇÃO ---
          
          const medServices = servicesResponse.data.filter(s => s.medicalService === true);
          setAllMedicalServices(medServices || []);

          setAvailableSpecialties(specialityOptions);
          
        } catch (error) {
          console.error("Erro ao buscar dados para agendamento:", error);
          setError("Não foi possível carregar os dados necessários para o agendamento.");
          toast.error("Erro ao carregar dados. Tente recarregar.");
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  const fetchAvailableTimes = useCallback(async () => {
    if (formData.veterinarioId && formData.consultationdate) {
      try {
        const response = await api.get(`/veterinary/${formData.veterinarioId}/available-slots`, {
          params: { date: formData.consultationdate }
        });
        
        const formattedTimes = response.data.map(time => time.substring(0, 5));
        setAvailableTimes(formattedTimes || []);
        
      } catch (error) {
        console.error("Erro ao buscar horários", error);
        setAvailableTimes([]);
      }
    }
  }, [formData.veterinarioId, formData.consultationdate]);

  useEffect(() => {
    fetchAvailableTimes();
  }, [fetchAvailableTimes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'specialityEnum') {
      const specialty = value;

      if (specialty) {
        // Filtra veterinários por essa especialidade
        const vetsWithSpecialty = allVets.filter(vet => vet.specialityenum === specialty);
        setFilteredVets(vetsWithSpecialty);

        // Filtra serviços por essa especialidade
        const servicesWithSpecialty = allMedicalServices.filter(s => s.speciality === specialty);
        setFilteredServices(servicesWithSpecialty);

      } else {
        setFilteredVets([]);
        setFilteredServices([]);
      }
      
      updatedFormData.veterinarioId = '';
      updatedFormData.clinicServiceId = ''; 
      updatedFormData.consultationdate = '';
      updatedFormData.consultationtime = '';
      setAvailableTimes([]);
    }
    
    if (name === 'veterinarioId' || name === 'consultationdate') {
      updatedFormData.consultationtime = ''; 
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData = {
        petId: parseInt(formData.petId),
        veterinarioId: parseInt(formData.veterinarioId),
        usuarioId: user.id,
        clinicServiceId: parseInt(formData.clinicServiceId), 
        consultationdate: formData.consultationdate,
        consultationtime: formData.consultationtime, 
        reason: formData.reason,
        observations: formData.observations || 'Nenhuma observação.',
        status: 'PENDENTE'
      };
      
      await api.post('/consultas', requestData);
      toast.success('Solicitação de consulta enviada com sucesso!');
      navigate('/consultas');

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erro ao agendar consulta. Verifique os dados.";
      toast.error(errorMsg);
      console.error(error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return <p style={{paddingTop: '150px', textAlign: 'center'}}>Verificando autenticação...</p>;
  }

  return (
    <div className="add-pet-page">
      <HeaderComCadastro />
      <h1 className="welcome-title">Agende uma Consulta (Veterinário)</h1>
      <div className="add-pet-wrapper">
        <div className="add-pet-container">
          <form onSubmit={handleSubmit} className="pet-form">
            {error && <p className="error-message">{error}</p>}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="petId">Selecione seu Pet</label>
                <select id="petId" name="petId" value={formData.petId} onChange={handleChange} required>
                  <option value="">Selecione um pet</option>
                  {pets.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="specialityEnum">Especialidade Desejada</label>
                <select id="specialityEnum" name="specialityEnum" value={formData.specialityEnum} onChange={handleChange} required>
                  <option value="">Selecione uma especialidade</option>
                  {availableSpecialties.map(spec => (
                    <option key={spec} value={spec}>{spec.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="veterinarioId">Veterinário</label>
                <select id="veterinarioId" name="veterinarioId" value={formData.veterinarioId} onChange={handleChange} required disabled={!formData.specialityEnum}>
                  <option value="">{formData.specialityEnum ? 'Selecione um veterinário' : 'Selecione uma especialidade primeiro'}</option>
                  {filteredVets.map(vet => <option key={vet.id} value={vet.id}>{vet.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="clinicServiceId">Tipo de Serviço</label>
                <select id="clinicServiceId" name="clinicServiceId" value={formData.clinicServiceId} onChange={handleChange} required disabled={!formData.specialityEnum}>
                  <option value="">{formData.specialityEnum ? 'Selecione um serviço' : 'Selecione uma especialidade primeiro'}</option>
                  {filteredServices.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="consultationdate">Data</label>
                <input type="date" id="consultationdate" name="consultationdate" value={formData.consultationdate} onChange={handleChange} required min={today} disabled={!formData.veterinarioId} />
              </div>
              <div className="form-group">
                <label htmlFor="consultationtime">Hora</label>
                <select id="consultationtime" name="consultationtime" value={formData.consultationtime} onChange={handleChange} required disabled={!formData.veterinarioId || !formData.consultationdate}>
                  <option value="">Selecione um horário</option>
                  {availableTimes.length > 0 ? (
                    availableTimes.map(time => <option key={time} value={time}>{time}</option>)
                  ) : (
                    <option disabled>{formData.consultationdate ? "Nenhum horário disponível" : "Selecione uma data"}</option>
                  )}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="reason">Motivo da Consulta (mín. 5 caracteres)</label>
              <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows="3" required minLength="5"></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="observations">Observações Adicionais</label>
              <textarea id="observations" name="observations" value={formData.observations} onChange={handleChange} rows="3"></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>Enviar Solicitação</button>
              <Link to="/agendar-escolha" className="cancel-button" style={{backgroundColor: '#FF0000', color: 'white'}}>Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScheduleAppointment;