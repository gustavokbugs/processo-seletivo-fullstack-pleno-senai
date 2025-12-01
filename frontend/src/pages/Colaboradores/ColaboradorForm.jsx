import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colaboradorService, cargoService, funcaoService } from '../../services/index.js';
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const ColaboradorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargos, setCargos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [cpfBlocked, setCpfBlocked] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [quadroHorarios, setQuadroHorarios] = useState([
    { diaSemana: 'SEGUNDA', primeiraEntrada: '', primeiraSaida: '', segundaEntrada: '', segundaSaida: '', totalHoras: 0 },
    { diaSemana: 'TERCA', primeiraEntrada: '', primeiraSaida: '', segundaEntrada: '', segundaSaida: '', totalHoras: 0 },
    { diaSemana: 'QUARTA', primeiraEntrada: '', primeiraSaida: '', segundaEntrada: '', segundaSaida: '', totalHoras: 0 },
    { diaSemana: 'QUINTA', primeiraEntrada: '', primeiraSaida: '', segundaEntrada: '', segundaSaida: '', totalHoras: 0 },
    { diaSemana: 'SEXTA', primeiraEntrada: '', primeiraSaida: '', segundaEntrada: '', segundaSaida: '', totalHoras: 0 },
    { diaSemana: 'SABADO', primeiraEntrada: '', primeiraSaida: '', segundaEntrada: '', segundaSaida: '', totalHoras: 0 },
    { diaSemana: 'DOMINGO', primeiraEntrada: '', primeiraSaida: '', segundaEntrada: '', segundaSaida: '', totalHoras: 0 }
  ]);

  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    email: '',
    cargoId: '',
    funcaoId: '',
    dataAdmissao: '',
    dataRescisao: '',
    ativo: true
  });

  useEffect(() => {
    loadOptions();
    if (isEdit) {
      loadColaborador();
    }
  }, [id]);

  const loadOptions = async () => {
    try {
      const [cargosData, funcoesData] = await Promise.all([
        cargoService.getAll(),
        funcaoService.getAll()
      ]);
      setCargos(cargosData);
      setFuncoes(funcoesData);
    } catch (err) {
      setError('Erro ao carregar opções');
    }
  };

  const loadColaborador = async () => {
    try {
      setLoading(true);
      const data = await colaboradorService.getById(id);
      setFormData({
        cpf: data.cpf,
        nome: data.nome,
        email: data.email,
        cargoId: data.cargoId || '',
        funcaoId: data.funcaoId || '',
        dataAdmissao: data.dataAdmissao?.split('T')[0] || '',
        dataRescisao: data.dataRescisao?.split('T')[0] || '',
        ativo: data.ativo
      });
      setCpfBlocked(true);
      if (data.usuario) {
        setGeneratedUsername(data.usuario.usuario);
      }
      
      if (data.quadroHorarios && data.quadroHorarios.length > 0) {
        const horarios = quadroHorarios.map(dia => {
          const horarioExistente = data.quadroHorarios.find(h => h.diaSemana === dia.diaSemana);
          return horarioExistente || dia;
        });
        setQuadroHorarios(horarios);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar colaborador');
    } finally {
      setLoading(false);
    }
  };

  const formatCpf = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const validateName = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length < 2) {
      return 'Nome deve conter nome e sobrenome';
    }
    
    const firstChar = name.charAt(0);
    if (firstChar !== firstChar.toUpperCase()) {
      return 'Nome deve começar com letra maiúscula';
    }
    
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'E-mail inválido';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue = value;
    
    if (name === 'cpf') {
      finalValue = formatCpf(value);
    }
    
    let ativoCalculado = formData.ativo;
    if (name === 'dataRescisao') {
      ativoCalculado = !value || new Date(value) > new Date();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue,
      ...(name === 'dataRescisao' && { ativo: ativoCalculado })
    }));

    if (name === 'nome' && value.includes(' ')) {
      generateUsername(value);
      const nameError = validateName(value);
      if (nameError) {
        setError(nameError);
      } else {
        setError('');
      }
    }

    if (name === 'email') {
      const emailError = validateEmail(value);
      if (emailError) {
        setError(emailError);
      } else {
        setError('');
      }
    }

    if (name === 'dataRescisao' && formData.dataAdmissao && value) {
      if (new Date(value) < new Date(formData.dataAdmissao)) {
        setError('Data de rescisão não pode ser anterior à data de admissão');
      } else {
        setError('');
      }
    }
  };

  const generateUsername = (nome) => {
    const parts = nome.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      const username = `${parts[0].toLowerCase()}_${parts[parts.length - 1].toLowerCase()}`;
      setGeneratedUsername(username);
    }
  };

  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateTotalHoras = (primeiraEntrada, primeiraSaida, segundaEntrada, segundaSaida) => {
    let total = 0;
    
    if (primeiraEntrada && primeiraSaida) {
      const entrada1 = timeToMinutes(primeiraEntrada);
      const saida1 = timeToMinutes(primeiraSaida);
      total += (saida1 - entrada1) / 60;
    }
    
    if (segundaEntrada && segundaSaida) {
      const entrada2 = timeToMinutes(segundaEntrada);
      const saida2 = timeToMinutes(segundaSaida);
      total += (saida2 - entrada2) / 60;
    }
    
    return Math.max(0, total);
  };

  const validateHorarios = (dia, campo, valor) => {
    const entrada1 = campo === 'primeiraEntrada' ? timeToMinutes(valor) : timeToMinutes(dia.primeiraEntrada);
    const saida1 = campo === 'primeiraSaida' ? timeToMinutes(valor) : timeToMinutes(dia.primeiraSaida);
    const entrada2 = campo === 'segundaEntrada' ? timeToMinutes(valor) : timeToMinutes(dia.segundaEntrada);
    const saida2 = campo === 'segundaSaida' ? timeToMinutes(valor) : timeToMinutes(dia.segundaSaida);

    if (campo === 'primeiraEntrada' && dia.primeiraSaida && entrada1 >= saida1) {
      return 'Primeira entrada não pode ser maior ou igual à primeira saída';
    }

    if (campo === 'primeiraSaida' && dia.primeiraEntrada && saida1 <= entrada1) {
      return 'Primeira saída não pode ser menor ou igual à primeira entrada';
    }

    if (campo === 'segundaEntrada' && dia.primeiraSaida) {
      const intervalo = (entrada2 - saida1) / 60;
      if (intervalo < 1) {
        return 'Intervalo entre primeira saída e segunda entrada deve ser de no mínimo 1 hora';
      }
    }

    if (campo === 'primeiraSaida' && dia.segundaEntrada) {
      const intervalo = (entrada2 - saida1) / 60;
      if (intervalo < 1) {
        return 'Intervalo entre primeira saída e segunda entrada deve ser de no mínimo 1 hora';
      }
    }

    if (campo === 'segundaEntrada' && dia.segundaSaida && entrada2 >= saida2) {
      return 'Segunda entrada não pode ser maior ou igual à segunda saída';
    }

    if (campo === 'segundaSaida' && dia.segundaEntrada && saida2 <= entrada2) {
      return 'Segunda saída não pode ser menor ou igual à segunda entrada';
    }

    return '';
  };

  const handleHorarioChange = (index, campo, valor) => {
    const novosHorarios = [...quadroHorarios];
    const dia = novosHorarios[index];
    
    const erro = validateHorarios(dia, campo, valor);
    if (erro) {
      setError(erro);
      return;
    }
    
    setError('');
    dia[campo] = valor;
    
    dia.totalHoras = calculateTotalHoras(
      dia.primeiraEntrada,
      dia.primeiraSaida,
      dia.segundaEntrada,
      dia.segundaSaida
    );
    
    setQuadroHorarios(novosHorarios);
  };

  const handleCpfBlur = async () => {
    if (!isEdit && formData.cpf) {
      const cpfNumeros = formData.cpf.replace(/\D/g, '');
      if (cpfNumeros.length === 11) {
        try {
          const result = await colaboradorService.checkCpf(cpfNumeros);
          if (!result.disponivel) {
            setError('CPF já cadastrado');
            setCpfBlocked(true);
          } else {
            setCpfBlocked(false);
            if (!error.includes('Nome') && !error.includes('E-mail') && !error.includes('Data')) {
              setError('');
            }
          }
        } catch (err) {
          setError('Erro ao verificar CPF');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nameError = validateName(formData.nome);
    if (nameError) {
      setError(nameError);
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (formData.dataRescisao && formData.dataAdmissao) {
      if (new Date(formData.dataRescisao) < new Date(formData.dataAdmissao)) {
        setError('Data de rescisão não pode ser anterior à data de admissão');
        return;
      }
    }

    const totalHorasSemana = quadroHorarios.reduce((total, dia) => total + dia.totalHoras, 0);
    if (totalHorasSemana > 44) {
      setError(`Total de horas semanais não pode exceder 44 horas (atual: ${totalHorasSemana.toFixed(2)}h)`);
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        cargoId: parseInt(formData.cargoId),
        funcaoId: parseInt(formData.funcaoId),
        quadroHorarios: quadroHorarios.filter(dia => 
          dia.primeiraEntrada && dia.primeiraSaida
        )
      };

      if (!dataToSend.dataAdmissao || dataToSend.dataAdmissao === '') {
        delete dataToSend.dataAdmissao;
      }
      if (!dataToSend.dataRescisao || dataToSend.dataRescisao === '') {
        delete dataToSend.dataRescisao;
      }

      if (isEdit) {
        await colaboradorService.update(id, dataToSend);
        setSuccess('Colaborador atualizado com sucesso!');
      } else {
        await colaboradorService.create(dataToSend);
        setSuccess('Colaborador criado com sucesso!');
      }

      setTimeout(() => navigate('/colaboradores'), 1500);
    } catch (err) {
      setError(err.message || 'Erro ao salvar colaborador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/colaboradores')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados do colaborador
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cpf" className="label">
              CPF *
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              value={formData.cpf}
              onChange={handleChange}
              onBlur={handleCpfBlur}
              className="input-field"
              placeholder="000.000.000-00"
              maxLength={14}
              required
              disabled={isEdit}
            />
          </div>

          <div>
            <label htmlFor="nome" className="label">
              Nome *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              className="input-field"
              placeholder="Nome Sobrenome"
              required
              disabled={cpfBlocked && !isEdit}
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              E-mail *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="email@exemplo.com"
              required
              disabled={cpfBlocked && !isEdit}
            />
          </div>

          <div>
            <label htmlFor="cargoId" className="label">
              Cargo *
            </label>
            <select
              id="cargoId"
              name="cargoId"
              value={formData.cargoId}
              onChange={handleChange}
              className="input-field"
              required
              disabled={cpfBlocked && !isEdit}
            >
              <option value="">Selecione um cargo</option>
              {cargos.map(cargo => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="funcaoId" className="label">
              Função *
            </label>
            <select
              id="funcaoId"
              name="funcaoId"
              value={formData.funcaoId}
              onChange={handleChange}
              className="input-field"
              required
              disabled={cpfBlocked && !isEdit}
            >
              <option value="">Selecione uma função</option>
              {funcoes.map(funcao => (
                <option key={funcao.id} value={funcao.id}>
                  {funcao.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dataAdmissao" className="label">
              Data de Admissão *
            </label>
            <input
              id="dataAdmissao"
              name="dataAdmissao"
              type="date"
              value={formData.dataAdmissao}
              onChange={handleChange}
              className="input-field"
              required
              disabled={cpfBlocked && !isEdit}
            />
          </div>

          <div>
            <label htmlFor="dataRescisao" className="label">
              Data de Rescisão
            </label>
            <input
              id="dataRescisao"
              name="dataRescisao"
              type="date"
              value={formData.dataRescisao}
              onChange={handleChange}
              className="input-field"
              disabled={cpfBlocked && !isEdit}
            />
          </div>

          {generatedUsername && (
            <div>
              <label htmlFor="usuario" className="label">
                Usuário (gerado automaticamente)
              </label>
              <input
                id="usuario"
                type="text"
                value={generatedUsername}
                className="input-field"
                disabled
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="ativo"
            name="ativo"
            type="checkbox"
            checked={formData.ativo}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            disabled
          />
          <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
            Ativo? 
            <span className="text-xs text-gray-500 ml-2">
              (calculado automaticamente: marcado se sem data de rescisão ou rescisão futura)
            </span>
          </label>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quadro de Horários</h2>
          <p className="text-sm text-gray-600 mb-4">
            Defina os horários de trabalho para cada dia da semana. Deixe em branco os dias sem expediente.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dia da Semana
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1ª Entrada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1ª Saída
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2ª Entrada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2ª Saída
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Horas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quadroHorarios.map((dia, index) => (
                  <tr key={dia.diaSemana}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dia.diaSemana}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={dia.primeiraEntrada}
                        onChange={(e) => handleHorarioChange(index, 'primeiraEntrada', e.target.value)}
                        className="input-field text-sm"
                        disabled={cpfBlocked && !isEdit}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={dia.primeiraSaida}
                        onChange={(e) => handleHorarioChange(index, 'primeiraSaida', e.target.value)}
                        className="input-field text-sm"
                        disabled={cpfBlocked && !isEdit}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={dia.segundaEntrada}
                        onChange={(e) => handleHorarioChange(index, 'segundaEntrada', e.target.value)}
                        className="input-field text-sm"
                        disabled={cpfBlocked && !isEdit}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        value={dia.segundaSaida}
                        onChange={(e) => handleHorarioChange(index, 'segundaSaida', e.target.value)}
                        className="input-field text-sm"
                        disabled={cpfBlocked && !isEdit}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {dia.totalHoras.toFixed(2)}h
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="5" className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                    Total Semanal:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {quadroHorarios.reduce((total, dia) => total + dia.totalHoras, 0).toFixed(2)}h
                    {quadroHorarios.reduce((total, dia) => total + dia.totalHoras, 0) > 44 && (
                      <span className="ml-2 text-red-600 text-xs">(Excede 44h)</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/colaboradores')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading || (cpfBlocked && !isEdit)}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ColaboradorForm;
