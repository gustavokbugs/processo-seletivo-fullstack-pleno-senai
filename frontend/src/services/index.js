import api from './api';

export const authService = {
  login: async (usuario, senha) => {
    const response = await api.post('/auth/login', { usuario, senha });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  hasPermission: (requiredType) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    
    if (requiredType === 'ADMINISTRADOR') {
      return user.tipo === 'ADMINISTRADOR';
    }
    
    return true;
  }
};

export const colaboradorService = {
  getAll: async () => {
    const response = await api.get('/colaboradores');
    return response.data.colaboradores || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/colaboradores/${id}`);
    return response.data.colaborador || response.data;
  },

  create: async (data) => {
    const response = await api.post('/colaboradores', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/colaboradores/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/colaboradores/${id}`);
    return response.data;
  },

  checkCpf: async (cpf) => {
    const response = await api.get(`/colaboradores/check-cpf?cpf=${cpf}`);
    return response.data;
  }
};

export const usuarioService = {
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data.usuarios || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data.usuario || response.data;
  },

  create: async (data) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  checkUsername: async (username) => {
    const response = await api.get(`/usuarios/check-username?usuario=${username}`);
    return response.data;
  }
};

export const feriadoService = {
  getAll: async () => {
    const response = await api.get('/feriados');
    return response.data.feriados || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/feriados/${id}`);
    return response.data.feriado || response.data;
  },

  create: async (data) => {
    const response = await api.post('/feriados', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/feriados/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/feriados/${id}`);
    return response.data;
  }
};

export const pontoService = {
  registrar: async (data) => {
    const response = await api.post('/ponto/registrar', data);
    return response.data;
  },

  getMeusRegistros: async (data = null) => {
    const url = data ? `/ponto/meus-registros?data=${data}` : '/ponto/meus-registros';
    const response = await api.get(url);
    return response.data.registros || response.data;
  },

  getRegistrosHoje: async () => {
    const response = await api.get('/ponto/hoje');
    return response.data.registros || response.data;
  }
};

export const cargoService = {
  getAll: async () => {
    const response = await api.get('/cargos');
    return response.data.cargos || response.data;
  }
};

export const funcaoService = {
  getAll: async () => {
    const response = await api.get('/funcoes');
    return response.data.funcoes || response.data;
  }
};
