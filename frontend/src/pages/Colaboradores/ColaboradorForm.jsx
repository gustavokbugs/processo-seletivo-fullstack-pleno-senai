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
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue
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

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        cargoId: parseInt(formData.cargoId),
        funcaoId: parseInt(formData.funcaoId)
      };

      // Remove campos de data vazios (strings vazias devem ser undefined ou não enviadas)
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
          </label>
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
