import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (usuario, senha) => {
    try {
      const response = await authService.login(usuario, senha);
      
      const { token, usuario: userData } = response;
      
      if (userData.colaborador) {
        userData.colaboradorId = userData.colaborador.id;
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasPermission = (requiredType) => {
    if (!user) return false;
    
    if (requiredType === 'ADMINISTRADOR') {
      return user.tipo === 'ADMINISTRADOR';
    }
    
    return true;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
