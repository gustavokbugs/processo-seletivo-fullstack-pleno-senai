import React, { useState, useEffect } from 'react';
import { pontoService } from '../../services/index.js';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, MapPin, Calendar, AlertCircle, CheckCircle, LogIn, LogOut } from 'lucide-react';

const RegistroPonto = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');
  const [registros, setRegistros] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadRegistrosHoje();

    getLocation();

    return () => clearInterval(timer);
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setLocation({
            latitude: -27.5954,
            longitude: -48.5480
          });
        }
      );
    } else {
      setLocation({
        latitude: -27.5954,
        longitude: -48.5480
      });
    }
  };

  const loadRegistrosHoje = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const data = await pontoService.getMeusRegistros(hoje);
      setRegistros(data || []);
    } catch (err) {
      console.error('Erro ao carregar registros:', err);
      setRegistros([]);
    }
  };

  const handleRegistrarPonto = async () => {
    setError('');
    setSuccess('');
    setWarning('');
    setLoading(true);

    if (!location) {
      setError('Não foi possível obter sua localização');
      setLoading(false);
      return;
    }

    try {
      const dataRegistro = {
        latitude: location.latitude,
        longitude: location.longitude
      };

      const response = await pontoService.registrar(dataRegistro);
      
      setSuccess('Ponto registrado com sucesso!');
      
      if (response.warnings && response.warnings.length > 0) {
        setWarning(response.warnings.join('\n'));
      }

      await loadRegistrosHoje();
      
    } catch (err) {
      setError(err.message || 'Erro ao registrar ponto');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRegistroTime = (dataHora) => {
    return new Date(dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const entradas = registros.filter(r => r.tipo === 'ENTRADA');
  const saidas = registros.filter(r => r.tipo === 'SAIDA');

  if (!user?.colaboradorId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Ponto</h1>
          <p className="text-gray-600">Registre sua entrada e saída</p>
        </div>

        <div className="card text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-4">
            Apenas usuários com vínculo de colaborador podem registrar ponto.
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com o administrador para vincular sua conta a um colaborador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Ponto</h1>
        <p className="text-gray-600">Registre sua entrada e saída</p>
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

      {warning && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 whitespace-pre-line">{warning}</div>
        </div>
      )}

      <div className="card mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <p className="text-lg text-gray-700 capitalize">
            {formatDate(currentTime)}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <Clock className="w-8 h-8 text-primary-600" />
          <p className="text-5xl font-bold text-gray-900 font-mono">
            {formatTime(currentTime)}
          </p>
        </div>

        <button
          onClick={handleRegistrarPonto}
          disabled={loading || !location}
          className="btn-primary text-lg py-4 px-8 mx-auto"
        >
          {loading ? 'Registrando...' : 'Registrar Ponto'}
        </button>
      </div>

      {location && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Localização Atual</h2>
          </div>
          <div className="text-sm text-gray-600">
            <p>Latitude: {location.latitude.toFixed(6)}</p>
            <p>Longitude: {location.longitude.toFixed(6)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Entradas</h2>
          </div>
          
          {entradas.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma entrada registrada hoje</p>
          ) : (
            <div className="space-y-2">
              {entradas.map((registro, index) => (
                <div
                  key={registro.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}ª Entrada
                  </span>
                  <span className="text-lg font-bold text-green-700 font-mono">
                    {formatRegistroTime(registro.dataHora)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Saídas</h2>
          </div>
          
          {saidas.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma saída registrada hoje</p>
          ) : (
            <div className="space-y-2">
              {saidas.map((registro, index) => (
                <div
                  key={registro.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}ª Saída
                  </span>
                  <span className="text-lg font-bold text-red-700 font-mono">
                    {formatRegistroTime(registro.dataHora)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroPonto;
