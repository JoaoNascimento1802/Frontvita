// src/pages/User/Consultations/AgendarServico.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderComCadastro from '../../../../components/HeaderComCadastro';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../services/api';
import '../css/styles.css'; // Reutiliza o CSS de agendamento
import { toast } from 'react-toastify';

const AgendarServico = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  const [formData, setFormData] = useState({
    petId: '',
    employeeId: '',
    clinicServiceId: '',
    scheduleDate: '',
    scheduleTime: '',
    observations: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // 1. Busca Pets, Funcionários e Serviços (não-médicos)
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          setError('');
          const [petsResponse, servicesResponse, employeesResponse] = await Promise.all([
            api.get('/pets/my-pets'),
            api.get('/api/public/services'),
            api.get('/api/employee/all') 
          ]);

          setPets(petsResponse.data || []);
          
          // Filtra serviços para mostrar APENAS não-médicos (Estética)
          const nonMedicalServices = servicesResponse.data.filter(s => s.medicalService === false);
          setAllServices(nonMedicalServices || []);

          setEmployees(employeesResponse.data || []);
          
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

  // 2. Busca horários disponíveis do funcionário
  const fetchAvailableTimes = useCallback(async () => {
    if (formData.employeeId && formData.scheduleDate) {
      try {
        const response = await api.get(`/api/service-schedules/employee/${formData.employeeId}/available-slots`, {
          params: { date: formData.scheduleDate }
        });
        
        const formattedTimes = response.data.map(time => time.substring(0, 5));
        setAvailableTimes(formattedTimes || []);
        
      } catch (error) {
        console.error("Erro ao buscar horários", error);
        setAvailableTimes([]);
      }
    }
  }, [formData.employeeId, formData.scheduleDate]);

  useEffect(() => {
    fetchAvailableTimes();
  }, [fetchAvailableTimes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    // Se mudar funcionário ou data, reseta a hora
    if (name === 'employeeId' || name === 'scheduleDate') {
      updatedFormData.scheduleTime = '';
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData = {
        petId: parseInt(formData.petId),
        employeeId: parseInt(formData.employeeId),
        clinicServiceId: parseInt(formData.clinicServiceId),
        scheduleDate: formData.scheduleDate,
        scheduleTime: formData.scheduleTime,
        observations: formData.observations || 'Nenhuma observação.',
        // Status PENDENTE é definido pelo backend
      };

      await api.post('/api/service-schedules', requestData);
      toast.success('Solicitação de serviço enviada com sucesso!');
      navigate('/consultas?tab=pendentes'); // Redireciona para a aba de pendentes (embora seja consulta)

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erro ao agendar serviço. Verifique os dados.";
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
      <h1 className="welcome-title">Agende um Serviço (Estética)</h1>
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
                <label htmlFor="clinicServiceId">Serviço Desejado</label>
                <select id="clinicServiceId" name="clinicServiceId" value={formData.clinicServiceId} onChange={handleChange} required>
                  <option value="">Selecione um serviço</option>
                  {allServices.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="employeeId">Profissional</label>
                <select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required>
                  <option value="">Selecione um profissional</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.username}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="scheduleDate">Data</label>
                <input type="date" id="scheduleDate" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} required min={today} disabled={!formData.employeeId} />
              </div>
              <div className="form-group">
                <label htmlFor="scheduleTime">Hora</label>
                <select id="scheduleTime" name="scheduleTime" value={formData.scheduleTime} onChange={handleChange} required disabled={!formData.employeeId || !formData.scheduleDate}>
                  <option value="">Selecione um horário</option>
                  {availableTimes.length > 0 ? (
                    availableTimes.map(time => <option key={time} value={time}>{time}</option>)
                  ) : (
                    <option disabled>{formData.scheduleDate ? "Nenhum horário disponível" : "Selecione uma data"}</option>
                  )}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="observations">Observações Adicionais</label>
              <textarea id="observations" name="observations" value={formData.observations} onChange={handleChange} rows="3" placeholder="Ex: Meu pet fica ansioso com secador."></textarea>
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

export default AgendarServico;