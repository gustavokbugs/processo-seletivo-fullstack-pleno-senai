import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feriadoService } from '../../services/index.js';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.jsx';

const FeriadoList = () => {
  const [feriados, setFeriados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadFeriados();
  }, []);

  const loadFeriados = async () => {
    try {
      setLoading(true);
      const data = await feriadoService.getAll();
      setFeriados(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar feriados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await feriadoService.delete(deleteModal.id);
      setFeriados(feriados.filter(f => f.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      setError(err.message || 'Erro ao excluir feriado');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feriados</h1>
          <p className="text-gray-600 mt-1">Gerencie os feriados da empresa</p>
        </div>
        
        <button
          onClick={() => navigate('/feriados/novo')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Inserir novo feriado
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">ID</th>
                <th className="table-header-cell">Data</th>
                <th className="table-header-cell">Descrição</th>
                <th className="table-header-cell">Ações</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {feriados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="table-cell text-center text-gray-500">
                    Nenhum feriado cadastrado
                  </td>
                </tr>
              ) : (
                feriados.map((feriado) => (
                  <tr key={feriado.id}>
                    <td className="table-cell">{feriado.id}</td>
                    <td className="table-cell font-medium">{formatDate(feriado.data)}</td>
                    <td className="table-cell">{feriado.descricao}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/feriados/editar/${feriado.id}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: feriado.id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este feriado? Esta ação não pode ser desfeita."
        loading={deleting}
      />
    </div>
  );
};

export default FeriadoList;
