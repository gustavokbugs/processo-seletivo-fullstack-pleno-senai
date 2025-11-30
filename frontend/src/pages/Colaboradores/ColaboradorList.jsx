import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colaboradorService } from '../../services/index.js';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.jsx';

const ColaboradorList = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await colaboradorService.getAll();
      setColaboradores(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await colaboradorService.delete(deleteModal.id);
      setColaboradores(colaboradores.filter(c => c.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      setError(err.message || 'Erro ao excluir colaborador');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
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
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-600 mt-1">Gerencie os colaboradores da empresa</p>
        </div>
        
        <button
          onClick={() => navigate('/colaboradores/novo')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Inserir novo colaborador
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
                <th className="table-header-cell">Matrícula</th>
                <th className="table-header-cell">CPF</th>
                <th className="table-header-cell">Nome</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Cargo</th>
                <th className="table-header-cell">Admissão</th>
                <th className="table-header-cell">Ativo</th>
                <th className="table-header-cell">Ações</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {colaboradores.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-cell text-center text-gray-500">
                    Nenhum colaborador cadastrado
                  </td>
                </tr>
              ) : (
                colaboradores.map((colaborador) => (
                  <tr key={colaborador.id}>
                    <td className="table-cell">{colaborador.id}</td>
                    <td className="table-cell">{colaborador.cpf}</td>
                    <td className="table-cell font-medium">{colaborador.nome}</td>
                    <td className="table-cell">{colaborador.email}</td>
                    <td className="table-cell">{colaborador.cargo?.nome || '-'}</td>
                    <td className="table-cell">{formatDate(colaborador.dataAdmissao)}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          colaborador.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {colaborador.ativo ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/colaboradores/editar/${colaborador.id}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: colaborador.id })}
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
        message="Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita."
        loading={deleting}
      />
    </div>
  );
};

export default ColaboradorList;
