import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  UserCog,
  Calendar,
  Clock,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: Home,
      show: true
    },
    {
      path: '/colaboradores',
      label: 'Colaboradores',
      icon: Users,
      show: hasPermission('ADMINISTRADOR')
    },
    {
      path: '/usuarios',
      label: 'Usuários',
      icon: UserCog,
      show: hasPermission('ADMINISTRADOR')
    },
    {
      path: '/feriados',
      label: 'Feriados',
      icon: Calendar,
      show: hasPermission('ADMINISTRADOR')
    },
    {
      path: '/ponto',
      label: 'Registro de Ponto',
      icon: Clock,
      show: true
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-30">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Registro de Ponto
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.usuario}</p>
              <p className="text-xs text-gray-500">
                {user?.tipo === 'ADMINISTRADOR' ? 'Administrador' : 'Colaborador'}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {menuItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                    active
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 text-primary-600" />}
                </Link>
              );
            })}
        </nav>
      </aside>

      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
