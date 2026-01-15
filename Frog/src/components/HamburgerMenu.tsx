import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChefHat, Package, Droplet, ShoppingBag, Home, LogOut, User, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const allMenuItems = [
    {
      id: 'home',
      name: 'Inicio',
      icon: Home,
      path: '/',
      color: 'from-slate-600 to-slate-700',
      roles: ['mesera', 'developer'] // Admin no necesita esto porque tiene su propio dashboard
    },
    {
      id: 'express',
      name: 'Pedidos Express',
      icon: ShoppingBag,
      path: '/express',
      color: 'from-emerald-500 to-emerald-600',
      roles: ['mesera', 'developer']
    },
    {
      id: 'cash-closure',
      name: 'Cierre de Caja',
      icon: Receipt,
      path: '/cash-closure',
      color: 'from-yellow-500 to-orange-500',
      roles: ['mesera', 'developer']
    },
    {
      id: 'refill',
      name: 'Rellenar Recámaras',
      icon: Droplet,
      path: '/refill-storage',
      color: 'from-blue-500 to-cyan-500',
      roles: ['mesera', 'developer']
    },
    {
      id: 'kitchen',
      name: 'Cocina',
      icon: ChefHat,
      path: '/kitchen',
      color: 'from-orange-500 to-red-500',
      roles: ['developer']
    },
    {
      id: 'inventory',
      name: 'Inventario',
      icon: Package,
      path: '/inventory',
      color: 'from-emerald-500 to-teal-500',
      roles: ['developer']
    },
  ];

  // Filtrar menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Menú Lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header del menú */}
          <div className="mb-8 pt-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm">Navegación rápida</p>
          </div>

          {/* Items del menú */}
          <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg scale-105'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white/20' : 'bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-all mb-4"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-semibold text-base">Cerrar Sesión</span>
          </button>

          {/* Footer del menú */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">
              FROG Restaurant © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
