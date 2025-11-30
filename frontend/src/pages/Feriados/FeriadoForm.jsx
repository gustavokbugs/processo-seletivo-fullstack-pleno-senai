import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feriadoService } from '../../services/index.js';
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const FeriadoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingDates, setExistingDates] = useState([]);

  const [formData, setFormData] = useState({
    nome: '',
    data: '',
    recorrente: false
  });

  useEffect(() => {
    loadExistingDates();
    if (isEdit) {
      loadFeriado();
    }
  }, [id]);

  const loadExistingDates = async () => {
    try {
      const data = await feriadoService.getAll();
      setExistingDates(data.map(f => f.data.split('T')[0]));
    } catch (err) {
      console.error('Erro ao carregar feriados existentes:', err);
    }
  };

  const loadFeriado = async () => {
    try {
      setLoading(true);
      const data = await feriadoService.getById(id);
      setFormData({
        nome: data.nome,
        data: data.data.split('T')[0],
        recorrente: data.recorrente || false
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar feriado');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'data' && !isEdit) {
      if (existingDates.includes(value)) {
        setError('Já existe um feriado cadastrado nesta data');
      } else {
        setError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isEdit && existingDates.includes(formData.data)) {
      setError('Já existe um feriado cadastrado nesta data');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await feriadoService.update(id, formData);
        setSuccess('Feriado atualizado com sucesso!');
      } else {
        await feriadoService.create(formData);
        setSuccess('Feriado criado com sucesso!');
      }

      setTimeout(() => navigate('/feriados'), 1500);
    } catch (err) {
      setError(err.message || 'Erro ao salvar feriado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/feriados')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Feriado' : 'Novo Feriado'}
          </h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados do feriado
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
            <label htmlFor="nome" className="label">
              Nome do Feriado *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              className="input-field"
              placeholder="Ex: Natal"
              required
            />
          </div>

          <div>
            <label htmlFor="data" className="label">
              Data *
            </label>
            <input
              id="data"
              name="data"
              type="date"
              value={formData.data}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="recorrente"
            name="recorrente"
            type="checkbox"
            checked={formData.recorrente}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="recorrente" className="text-sm font-medium text-gray-700">
            Feriado recorrente (anual)
          </label>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/feriados')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeriadoForm;
