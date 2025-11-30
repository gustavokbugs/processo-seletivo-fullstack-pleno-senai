import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import ColaboradorList from './pages/Colaboradores/ColaboradorList';
import ColaboradorForm from './pages/Colaboradores/ColaboradorForm';
import UsuarioList from './pages/Usuarios/UsuarioList';
import UsuarioForm from './pages/Usuarios/UsuarioForm';
import FeriadoList from './pages/Feriados/FeriadoList';
import FeriadoForm from './pages/Feriados/FeriadoForm';
import RegistroPonto from './pages/RegistroPonto/RegistroPonto';

const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bem-vindo!</h3>
        <p className="text-gray-600">Sistema de Registro de Ponto</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            <Route
              path="colaboradores"
              element={
                <ProtectedRoute requireAdmin>
                  <ColaboradorList />
                </ProtectedRoute>
              }
            />
            <Route
              path="colaboradores/novo"
              element={
                <ProtectedRoute requireAdmin>
                  <ColaboradorForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="colaboradores/editar/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <ColaboradorForm />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="usuarios"
              element={
                <ProtectedRoute requireAdmin>
                  <UsuarioList />
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios/novo"
              element={
                <ProtectedRoute requireAdmin>
                  <UsuarioForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios/editar/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <UsuarioForm />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="feriados"
              element={
                <ProtectedRoute requireAdmin>
                  <FeriadoList />
                </ProtectedRoute>
              }
            />
            <Route
              path="feriados/novo"
              element={
                <ProtectedRoute requireAdmin>
                  <FeriadoForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="feriados/editar/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <FeriadoForm />
                </ProtectedRoute>
              }
            />
            
            <Route path="ponto" element={<RegistroPonto />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
