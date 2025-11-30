import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usuarioService } from '../../services/index.js';
import { Save, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const UsuarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'COLABORADOR'
  });

  useEffect(() => {
    if (isEdit) {
      loadUsuario();
    }
  }, [id]);

  const loadUsuario = async () => {
    try {
      setLoading(true);
      const data = await usuarioService.getById(id);
      setFormData({
        usuario: data.usuario,
        senha: '',
        confirmarSenha: '',
        tipo: data.tipo
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'senha') {
      if (value.length > 0 && value.length < 8) {
        setError('Senha deve ter no mínimo 8 caracteres');
      } else if (formData.confirmarSenha && value !== formData.confirmarSenha) {
        setError('As senhas não coincidem');
      } else {
        setError('');
      }
    }

    if (name === 'confirmarSenha') {
      if (value !== formData.senha) {
        setError('As senhas não coincidem');
      } else {
        setError('');
      }
    }
  };

  const handleUsernameBlur = async () => {
    if (!isEdit && formData.usuario.length >= 3) {
      try {
        const result = await usuarioService.checkUsername(formData.usuario);
        setUsernameAvailable(result.disponivel);
        if (!result.disponivel) {
          setError('Nome de usuário já existe');
        } else if (!error.includes('senha')) {
          setError('');
        }
      } catch (err) {
        setError('Erro ao verificar nome de usuário');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isEdit && usernameAvailable === false) {
      setError('Nome de usuário já existe');
      return;
    }

    if (!isEdit && formData.senha.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!isEdit && formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (isEdit && formData.senha && formData.senha.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (isEdit && formData.senha && formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        usuario: formData.usuario,
        tipo: formData.tipo
      };

      if (formData.senha) {
        dataToSend.senha = formData.senha;
      }

      if (isEdit) {
        await usuarioService.update(id, dataToSend);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        await usuarioService.create(dataToSend);
        setSuccess('Usuário criado com sucesso!');
      }

      setTimeout(() => navigate('/usuarios'), 1500);
    } catch (err) {
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/usuarios')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados do usuário
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

      {!isEdit && usernameAvailable === true && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">Nome de usuário disponível</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="usuario" className="label">
              Usuário *
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              value={formData.usuario}
              onChange={handleChange}
              onBlur={handleUsernameBlur}
              className="input-field"
              placeholder="nome_usuario"
              required
              disabled={isEdit}
            />
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                Nome de usuário não pode ser alterado
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tipo" className="label">
              Tipo de Usuário *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="COLABORADOR">Colaborador</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div>
            <label htmlFor="senha" className="label">
              Senha {!isEdit && '*'}
            </label>
            <div className="relative">
              <input
                id="senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="Mínimo 8 caracteres"
                required={!isEdit}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para manter a senha atual
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmarSenha" className="label">
              Confirme a Senha {!isEdit && '*'}
            </label>
            <div className="relative">
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="Digite a senha novamente"
                required={!isEdit}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading || (!isEdit && usernameAvailable === false)}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsuarioForm;
